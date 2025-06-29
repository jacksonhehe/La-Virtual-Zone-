import  { useState, useEffect } from 'react';
import { Check, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore, subscribe as subscribeGlobal } from '../../store/globalStore';

const Mercado = () => {
  const { transfers, approveTransfer, rejectTransfer } = useGlobalStore();
  const [filter, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
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

  const filteredTransfers = transfers.filter(transfer =>
    filter === 'all' || transfer.status === filter
  );

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
       <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Mercado de Fichajes</h1>
          <p className="text-gray-400 mt-2">Centro de control de transferencias</p>
          {pendingCount > 0 && (
            <div className="flex items-center mt-3">
              <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                {pendingCount}
              </span>
              <span className="ml-3 text-gray-300 text-sm font-medium">ofertas requieren tu atención</span>
            </div>
          )}
        </div> 
        <select
          className="input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
          <option value="all">Todas</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTransfers.length > 0 ? (
          filteredTransfers.map((transfer) => (
            <div key={transfer.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Transferencia #{transfer.id}</p>
                  <p className="text-sm text-gray-400">
                    Jugador ID: {transfer.playerId} | De: {transfer.fromClubId} → A: {transfer.toClubId}
                  </p>
                  <p className="text-sm text-gray-400">
                    Monto: ${transfer.amount.toLocaleString()} | {new Date(transfer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transfer.status === 'pending' 
                      ? 'bg-yellow-900/20 text-yellow-300'
                      : transfer.status === 'approved'
                      ? 'bg-green-900/20 text-green-300'
                      : 'bg-red-900/20 text-red-300'
                  }`}>
                    {transfer.status === 'pending' ? 'Pendiente' : 
                     transfer.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                  </span>
                  {transfer.status === 'pending' && (
                                     <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(transfer.id)}
                        className="btn-success p-2"
                        title="Aprobar"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setRejectModal(transfer.id)}
                        className="btn-danger p-2"
                        title="Rechazar"
                      >
                        <X size={16} />
                      </button>
                    </div> 
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-400">No hay transferencias para mostrar</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
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
 