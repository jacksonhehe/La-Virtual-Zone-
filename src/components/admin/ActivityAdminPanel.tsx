import { useState } from 'react';
import { useActivityLogStore } from '../../store/activityLogStore';
import { useDataStore } from '../../store/dataStore';

const ActivityAdminPanel = () => {
  const { logs } = useActivityLogStore();
  const { users } = useDataStore();
  const [type, setType] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = logs.filter(log => {
    if (type !== 'all' && log.action !== type) return false;
    if (from && new Date(log.date) < new Date(from)) return false;
    if (to && new Date(log.date) > new Date(to)) return false;
    return true;
  });

  const getUser = (id: string) => users.find(u => u.id === id)?.username || id;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Actividad</h2>
      <div className="bg-dark-light rounded-lg border border-gray-800 p-4 mb-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo</label>
            <select className="input w-full" value={type} onChange={e => setType(e.target.value)}>
              <option value="all">Todos</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="register">Registro</option>
              <option value="role_change">Cambio de rol</option>
              <option value="tournament_create">Nuevo torneo</option>
              <option value="market_status_change">Mercado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Desde</label>
            <input type="date" className="input w-full" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Hasta</label>
            <input type="date" className="input w-full" value={to} onChange={e => setTo(e.target.value)} />
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
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(log.date).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3">{getUser(log.userId)}</td>
                  <td className="px-4 py-3">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityAdminPanel;
