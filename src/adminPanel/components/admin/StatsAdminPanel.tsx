import  { useState } from 'react';

const StatsAdminPanel = () => {
  const [standings, setStandings] = useState([
    { clubId: '1', points: 0 }
  ]);

  const handleChange = (clubId: string, points: number) => {
    setStandings(prev => prev.map(row => 
      row.clubId === clubId ? { ...row, points } : row
    ));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Estadísticas</h2>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <tbody>
            {standings.map(row => (
              <tr key={row.clubId}>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    className="input w-20 text-center"
                    value={row.points}
                    onChange={e => handleChange(row.clubId, Number(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsAdminPanel;
 