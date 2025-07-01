import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useGlobalStore } from '../store/globalStore';
import { useMatchesStore } from '../store/matchesStore';
import { Fixture } from '../types';

const ResultadosPendientes = () => {
  const { matches } = useGlobalStore();
  const { confirmMatch, rejectMatch } = useMatchesStore();
  const [rejecting, setRejecting] = useState<Fixture | null>(null);
  const [reason, setReason] = useState('');

  const pending = matches.filter(m => m.status === 'pending_review');

  const handleReject = () => {
    if (!rejecting) return;
    rejectMatch(rejecting.id, reason);
    setRejecting(null);
    setReason('');
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold gradient-text">Resultados Pendientes</h1>
        <p className="text-gray-400 mt-2">Aprueba o rechaza los resultados enviados</p>
      </div>

      <div className="space-y-4">
        {pending.length > 0 ? (
          pending.map(match => (
            <div key={match.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">
                    {match.homeTeam} {match.homeScore ?? 0} - {match.awayScore ?? 0} {match.awayTeam}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(match.date).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => confirmMatch(match.id)}
                    className="btn-success p-2"
                    title="Aprobar"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setRejecting(match)}
                    className="btn-danger p-2"
                    title="Rechazar"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-400">No hay resultados pendientes</p>
          </div>
        )}
      </div>

      {rejecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rechazar Resultado</h3>
            <textarea
              className="input w-full h-24 resize-none"
              placeholder="Motivo del rechazo..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <div className="flex space-x-3 justify-end mt-6">
              <button onClick={() => { setRejecting(null); setReason(''); }} className="btn-outline">Cancelar</button>
              <button onClick={handleReject} className="btn-danger" disabled={!reason.trim()}>Rechazar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultadosPendientes;
