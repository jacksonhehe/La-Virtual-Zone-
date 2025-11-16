import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, Trophy, Settings, FileText, BarChart, Calendar, DollarSign, TrendingUp, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { listUsers } from '../../utils/authService';
import { formatCurrency, formatDate } from '../../utils/format';
import { adjustAllPlayerSalaries, adjustAllPlayerMarketValues } from '../../utils/marketRules';

// Función para refrescar datos desde Supabase
const refreshPlayerFromSupabase = async (playerId: string) => {
  console.log(`🔄 Refrescando jugador ${playerId} desde Supabase...`);

  try {
    const { getSupabaseClient } = await import('../../lib/supabase');
    const client = getSupabaseClient();

    const { data: supabasePlayer, error } = await client
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo jugador de Supabase:', error.message);
      return;
    }

    if (!supabasePlayer) {
      console.log('⚠️ Jugador no encontrado en Supabase');
      return;
    }

    console.log('📥 Datos de Supabase:', supabasePlayer);

    const dataStore = await import('../../store/dataStore').then(m => m.useDataStore.getState());
    const currentPlayers = dataStore.players;

    const updatedPlayers = currentPlayers.map(player =>
      player.id === playerId ? { ...player, clubId: supabasePlayer.club_id } : player
    );

    await dataStore.updatePlayers(updatedPlayers);

    console.log(`✅ Jugador ${playerId} actualizado. Nuevo clubId: ${supabasePlayer.club_id}`);
    return true;

  } catch (error) {
    console.error('❌ Error refrescando jugador:', error);
    return false;
  }
};

// Función para verificar estado de conexión a Supabase
const checkSupabaseConnection = async () => {
  console.log('🔍 Verificando conexión a Supabase...');

  try {
    const { config } = await import('../../lib/config');

    console.log('📋 Estado de configuración:');
    console.log('   useSupabase:', config.useSupabase);
    console.log('   URL configurada:', !!config.supabase.url);
    console.log('   AnonKey configurada:', !!config.supabase.anonKey);

    if (!config.useSupabase) {
      console.log('❌ Supabase está DESHABILITADO');
      return { connected: false, message: 'Supabase está deshabilitado' };
    }

    if (!config.supabase.url || !config.supabase.anonKey) {
      console.log('❌ Faltan variables de entorno de Supabase');
      return { connected: false, message: 'Faltan credenciales de Supabase' };
    }

    // Intentar hacer una consulta simple
    const { getSupabaseClient } = await import('../../lib/supabase');
    const client = getSupabaseClient();

    console.log('🔧 Probando conexión...');

    // Hacer una consulta simple a la tabla profiles para verificar conexión
    const { data, error } = await client
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return { connected: false, message: `Error: ${error.message}` };
    }

    console.log('✅ Conexión exitosa a Supabase');
    console.log('   Registros en profiles:', data);

    return { connected: true, message: 'Conectado correctamente' };

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return { connected: false, message: `Error inesperado: ${error.message}` };
  }
};

// Función para sincronizar todos los jugadores desde Supabase
const syncAllPlayersFromSupabase = async () => {
  console.log('🔄 Sincronizando todos los jugadores desde Supabase...');

  try {
    const { getSupabaseClient } = await import('../../lib/supabase');
    const client = getSupabaseClient();

    const { data: supabasePlayers, error } = await client
      .from('players')
      .select('*');

    if (error) {
      console.error('❌ Error obteniendo jugadores de Supabase:', error.message);
      return false;
    }

    if (!supabasePlayers || supabasePlayers.length === 0) {
      console.log('⚠️ No se encontraron jugadores en Supabase');
      return false;
    }

    console.log(`📥 Obtenidos ${supabasePlayers.length} jugadores de Supabase`);

    const dataStore = await import('../../store/dataStore').then(m => m.useDataStore.getState());
    const currentPlayers = dataStore.players;

    // Crear un mapa de jugadores por ID para actualización eficiente
    const playersMap = new Map(currentPlayers.map(p => [p.id, p]));

    let updatedCount = 0;

    // Actualizar clubId de jugadores que existen localmente
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
      console.log(`✅ Sincronización completada: ${updatedCount} jugadores actualizados`);
      return true;
    } else {
      console.log('ℹ️ Todos los jugadores ya están sincronizados');
      return true;
    }

  } catch (error) {
    console.error('❌ Error sincronizando jugadores:', error);
    return false;
  }
};

