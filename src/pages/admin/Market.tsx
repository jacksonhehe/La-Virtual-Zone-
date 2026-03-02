import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { config } from '../../lib/config';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import MarketToggleModal from '../../components/admin/MarketToggleModal';

const AdminMarket = () => {
  const {
    marketStatus,
    updateMarketStatus,
    transfers,
    offers,
    clubs,
    refreshOffers,
    refreshTransfers,
    refreshMarketStatus
  } = useDataStore();
  const [confirm, setConfirm] = useState<null | { next: boolean }>(null);
  const [syncing, setSyncing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const clubByName = useMemo(() => {
    const map = new Map<string, string | undefined>();
    clubs.forEach((club) => {
      map.set(club.name, club.logo);
    });
    return map;
  }, [clubs]);

  const showNotification = useCallback((type: 'success' | 'error', message: string, duration = 4000) => {
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ type, message });
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const toggle = () => setConfirm({ next: !marketStatus });

  const syncWithSupabase = useCallback(async (options?: { silent?: boolean }) => {
    try {
      setSyncing(true);
      await Promise.all([refreshOffers(), refreshTransfers(), refreshMarketStatus()]);
      if (!options?.silent) {
        showNotification('success', 'Datos sincronizados con Supabase.');
      }
      return true;
    } catch (error) {
      console.error('AdminMarket - Error syncing with Supabase:', error);
      showNotification('error', 'No se pudo sincronizar con Supabase. Intenta nuevamente.');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [refreshMarketStatus, refreshOffers, refreshTransfers, showNotification]);

  useEffect(() => {
    if (!config.useSupabase) return;
    void syncWithSupabase({ silent: true });
    const interval = window.setInterval(() => {
      void syncWithSupabase({ silent: true });
    }, config.sync.intervalMinutes * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [syncWithSupabase]);

  const handleConfirmToggle = async () => {
    if (!confirm || toggling) return;
    const next = confirm.next;

    try {
      setToggling(true);
      updateMarketStatus(next);
      const message = next ? 'Mercado abierto correctamente.' : 'Mercado cerrado correctamente.';
      showNotification('success', message);
      if (config.useSupabase) {
        void syncWithSupabase({ silent: true });
      }
    } catch (error) {
      console.error('AdminMarket - Error updating market status:', error);
      showNotification('error', 'No se pudo cambiar el estado del mercado. Intenta nuevamente.');
    } finally {
      setToggling(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      {notification && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            notification.type === 'success'
              ? 'border-green-700 bg-green-500/10 text-green-200'
              : 'border-red-700 bg-red-500/10 text-red-200'
          }`}
          role="status"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      <AdminPageHeader
        title="Mercado y Transferencias"
        subtitle="Supervisa ofertas, transferencias y estado global del mercado."
        actions={
          <>
            <AdminStatusBadge label={marketStatus ? 'Abierto' : 'Cerrado'} tone={marketStatus ? 'success' : 'danger'} withDot />
            {config.useSupabase && (
              <button
                className="btn-outline cursor-pointer px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  void syncWithSupabase();
                }}
                disabled={syncing}
              >
                {syncing ? 'Sincronizando...' : 'Refrescar desde Supabase'}
              </button>
            )}
          </>
        }
      />

      <div className="mb-4">
        <button className="btn-primary" onClick={toggle}>
          {marketStatus ? 'Cerrar mercado' : 'Abrir mercado'}
        </button>
      </div>

      <div className="mb-8 card overflow-hidden">
        <div className="border-b border-gray-800 p-4">
          <h3 className="text-xl font-bold">Transferencias</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-dark-lighter text-xs uppercase text-gray-400">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-center">Desde</th>
                <th className="px-4 py-3 text-center">Hacia</th>
                <th className="px-4 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No hay transferencias registradas.
                  </td>
                </tr>
              ) : (
                transfers
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((t) => {
                    const fromLogo = clubByName.get(t.fromClub);
                    const toLogo = clubByName.get(t.toClub);

                    return (
                      <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                        <td className="px-4 py-3">{formatDate(t.date)}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{t.playerName}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            {fromLogo ? <img src={fromLogo} alt={t.fromClub} className="h-5 w-5" /> : null}
                            <span>{t.fromClub}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            {toLogo ? <img src={toLogo} alt={t.toClub} className="h-5 w-5" /> : null}
                            <span>{t.toClub}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(t.fee)}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-800 p-4">
          <h3 className="text-xl font-bold">Ofertas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-dark-lighter text-xs uppercase text-gray-400">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-center">Desde</th>
                <th className="px-4 py-3 text-center">Hacia</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No hay ofertas registradas.
                  </td>
                </tr>
              ) : (
                offers
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((o) => {
                    const fromLogo = clubByName.get(o.fromClub);
                    const toLogo = clubByName.get(o.toClub);

                    return (
                      <tr key={o.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                        <td className="px-4 py-3">{formatDate(o.date)}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{o.playerName}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            {fromLogo ? <img src={fromLogo} alt={o.fromClub} className="h-5 w-5" /> : null}
                            <span>{o.fromClub}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            {toLogo ? <img src={toLogo} alt={o.toClub} className="h-5 w-5" /> : null}
                            <span>{o.toClub}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(o.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <AdminStatusBadge
                            label={o.status === 'pending' ? 'Pendiente' : o.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                            tone={o.status === 'pending' ? 'warning' : o.status === 'accepted' ? 'success' : 'danger'}
                          />
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirm && (
        <MarketToggleModal
          next={confirm.next}
          toggling={toggling}
          onCancel={() => {
            if (!toggling) setConfirm(null);
          }}
          onConfirm={() => {
            void handleConfirmToggle();
          }}
        />
      )}
    </div>
  );
};

export default AdminMarket;

