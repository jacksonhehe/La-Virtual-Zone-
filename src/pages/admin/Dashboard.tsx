import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  BarChart,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw,
  Settings,
  ShoppingCart,
  Trophy,
  TrendingUp,
  Users,
  Wifi
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { listUsers } from '../../utils/authService';
import { formatCurrency, formatDate } from '../../utils/format';
import { adjustAllPlayerMarketValues, adjustAllPlayerSalaries } from '../../utils/marketRules';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import MarketToggleModal from '../../components/admin/MarketToggleModal';

// Refresca un jugador puntual desde Supabase
const refreshPlayerFromSupabase = async (playerId: string) => {
  console.log(`Refrescando jugador ${playerId} desde Supabase...`);

  try {
    const { getSupabaseClient } = await import('../../lib/supabase');
    const client = getSupabaseClient();

    const { data: supabasePlayer, error } = await client.from('players').select('*').eq('id', playerId).single();

    if (error) {
      console.error('Error obteniendo jugador de Supabase:', error.message);
      return;
    }

    if (!supabasePlayer) {
      console.log('Jugador no encontrado en Supabase');
      return;
    }

    console.log('Datos de Supabase:', supabasePlayer);

    const dataStore = await import('../../store/dataStore').then(m => m.useDataStore.getState());
    const currentPlayers = dataStore.players;

    const updatedPlayers = currentPlayers.map(player =>
      player.id === playerId ? { ...player, clubId: supabasePlayer.club_id } : player
    );

    await dataStore.updatePlayers(updatedPlayers);

    console.log(`Jugador ${playerId} actualizado. Nuevo clubId: ${supabasePlayer.club_id}`);
    return true;
  } catch (error) {
    console.error('Error refrescando jugador:', error);
    return false;
  }
};

// Verifica el estado de conexion a Supabase
const checkSupabaseConnection = async () => {
  console.log('Verificando conexion a Supabase...');

  try {
    const { config } = await import('../../lib/config');

    console.log('Estado de configuracion:');
    console.log('   useSupabase:', config.useSupabase);
    console.log('   URL configurada:', !!config.supabase.url);
    console.log('   AnonKey configurada:', !!config.supabase.anonKey);

    if (!config.useSupabase) {
      console.log('Supabase esta DESHABILITADO');
      return { connected: false, message: 'Supabase esta deshabilitado' };
    }

    if (!config.supabase.url || !config.supabase.anonKey) {
      console.log('Faltan variables de entorno de Supabase');
      return { connected: false, message: 'Faltan credenciales de Supabase' };
    }

    // Consulta simple para validar conexion
    const { getSupabaseClient } = await import('../../lib/supabase');
    const client = getSupabaseClient();

    console.log('Probando conexion...');

    const { data, error } = await client.from('profiles').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Error de conexion:', error.message);
      return { connected: false, message: `Error: ${error.message}` };
    }

    console.log('Conexion exitosa a Supabase');
    console.log('   Registros en profiles:', data);

    return { connected: true, message: 'Conectado correctamente' };
  } catch (error: any) {
    console.error('Error inesperado:', error);
    return { connected: false, message: `Error inesperado: ${error.message}` };
  }
};

