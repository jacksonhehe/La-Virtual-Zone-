import  { useState } from 'react';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';

const MarketAdminPanel = () => {
  const {
    transfers,
    players,
    clubs,
    approveTransfer,
    rejectTransfer
  } = useGlobalStore();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const getPlayerName = (id: string) =>
    players.find(p => p.id === id)?.name || id;

  const getClubName = (id: string) =>
    clubs.find(c => c.id === id)?.name || id;

  const filteredTransfers = transfers.filter(t => {
    const matchesStatus = status === 'all' || t.status === status;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      getPlayerName(t.playerId).toLowerCase().includes(term) ||
      getClubName(t.fromClubId).toLowerCase().includes(term) ||
      getClubName(t.toClubId).toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (id: string) => {
    approveTransfer(id);
    toast.success('Transferencia aprobada');
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    rejectTransfer(rejectModal, rejectReason);
    toast.success('Transferencia rechazada');
    setRejectModal(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <input
            className="input w-full"
            placeholder="Buscar por jugador o club"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
          <option value="all">Todas</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTransfers.length > 0 ? (
          filteredTransfers.map(transfer => (
            <div key={transfer.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{getPlayerName(transfer.playerId)}</p>
                  <p className="text-sm text-gray-400">
                    De: {getClubName(transfer.fromClubId)} → A: {getClubName(transfer.toClubId)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Monto: ${transfer.amount.toLocaleString()} | {new Date(transfer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      transfer.status === 'pending'
                        ? 'bg-yellow-900/20 text-yellow-300'
                        : transfer.status === 'approved'
                        ? 'bg-green-900/20 text-green-300'
                        : 'bg-red-900/20 text-red-300'
                    }`}
                  >
                    {transfer.status === 'pending'
                      ? 'Pendiente'
                      : transfer.status === 'approved'
                      ? 'Aprobada'
                      : 'Rechazada'}
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

      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rechazar Transferencia</h3>
            <textarea
              className="input w-full h-24 resize-none"
              placeholder="Motivo del rechazo..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex space-x-3 justify-end mt-6">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="btn-outline">Cancelar</button>
              <button onClick={handleReject} className="btn-danger" disabled={!rejectReason.trim()}>Rechazar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketAdminPanel;
 