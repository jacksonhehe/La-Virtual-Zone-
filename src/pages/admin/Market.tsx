import { useCallback, useEffect, useRef, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { config } from '../../lib/config';

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
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

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
    const interval = window.setInterval(() => { void syncWithSupabase({ silent: true }); }, config.sync.intervalMinutes * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [syncWithSupabase]);

  const handleConfirmToggle = async () => {
    if (!confirm) return;
    updateMarketStatus(confirm.next);
    setConfirm(null);
    const message = confirm.next ? 'Mercado abierto correctamente.' : 'Mercado cerrado correctamente.';
    showNotification('success', message);
    if (config.useSupabase) {
      void syncWithSupabase({ silent: true });
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Mercado - Transferencias</h2>
          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${marketStatus ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${marketStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {marketStatus ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
        {config.useSupabase && (
          <button
            className="btn-outline text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => { void syncWithSupabase(); }}
            disabled={syncing}
          >
            {syncing ? 'Sincronizando…' : 'Refrescar desde Supabase'}
          </button>
        )}
      </div>

      <div className="mb-4">
        <button className="btn-primary" onClick={toggle}>{marketStatus ? 'Cerrar mercado' : 'Abrir mercado'}</button>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xl font-bold">Transferencias</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full"><thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-center">Desde</th>
                <th className="px-4 py-3 text-center">Hacia</th>
                <th className="px-4 py-3 text-right">Monto</th>
              </tr>
            </thead><tbody>
              {transfers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No hay transferencias registradas.</td></tr>
              ) : transfers
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((t) => (
                  <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">{formatDate(t.date)}</td>
                    <td className="px-4 py-3"><span className="font-medium">{t.playerName}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        {(() => { const c = clubs.find(c => c.name === t.fromClub); return c ? <img src={c.logo} alt={t.fromClub} className="w-5 h-5" /> : null; })()}
                        <span>{t.fromClub}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        {(() => { const c = clubs.find(c => c.name === t.toClub); return c ? <img src={c.logo} alt={t.toClub} className="w-5 h-5" /> : null; })()}
                        <span>{t.toClub}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(t.fee)}</td>
                  </tr>
                ))}
            </tbody></table>
        </div>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xl font-bold">Ofertas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full"><thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-center">Desde</th>
                <th className="px-4 py-3 text-center">Hacia</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead><tbody>
              {offers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No hay ofertas registradas.</td></tr>
              ) : offers
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((o) => (
                  <tr key={o.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">{formatDate(o.date)}</td>
                    <td className="px-4 py-3"><span className="font-medium">{o.playerName}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        {(() => { const c = clubs.find(c => c.name === o.fromClub); return c ? <img src={c.logo} alt={o.fromClub} className="w-5 h-5" /> : null; })()}
                        <span>{o.fromClub}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        {(() => { const c = clubs.find(c => c.name === o.toClub); return c ? <img src={c.logo} alt={o.toClub} className="w-5 h-5" /> : null; })()}
                        <span>{o.toClub}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(o.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : o.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {o.status === 'pending' ? 'Pendiente' : o.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody></table>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirm(null)}></div>
          <div className="relative bg-dark-light border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${confirm.next ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {confirm.next ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <h4 className="text-xl font-bold text-white">
                {confirm.next ? 'Abrir Mercado de Fichajes' : 'Cerrar Mercado de Fichajes'}
              </h4>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed">
                {confirm.next ? (
                  <>
                    Estás a punto de <span className="text-green-400 font-semibold">abrir el mercado de fichajes</span>.
                    Los clubes podrán hacer ofertas y transferencias de jugadores.
                  </>
                ) : (
                  <>
                    Estás a punto de <span className="text-red-400 font-semibold">cerrar el mercado de fichajes</span>.
                    Se detendrán todas las ofertas y transferencias activas.
                  </>
                )}
              </p>

              <div className={`mt-4 p-3 rounded-lg border ${confirm.next ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm text-gray-300">
                    Esta acción afecta a todos los equipos del sistema.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
                onClick={() => setConfirm(null)}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 ${
                  confirm.next
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                onClick={() => { void handleConfirmToggle(); }}
              >
                {confirm.next ? 'Abrir Mercado' : 'Cerrar Mercado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarket;
