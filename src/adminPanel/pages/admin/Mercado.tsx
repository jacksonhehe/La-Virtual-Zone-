import  React, { useState, useEffect } from 'react';
import { Check, X, Filter, TrendingUp, Clock, AlertCircle, Search, Eye, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore, subscribe as subscribeGlobal } from '../../store/globalStore';
import SearchFilter from '../../components/admin/SearchFilter';
import StatsCard from '../../components/admin/StatsCard';

const Mercado = () => {
  const { transfers, approveTransfer, rejectTransfer } = useGlobalStore();
  const [filter, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(
    transfers.filter(t => t.status === 'pending').length
  );

  useEffect(() => {
    const unsub = subscribeGlobal(
      state => state.transfers.filter(t => t.status === 'pending').length,
      setPendingCount
    );
    return () => unsub();
  }, []);

  const filteredTransfers = transfers.filter(transfer => {
    const matchesFilter = filter === 'all' || transfer.status === filter;
    const matchesSearch = transfer.id.includes(search) || 
                         transfer.playerId.includes(search) ||
                         transfer.fromClubId.toLowerCase().includes(search.toLowerCase()) ||
                         transfer.toClubId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const approvedCount = transfers.filter(t => t.status === 'approved').length;
  const rejectedCount = transfers.filter(t => t.status === 'rejected').length;
  const totalValue = transfers.reduce((sum, t) => sum + t.amount, 0);

  const handleApprove = (id: string) => {
    approveTransfer(id);
    toast.success('Transferencia aprobada');
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    
    rejectTransfer(rejectModal, rejectReason);
    setRejectModal(null);
    setRejectReason('');
    toast.success('Transferencia rechazada');
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mercado de Fichajes</h1>
            <p className="text-gray-400">Gestiona todas las transferencias del sistema</p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-400" />
                <span className="text-red-400 font-medium">{pendingCount} ofertas pendientes</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Pendientes"
            value={pendingCount}
            icon={Clock}
            gradient="from-yellow-500 to-orange-600"
          />
          <StatsCard
            title="Aprobadas"
            value={approvedCount}
            icon={Check}
            gradient="from-green-500 to-emerald-600"
          />
          <StatsCard
            title="Rechazadas"
            value={rejectedCount}
            icon={X}
            gradient="from-red-500 to-pink-600"
          />
          <StatsCard
            title="Valor Total"
            value={`€${totalValue.toLocaleString()}`}
            icon={TrendingUp}
            gradient="from-blue-500 to-purple-600"
          />
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchFilter
                search={search}
                onSearchChange={setSearch}
                placeholder="Buscar transferencias..."
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="all">Todas</option>
            </select>
          </div>

          <div className="grid gap-4">
            {filteredTransfers.length > 0 ? (
              filteredTransfers.map((transfer) => {
                const isExpanded = selectedTransfer === transfer.id;
                
                return (
                  <div key={transfer.id} className="bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-primary/30 transition-all">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/20 rounded-lg">
                            <TrendingUp size={24} className="text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Transferencia #{transfer.id}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`px-3 py-1 rounded-full text-xs border ${
                                transfer.status === 'pending' 
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                  : transfer.status === 'approved'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}>
                                {transfer.status === 'pending' ? 'Pendiente' : 
                                 transfer.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {new Date(transfer.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedTransfer(isExpanded ? null : transfer.id)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <ChevronDown size={18} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          {transfer.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApprove(transfer.id)}
                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Aprobar transferencia"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => setRejectModal(transfer.id)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Rechazar transferencia"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-gray-400 text-sm mb-1">Jugador</div>
                          <div className="text-white font-medium">ID: {transfer.playerId}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-gray-400 text-sm mb-1">Transferencia</div>
                          <div className="text-white font-medium">{transfer.fromClubId} → {transfer.toClubId}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-gray-400 text-sm mb-1">Monto</div>
                          <div className="text-white font-medium">€{transfer.amount.toLocaleString()}</div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-700/50 pt-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Detalles de la Operación</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Fecha de solicitud:</span>
                                  <span className="text-white">{new Date(transfer.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Tipo:</span>
                                  <span className="text-white">Transferencia permanente</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Comisión:</span>
                                  <span className="text-white">€{Math.round(transfer.amount * 0.05).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Estado del Proceso</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-300">Solicitud recibida</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${transfer.status !== 'pending' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                  <span className="text-sm text-gray-300">Revisión completada</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${transfer.status === 'approved' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                  <span className="text-sm text-gray-300">Transferencia procesada</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron transferencias</h3>
                <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rechazar Transferencia</h3>
            <p className="text-gray-400 mb-4">Indica el motivo del rechazo:</p>
            <textarea
              className="input w-full h-24 resize-none"
              placeholder="Motivo del rechazo..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex space-x-3 justify-end mt-6">
              <button 
                onClick={() => {setRejectModal(null); setRejectReason('');}} 
                className="btn-outline"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReject} 
                className="btn-danger"
                disabled={!rejectReason.trim()}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mercado;
 