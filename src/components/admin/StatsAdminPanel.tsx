import { useDataStore } from '../../store/dataStore';

const StatsAdminPanel = () => {
  const { standings, clubs, updateStandings } = useDataStore();

  const handleChange = (clubId: string, points: number) => {
    const newTable = standings.map(s => s.clubId === clubId ? { ...s, points } : s);
    updateStandings(newTable);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Estadísticas Generales</h2>
      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Club</th>
                <th className="px-4 py-3 text-center">PJ</th>
                <th className="px-4 py-3 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map(row => {
                const club = clubs.find(c => c.id === row.clubId);
                return (
                  <tr key={row.clubId} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">{club?.name}</td>
                    <td className="px-4 py-3 text-center">{row.played}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        className="input w-20 text-center"
                        value={row.points}
                        onChange={e => handleChange(row.clubId, Number(e.target.value))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsAdminPanel;
