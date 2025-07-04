import { useEffect, useRef } from 'react';
import { Tournament } from '../../types';

interface Props {
  tournament: Tournament;
  onClose: () => void;
}

const TournamentDetailsModal = ({ tournament, onClose }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
        tabIndex={-1}
      >
        <h3 className="text-lg font-semibold mb-4">Detalles del Torneo</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-400">Nombre: </span>
            <span className="text-white">{tournament.name}</span>
          </p>
          <p>
            <span className="text-gray-400">Estado: </span>
            <span className="text-white capitalize">{tournament.status}</span>
          </p>
          <p>
            <span className="text-gray-400">Formato: </span>
            <span className="text-white capitalize">
              {tournament.format === 'league' ? 'Liga' : 'Eliminación'}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Inicio: </span>
            <span className="text-white">
              {new Date(tournament.startDate).toLocaleDateString()}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Fin: </span>
            <span className="text-white">
              {new Date(tournament.endDate).toLocaleDateString()}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Equipos: </span>
            <span className="text-white">
              {tournament.currentTeams}/{tournament.maxTeams}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Premio: </span>
            <span className="text-white">
              €{tournament.prizePool.toLocaleString()}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Ubicación: </span>
            <span className="text-white">{tournament.location}</span>
          </p>
        </div>
        <div className="flex justify-end mt-6">
          <button type="button" onClick={onClose} className="btn-primary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailsModal;