// Sincroniza todos los jugadores desde Supabase
const syncAllPlayersFromSupabase = async () => {
  console.log('Sincronizando todos los jugadores desde Supabase...');

  try {
    const { getSupabaseClient } = await import('../../lib/supabase');
    const client = getSupabaseClient();

    const { data: supabasePlayers, error } = await client.from('players').select('*');

    if (error) {
      console.error('Error obteniendo jugadores de Supabase:', error.message);
      return false;
    }

    if (!supabasePlayers || supabasePlayers.length === 0) {
      console.log('No se encontraron jugadores en Supabase');
      return false;
    }

    console.log(`Obtenidos ${supabasePlayers.length} jugadores de Supabase`);

    const dataStore = await import('../../store/dataStore').then(m => m.useDataStore.getState());
    const currentPlayers = dataStore.players;

    let updatedCount = 0;

    const updatedPlayers = currentPlayers.map(player => {
      const supabasePlayer = supabasePlayers.find(sp => sp.id === player.id);
      if (supabasePlayer && supabasePlayer.club_id !== player.clubId) {
        updatedCount++;
        return { ...player, clubId: supabasePlayer.club_id };
      }
      return player;
    });

    if (updatedCount > 0) {
      await dataStore.updatePlayers(updatedPlayers);
      console.log(`Sincronizacion completada: ${updatedCount} jugadores actualizados`);
      return true;
    } else {
      console.log('Todos los jugadores ya estaban sincronizados');
      return true;
    }
  } catch (error) {
    console.error('Error sincronizando jugadores:', error);
    return false;
  }
};

type ToastType = 'success' | 'error' | 'info';

