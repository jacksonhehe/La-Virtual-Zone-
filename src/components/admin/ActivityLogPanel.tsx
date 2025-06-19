import { useState } from 'react';
import { useActivityLogStore } from '../../store/activityLogStore';

const ActivityLogPanel = () => {
  const { logs } = useActivityLogStore();
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  const filtered = logs.filter(l => {
    const date = new Date(l.date);
    return (
      (!type || l.action === type) &&
      (!startDate || date >= new Date(startDate)) &&
      (!endDate || date <= new Date(endDate))
    );
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Registro de Actividad</h2>
      <div className="bg-dark-light rounded-lg border border-gray-800 p-4 mb-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Desde</label>
            <input type="date" className="input w-full" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Hasta</label>
            <input type="date" className="input w-full" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo</label>
            <select className="input w-full" value={type} onChange={e => setType(e.target.value)}>
              <option value="">Todos</option>
              {uniqueActions.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Acción</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">{new Date(log.date).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3">{log.userId}</td>
                  <td className="px-4 py-3">{log.details}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    No hay registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPanel;
