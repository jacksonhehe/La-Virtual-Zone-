import { useState } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Tournament } from '../../types';

interface Props {
  onClose: () => void;
  tournament?: Tournament;
}

const NewTournamentModal = ({ onClose, tournament }: Props) => {
  const { clubs, addTournament, updateTournament } = useDataStore();
  const [name, setName] = useState(tournament?.name || '');
  const [type, setType] = useState<Tournament['type']>(tournament?.type || 'league');
  const [startDate, setStartDate] = useState(tournament?.startDate || '');
  const [endDate, setEndDate] = useState(tournament?.endDate || '');
  const [status, setStatus] = useState<Tournament['status']>(tournament?.status || 'upcoming');
  const [rounds, setRounds] = useState<number>(tournament?.rounds || 1);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !startDate || !endDate) {
      setError('Completa todos los campos');
      return;
    }

    const newTournament: Tournament = {
      id: tournament?.id || `${Date.now()}`,
      name,
      type,
      logo:
        tournament?.logo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7f39fb&color=fff&size=128`,
      startDate,
      endDate,
      status,
      teams: tournament?.teams || clubs.map((c) => c.name),
      rounds: Number(rounds),
      matches: tournament?.matches || [],
      winner: tournament?.winner,
      topScorer: tournament?.topScorer,
      description: tournament?.description || ''
    };

    if (tournament) {
      updateTournament(newTournament);
    } else {
      addTournament(newTournament);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">{tournament ? 'Editar Torneo' : 'Nuevo Torneo'}</h3>
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo</label>
            <select className="input w-full" value={type} onChange={(e) => setType(e.target.value as Tournament['type'])}>
              <option value="league">Liga</option>
              <option value="cup">Copa</option>
              <option value="friendly">Amistoso</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Inicio</label>
              <input type="date" className="input w-full" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fin</label>
              <input type="date" className="input w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Estado</label>
            <select className="input w-full" value={status} onChange={(e) => setStatus(e.target.value as Tournament['status'])}>
              <option value="upcoming">Próximo</option>
              <option value="active">Activo</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Rondas</label>
            <input type="number" className="input w-full" value={rounds} onChange={(e) => setRounds(Number(e.target.value))} min={1} />
          </div>
          <button type="submit" className="btn-primary w-full">{tournament ? 'Guardar' : 'Crear'}</button>
        </form>
      </div>
    </div>
  );
};

export default NewTournamentModal;