const Card = ({
  label,
  value,
  accent = 'text-white',
  helper
}: {
  label: string;
  value: number | string;
  accent?: string;
  helper?: string;
}) => (
  <div className="card p-6">
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <h3 className={`text-2xl font-bold ${accent}`}>{value}</h3>
    {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
  </div>
);

const ActionButton = ({
  label,
  icon,
  onClick,
  tone = 'default',
  busy = false,
  helper
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  tone?: 'default' | 'info' | 'danger' | 'success';
  busy?: boolean;
  helper?: string;
}) => {
  const base =
    'w-full text-left bg-transparent border rounded-lg p-3 transition-all flex flex-col gap-1 hover:-translate-y-0.5';

  const tones: Record<'default' | 'info' | 'danger' | 'success', string> = {
    default: 'border-gray-700 text-gray-200 hover:bg-gray-800',
    info: 'border-cyan-500 text-cyan-200 hover:bg-cyan-500/10',
    danger: 'border-red-500 text-red-200 hover:bg-red-500/10',
    success: 'border-emerald-500 text-emerald-200 hover:bg-emerald-500/10'
  };

  return (
    <button className={`${base} ${tones[tone]}`} onClick={onClick} disabled={busy}>
      <div className="flex items-center gap-2">
        {busy ? <Loader2 size={16} className="animate-spin" /> : icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {helper && <span className="text-xs text-gray-400">{helper}</span>}
    </button>
  );
};

const Toast = ({ type, message, onClose }: { type: ToastType; message: string; onClose: () => void }) => {
  const styles =
    type === 'success'
      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100'
      : type === 'error'
      ? 'border-red-500/50 bg-red-500/10 text-red-100'
      : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-100';

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertTriangle : AlertCircle;

  return (
    <div className={`mb-4 border rounded-lg p-4 flex items-start justify-between gap-3 ${styles}`}>
      <div className="flex gap-3">
        <Icon size={18} className="mt-0.5" />
        <p className="text-sm whitespace-pre-line">{message}</p>
      </div>
      <button className="text-xs text-gray-300 hover:text-white" onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    marketStatus,
    updateMarketStatus,
    clubs,
    players,
    tournaments,
    offers,
    transfers,
    posts,
    forceUpdateFromSeedData,
    refreshClubsFromSeed,
    refreshPlayersFromSeed
  } = useDataStore();
  const users = (() => {
    try {
      return listUsers();
    } catch {
      return [];
    }
  })();

  const [toast, setToast] = useState<null | { type: ToastType; text: string }>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<null | { title: string; message: string; action: () => Promise<void> | void }>(null);
  const [marketConfirm, setMarketConfirm] = useState<null | { next: boolean }>(null);
  const [marketToggling, setMarketToggling] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const withFeedback = async (key: string, action: () => Promise<boolean | void> | boolean | void, success: string, error: string) => {
    setBusyAction(key);
    try {
      const result = await action();
      if (result === false) {
        setToast({ type: 'error', text: error });
      } else {
        setToast({ type: 'success', text: success });
      }
    } catch (err: any) {
      setToast({ type: 'error', text: `${error}${err?.message ? ` (${err.message})` : ''}` });
    } finally {
      setBusyAction(null);
    }
  };

  const requestMarketToggle = () => {
    setMarketConfirm({ next: !marketStatus });
  };

  const handleConfirmMarketToggle = async () => {
    if (!marketConfirm || marketToggling) return;
    const next = marketConfirm.next;

    try {
      setMarketToggling(true);
      await withFeedback(
        'market-toggle',
        () => {
          updateMarketStatus(next);
        },
        `Mercado ${next ? 'abierto' : 'cerrado'}`,
        'No se pudo cambiar el estado del mercado'
      );
    } finally {
      setMarketToggling(false);
      setMarketConfirm(null);
    }
  };

  const handleAdjustSalaries = () => {
    setConfirmation({
      title: 'Ajustar salarios',
      message: 'Recalcularemos los salarios de todos los jugadores segun las tablas de mercado. Esta accion no se puede deshacer.',
      action: async () => {
        const result = adjustAllPlayerSalaries();
        if (result.updated > 0) {
          setToast({
            type: 'success',
            text: `Salarios ajustados para ${result.updated} jugadores.\nCosto total anual: $${(result.totalCost / 1_000_000).toFixed(1)}M`
          });
        } else {
          setToast({ type: 'info', text: 'Los salarios ya estaban al dia segun las tablas.' });
        }
      }
    });
  };

  const handleAdjustMarketValues = () => {
    setConfirmation({
      title: 'Ajustar valores de mercado',
      message: 'Actualizaremos el valor de mercado de todos los jugadores segun las tablas de mercado.',
      action: async () => {
        const result = adjustAllPlayerMarketValues();
        if (result.updated > 0) {
          setToast({
            type: 'success',
            text: `Valores actualizados para ${result.updated} jugadores.\nValor total: $${(result.totalValue / 1_000_000).toFixed(1)}M`
          });
        } else {
          setToast({ type: 'info', text: 'Los valores de mercado ya estaban actualizados.' });
        }
      }
    });
  };

  const handleForceUpdateFromSeed = () => {
    setConfirmation({
      title: 'Actualizar todo (semilla original)',
      message: 'Se reemplazaran clubes y jugadores con los datos originales. Usalo solo si quieres resetear el sistema.',
      action: () =>
        withFeedback(
          'force-update',
          () => {
            forceUpdateFromSeedData();
          },
          'Datos restaurados desde la semilla original',
          'No se pudieron restaurar los datos'
        )
    });
  };

  const handleRefreshClubs = () => {
    setConfirmation({
      title: 'Actualizar clubes',
      message: 'Sobrescribira los clubes actuales con los 40 clubes originales.',
      action: () =>
        withFeedback(
          'refresh-clubs',
          () => {
            refreshClubsFromSeed();
          },
          'Clubes actualizados (40 clubes restaurados)',
          'No se pudieron actualizar los clubes'
        )
    });
  };

  const handleRefreshPlayers = () => {
    setConfirmation({
      title: 'Actualizar jugadores',
      message: 'Sobrescribira los jugadores actuales con los 920 jugadores originales.',
      action: () =>
        withFeedback(
          'refresh-players',
          () => {
            refreshPlayersFromSeed();
          },
          'Jugadores actualizados (920 jugadores restaurados)',
          'No se pudieron actualizar los jugadores'
        )
    });
  };

  const handleCheckSupabaseConnection = () =>
    withFeedback(
      'check-supabase',
      async () => {
        const result = await checkSupabaseConnection();
        setToast({
          type: result.connected ? 'success' : 'error',
          text: result.connected ? `Supabase OK: ${result.message}` : `Supabase: ${result.message}`
        });
        return result.connected;
      },
      'Supabase verificado',
      'No se pudo verificar Supabase'
    );

  const handleSyncFromSupabase = () => {
    setConfirmation({
      title: 'Sincronizar con Supabase',
      message: 'Actualizaremos las asignaciones de clubes de los jugadores segun Supabase. No modifica otros datos.',
      action: () =>
        withFeedback(
          'sync-supabase',
          async () => {
            const success = await syncAllPlayersFromSupabase();
            return success;
          },
          'Sincronizacion completada desde Supabase',
          'No se pudo sincronizar con Supabase'
        )
    });
  };

  const handleVerifyData = () => {
    const expectedClubs = 40;
    const expectedPlayers = 920;
    const currentClubs = clubs.length;
    const currentPlayers = players.length;

    const message = `Verificacion de datos:

Clubes: ${currentClubs}/${expectedClubs} ${currentClubs === expectedClubs ? '[OK]' : '[Revisar]'}
Jugadores: ${currentPlayers}/${expectedPlayers} ${currentPlayers === expectedPlayers ? '[OK]' : '[Revisar]'}`;

    setToast({
      type: currentClubs === expectedClubs && currentPlayers === expectedPlayers ? 'success' : 'info',
      text: message
    });
  };

  const recent = useMemo(() => {
    const items: Array<{ date: string; icon: 'transfer' | 'offer' | 'tournament' | 'post'; title: string; desc: string }> = [];
    (transfers || []).forEach(t => {
        items.push({
          date: t.date,
          icon: 'transfer',
          title: 'Transferencia realizada',
          desc: `${t.playerName} -> ${t.fromClub} <-> ${t.toClub} | ${formatCurrency(t.fee)}`
        });
      });
    (offers || []).forEach(o => {
      items.push({
        date: o.date,
        icon: 'offer',
        title: `Oferta ${o.status === 'accepted' ? 'aceptada' : o.status === 'rejected' ? 'rechazada' : 'enviada'}`,
        desc: `${o.playerName} -> ${o.fromClub} <-> ${o.toClub} | ${formatCurrency(o.amount)}`
      });
    });
    (tournaments || []).forEach(t => {
      items.push({
        date: t.startDate,
        icon: 'tournament',
        title: 'Torneo programado',
        desc: `${t.name} | ${t.type === 'league' ? 'Liga' : t.type === 'cup' ? 'Copa' : 'Amistoso'}`
      });
    });
    (posts || []).forEach(p => {
      items.push({
        date: p.date,
        icon: 'post',
        title: 'Nueva noticia',
        desc: `${p.title} | ${p.author}`
      });
    });
    return items
      .filter(i => !!i.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [transfers, offers, tournaments, posts]);

  const primaryActions = [
    {
      key: 'usuarios',
      label: 'Usuarios',
      icon: <Users size={18} />,
      onClick: () => navigate('usuarios')
    },
    {
      key: 'crear-torneo',
      label: 'Crear torneo',
      icon: <Trophy size={18} />,
      onClick: () => navigate('torneos?new=1')
    },
    {
      key: 'crear-noticia',
      label: 'Crear noticia',
      icon: <FileText size={18} />,
      onClick: () => navigate('noticias?new=1')
    },
    {
      key: 'jugadores',
      label: 'Gestionar jugadores',
      icon: <Users size={18} />,
      onClick: () => navigate('jugadores')
    },
    {
      key: 'calendario',
      label: 'Calendario',
      icon: <Calendar size={18} />,
      onClick: () => navigate('calendario')
    },
    {
      key: 'mercado',
      label: marketStatus ? 'Cerrar mercado' : 'Abrir mercado',
      icon: <ShoppingCart size={18} />,
      onClick: requestMarketToggle
    }
  ];

  const maintenanceActions = [
    {
      key: 'adjust-salaries',
      label: 'Ajustar salarios',
      icon: <DollarSign size={18} />,
      helper: 'Recalcula segun tablas de mercado',
      onClick: handleAdjustSalaries
    },
    {
      key: 'adjust-values',
      label: 'Ajustar valores',
      icon: <TrendingUp size={18} />,
      helper: 'Actualiza valor de mercado',
      onClick: handleAdjustMarketValues
    }
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Controla el panel admin, sincronizaciones y mercado."
        actions={
          <div className="flex items-center gap-3">
          <AdminStatusBadge
            label={`Mercado ${marketStatus ? 'abierto' : 'cerrado'}`}
            tone={marketStatus ? 'success' : 'danger'}
            withDot
          />
          <button className="btn-outline py-2 px-3" onClick={requestMarketToggle}>
            {marketStatus ? 'Cerrar' : 'Abrir'} mercado
          </button>
          </div>
        }
      />

      {toast && <Toast type={toast.type} message={toast.text} onClose={() => setToast(null)} />}

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card label="Usuarios totales" value={users.length || '-'} helper={!users.length ? 'Sin datos cargados' : undefined} />
        <Card
          label="Clubes activos"
          value={clubs.length || '-'}
          accent={clubs.length === 40 ? 'text-green-500' : 'text-yellow-500'}
          helper="Esperado: 40 clubes"
        />
        <Card
          label="Jugadores"
          value={players.length || '-'}
          accent={players.length === 920 ? 'text-green-500' : 'text-yellow-500'}
          helper="Esperado: 920 jugadores"
        />
        <Card label="Torneos" value={tournaments.length || '-'} />
        <Card label="Transferencias" value={transfers.length || '-'} />
        <Card label="Ofertas" value={offers.length || '-'} />
        <Card label="Noticias" value={posts.length || '-'} />
        <Card label="Calendario" value={tournaments.length ? 'Programado' : 'Sin eventos'} accent="text-gray-200" />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Acciones rapidas</h3>
            <span className="text-xs text-gray-400">Solo lo esencial</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {primaryActions.map(action => (
              <ActionButton
                key={action.key}
                label={action.label}
                icon={action.icon}
                onClick={action.onClick}
                busy={busyAction === action.key}
              />
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              Mantenimiento
            </h3>
            <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
              Acciones sensibles
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {maintenanceActions.map(action => (
              <ActionButton
                key={action.key}
                label={action.label}
                icon={action.icon}
                onClick={action.onClick}
                helper={action.helper}
                tone={action.key === 'check-supabase' ? 'info' : action.key === 'verificar' ? 'info' : 'danger'}
                busy={busyAction === action.key}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Actividad reciente</h3>
          <span className="text-xs text-gray-400">Ultimos 10 eventos</span>
        </div>
        <div className="card overflow-hidden">
          {recent.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Sin actividad reciente.</div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {recent.map((ev, idx) => (
                <li key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {ev.icon === 'transfer' || ev.icon === 'offer' ? (
                        <ShoppingCart size={18} className="text-primary" />
                      ) : ev.icon === 'tournament' ? (
                        <Trophy size={18} className="text-secondary" />
                      ) : (
                        <FileText size={18} className="text-secondary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{ev.title}</p>
                      <p className="text-sm text-gray-400">{ev.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(ev.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setConfirmation(null)}></div>
          <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h4 className="text-lg font-semibold mb-2">{confirmation.title}</h4>
            <p className="text-gray-300 mb-4 whitespace-pre-line">{confirmation.message}</p>
            <div className="flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setConfirmation(null)}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  await confirmation.action();
                  setConfirmation(null);
                }}
                disabled={busyAction !== null}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {marketConfirm && (
        <MarketToggleModal
          next={marketConfirm.next}
          toggling={marketToggling}
          onCancel={() => {
            if (!marketToggling) setMarketConfirm(null);
          }}
          onConfirm={() => {
            void handleConfirmMarketToggle();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