const Card = ({ label, value, accent = 'text-white' }: { label: string; value: number | string; accent?: string }) => (
  <div className="bg-dark-light rounded-lg p-6 border border-gray-800">
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <h3 className={`text-2xl font-bold ${accent}`}>{value}</h3>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { marketStatus, updateMarketStatus, clubs, players, tournaments, offers, transfers, posts, forceUpdateFromSeedData, refreshClubsFromSeed, refreshPlayersFromSeed } = useDataStore();
  const users = (() => { try { return listUsers(); } catch { return []; } })();
  const [confirm, setConfirm] = useState<null | { next: boolean }>(null);

  const toggleMarket = () => setConfirm({ next: !marketStatus });

  const handleAdjustSalaries = () => {
    const result = adjustAllPlayerSalaries();
    if (result.updated > 0) {
      alert(`✅ Salarios ajustados según tablas de mercado:\n• ${result.updated} jugadores actualizados\n• Costo total: $${(result.totalCost / 1_000_000).toFixed(1)}M anuales`);
    } else {
      alert('ℹ️ Los salarios ya están actualizados según las tablas de mercado.');
    }
  };

  const handleAdjustMarketValues = () => {
    const result = adjustAllPlayerMarketValues();
    if (result.updated > 0) {
      alert(`✅ Valores de mercado ajustados según tablas de mercado:\n• ${result.updated} jugadores actualizados\n• Valor total: $${(result.totalValue / 1_000_000).toFixed(1)}M`);
    } else {
      alert('ℹ️ Los valores de mercado ya están actualizados según las tablas de mercado.');
    }
  };

  const handleForceUpdateFromSeed = () => {
    const confirmed = window.confirm('⚠️ Esta acción actualizará TODOS los datos (clubes, jugadores, etc.) desde los datos originales.\n\n¿Deseas continuar?');
    if (confirmed) {
      forceUpdateFromSeedData();
      alert('✅ Datos actualizados exitosamente desde los datos originales.\n\n• Los cambios se reflejarán inmediatamente en el Panel Admin\n• Se han actualizado clubes y jugadores');
    }
  };

  const handleRefreshClubs = () => {
    const confirmed = window.confirm('¿Actualizar clubes desde los datos originales?\n\nEsto reemplazará los clubes actuales con los 40 clubes del sistema.');
    if (confirmed) {
      refreshClubsFromSeed();
      alert('✅ Clubes actualizados exitosamente.\n\nAhora verás todos los 40 clubes en el Panel Admin.');
    }
  };

  const handleRefreshPlayers = () => {
    const confirmed = window.confirm('¿Actualizar jugadores desde los datos originales?\n\nEsto reemplazará los jugadores actuales con los 920 jugadores generados.');
    if (confirmed) {
      refreshPlayersFromSeed();
      alert('✅ Jugadores actualizados exitosamente.\n\nAhora verás todos los 920 jugadores en el Panel Admin.');
    }
  };

  const handleCheckSupabaseConnection = async () => {
    try {
      const result = await checkSupabaseConnection();
      if (result.connected) {
        alert(`✅ ${result.message}\n\nSupabase está funcionando correctamente.`);
      } else {
        alert(`❌ ${result.message}\n\nRevisa la configuración de Supabase.`);
      }
    } catch (error) {
      console.error('Error verificando conexión:', error);
      alert('❌ Error verificando conexión.\n\nRevisa la consola para más detalles.');
    }
  };

  const handleSyncFromSupabase = async () => {
    const confirmed = window.confirm('¿Sincronizar datos desde Supabase?\n\nEsto actualizará la asignación de clubes de los jugadores según los cambios realizados directamente en Supabase.\n\n⚠️ Solo afecta las asignaciones de club (clubId), no modifica otros datos.');
    if (!confirmed) return;

    try {
      const success = await syncAllPlayersFromSupabase();
      if (success) {
        alert('✅ Sincronización completada.\n\nLos cambios realizados en Supabase ahora se reflejan en la aplicación.');
      } else {
        alert('❌ Error durante la sincronización.\n\nRevisa la consola para más detalles.');
      }
    } catch (error) {
      console.error('Error en sincronización:', error);
      alert('❌ Error durante la sincronización.\n\nRevisa la consola para más detalles.');
    }
  };

  const handleVerifyData = () => {
    const expectedClubs = 40;
    const expectedPlayers = 920;
    const currentClubs = clubs.length;
    const currentPlayers = players.length;

    let message = `📊 VERIFICACIÓN DE DATOS:\n\n`;
    message += `Clubes:\n`;
    message += `  • Actual: ${currentClubs}\n`;
    message += `  • Esperado: ${expectedClubs}\n`;
    message += `  • ✅ Correcto: ${currentClubs === expectedClubs ? 'SÍ' : 'NO'}\n\n`;
    message += `Jugadores:\n`;
    message += `  • Actual: ${currentPlayers}\n`;
    message += `  • Esperado: ${expectedPlayers}\n`;
    message += `  • ✅ Correcto: ${currentPlayers === expectedPlayers ? 'SÍ' : 'NO'}\n\n`;

    if (currentClubs === expectedClubs && currentPlayers === expectedPlayers) {
      message += `🎉 ¡Todos los datos están actualizados correctamente!`;
    } else {
      message += `⚠️ Los datos necesitan actualización.\n`;
      message += `   Usa los botones "Actualizar clubes" o "Actualizar jugadores".`;
    }

    alert(message);
  };

  const recent = useMemo(() => {
    const items: Array<{ date: string; icon: 'transfer'|'offer'|'tournament'|'post'; title: string; desc: string; }> = [];
    // Transfers
    (transfers || []).forEach(t => {
      items.push({
        date: t.date,
        icon: 'transfer',
        title: 'Transferencia realizada',
        desc: `${t.playerName} · ${t.fromClub} → ${t.toClub} · ${formatCurrency(t.fee)}`
      });
    });
    // Offers
    (offers || []).forEach(o => {
      items.push({
        date: o.date,
        icon: 'offer',
        title: `Oferta ${o.status === 'accepted' ? 'aceptada' : o.status === 'rejected' ? 'rechazada' : 'enviada'}`,
        desc: `${o.playerName} · ${o.fromClub} → ${o.toClub} · ${formatCurrency(o.amount)}`
      });
    });
    // Tournaments (use startDate as reference)
    (tournaments || []).forEach(t => {
      items.push({
        date: t.startDate,
        icon: 'tournament',
        title: 'Torneo programado',
        desc: `${t.name} · ${t.type === 'league' ? 'Liga' : t.type === 'cup' ? 'Copa' : 'Amistoso'}`
      });
    });
    // Posts
    (posts || []).forEach(p => {
      items.push({
        date: p.date,
        icon: 'post',
        title: 'Nueva noticia',
        desc: `${p.title} · ${p.author}`
      });
    });
    return items
      .filter(i => !!i.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [transfers, offers, tournaments, posts]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card label="Usuarios totales" value={users.length} />
        <Card
          label="Clubes activos"
          value={clubs.length}
          accent={clubs.length === 40 ? 'text-green-500' : 'text-yellow-500'}
        />
        <Card
          label="Jugadores"
          value={players.length}
          accent={players.length === 920 ? 'text-green-500' : 'text-yellow-500'}
        />
        <Card label="Torneos" value={tournaments.length} />
        <Card label="Transferencias" value={transfers.length} />
        <Card label="Ofertas" value={offers.length} />
        <Card label="Noticias" value={posts.length} />
        <div className="bg-dark-light rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Mercado de fichajes</p>
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${marketStatus ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${marketStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {marketStatus ? 'Abierto' : 'Cerrado'}
            </span>
            <button className="btn-primary" onClick={toggleMarket}>{marketStatus ? 'Cerrar' : 'Abrir'}</button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-xl font-bold mb-4">Acciones rápidas</h3>
        <div className="bg-dark-light rounded-lg border border-gray-800 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('usuarios')}>
              <Users size={18} className="mb-1" />
              <span className="text-sm">Usuarios</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={toggleMarket}>
              <ShoppingCart size={18} className="mb-1" />
              <span className="text-sm">{marketStatus ? 'Cerrar mercado' : 'Abrir mercado'}</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('torneos?new=1')}>
              <Trophy size={18} className="mb-1" />
              <span className="text-sm">Crear torneo</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('torneos')}>
              <Trophy size={18} className="mb-1" />
              <span className="text-sm">Resultados</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('noticias?new=1')}>
              <FileText size={18} className="mb-1" />
              <span className="text-sm">Crear noticia</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('clubes?new=1')}>
              <Trophy size={18} className="mb-1" />
              <span className="text-sm">Nuevo club</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('jugadores?new=1')}>
              <Users size={18} className="mb-1" />
              <span className="text-sm">Nuevo jugador</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center text-emerald-400 border-emerald-400 hover:bg-emerald-500/10" onClick={handleAdjustSalaries}>
              <DollarSign size={18} className="mb-1" />
              <span className="text-sm">Ajustar salarios</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center text-cyan-400 border-cyan-400 hover:bg-cyan-500/10" onClick={handleAdjustMarketValues}>
              <TrendingUp size={18} className="mb-1" />
              <span className="text-sm">Ajustar valores</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center text-cyan-400 border-cyan-400 hover:bg-cyan-500/10" onClick={handleCheckSupabaseConnection}>
              <Wifi size={18} className="mb-1" />
              <span className="text-sm">Check Supabase</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center text-purple-400 border-purple-400 hover:bg-purple-500/10" onClick={handleForceUpdateFromSeed}>
              <Settings size={18} className="mb-1" />
              <span className="text-sm">Actualizar todo</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center text-orange-400 border-orange-400 hover:bg-orange-500/10" onClick={handleSyncFromSupabase}>
              <RefreshCw size={18} className="mb-1" />
              <span className="text-sm">Sync Supabase</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center text-blue-400 border-blue-400 hover:bg-blue-500/10" onClick={handleRefreshClubs}>
              <Trophy size={18} className="mb-1" />
              <span className="text-sm">Actualizar clubes</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center text-green-400 border-green-400 hover:bg-green-500/10" onClick={handleRefreshPlayers}>
              <Users size={18} className="mb-1" />
              <span className="text-sm">Actualizar jugadores</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center text-yellow-400 border-yellow-400 hover:bg-yellow-500/10" onClick={handleVerifyData}>
              <BarChart size={18} className="mb-1" />
              <span className="text-sm">Verificar datos</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('calendario')}>
              <Calendar size={18} className="mb-1" />
              <span className="text-sm">Calendario</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('estadisticas')}>
              <BarChart size={18} className="mb-1" />
              <span className="text-sm">Estadísticas</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('jugadores')}>
              <Users size={18} className="mb-1" />
              <span className="text-sm">Gestionar jugadores</span>
            </button>
            <button className="btn-outline py-3 flex flex-col items-center justify-center" onClick={() => navigate('tablas-mercado')}>
              <BarChart size={18} className="mb-1" />
              <span className="text-sm">Tablas de mercado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Actividad reciente</h3>
        <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
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

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setConfirm(null)}></div>
          <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h4 className="text-lg font-semibold mb-2">Confirmar</h4>
            <p className="text-gray-300 mb-4">¿Seguro que quieres {confirm.next ? 'abrir' : 'cerrar'} el mercado?</p>
            <div className="flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn-primary" onClick={() => { updateMarketStatus(confirm.next); setConfirm(null); }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
