import { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { Tournament } from '../../types';

const TournamentsAdminPanel = () => {
  const { tournaments, addTournament } = useDataStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<'league' | 'cup' | 'friendly'>('league');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;
    const newTournament: Tournament = {
      id: `${Date.now()}`,
      name,
      type,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7f39fb&color=fff&size=128`,
      startDate,
      endDate,
      status: 'upcoming',
      teams: [],
      rounds: 0,
      matches: [],
      description: ''
    };
    addTournament(newTournament);
    setName('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Torneos</h2>
      <form onSubmit={handleSubmit} className="bg-dark-light rounded-lg border border-gray-800 p-4 mb-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nombre</label>
          <input className="input w-full" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Inicio</label>
            <input type="date" className="input w-full" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fin</label>
            <input type="date" className="input w-full" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tipo</label>
          <select className="input w-full" value={type} onChange={e => setType(e.target.value as any)}>
            <option value="league">Liga</option>
            <option value="cup">Copa</option>
            <option value="friendly">Amistoso</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full">Crear Torneo</button>
      </form>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map(t => (
                <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 text-center">{t.type}</td>
                  <td className="px-4 py-3 text-center">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TournamentsAdminPanel;
