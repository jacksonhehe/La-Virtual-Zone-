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
      <div className="rounded-lg border border-vz-overlay overflow-x-auto">
        <table className="min-w-full text-sm">
          <tbody>
            {standings.map(row => (
              <tr key={row.clubId} className="border-t border-vz-overlay even:bg-vz-overlay/50">
                <td className="table-cell">
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
 