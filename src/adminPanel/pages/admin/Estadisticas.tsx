import  { useState } from 'react';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useGlobalStore } from '../../store/globalStore';

const Estadisticas = () => {
  const { users, clubs, players, transfers } = useGlobalStore();
  const [dateRange, setDateRange] = useState('30');

  const usersByRole = [
    { name: 'Admin', value: users.filter(u => u.role === 'admin').length, color: '#EF4444' },
    { name: 'DT', value: users.filter(u => u.role === 'dt').length, color: '#3B82F6' },
    { name: 'Usuario', value: users.filter(u => u.role === 'user').length, color: '#10B981' }
  ];

  const transfersByStatus = [
    { name: 'Pendientes', value: transfers.filter(t => t.status === 'pending').length },
    { name: 'Aprobadas', value: transfers.filter(t => t.status === 'approved').length },
    { name: 'Rechazadas', value: transfers.filter(t => t.status === 'rejected').length }
  ];

  const monthlyData = [
    { month: 'Ene', users: 4, transfers: 2 },
    { month: 'Feb', users: 3, transfers: 1 },
    { month: 'Mar', users: 2, transfers: 5 },
    { month: 'Abr', users: 8, transfers: 3 },
    { month: 'May', users: 12, transfers: 8 },
    { month: 'Jun', users: 9, transfers: 6 }
  ];

  const usersRoleRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);
  const transfersRef = useRef<HTMLDivElement>(null);

  const downloadChart = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

   return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Estadísticas</h1>
          <p className="text-gray-400 mt-2">Análisis detallado del rendimiento del sistema</p>
        </div>
        <div className="glass-panel p-3">
          <select
            className="input bg-transparent border-none"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Último año</option>
          </select>
        </div>
      </div> 

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Total Usuarios</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">{users.length}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Total Clubes</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">{clubs.length}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Total Jugadores</h3>
          <p className="text-3xl font-bold text-purple-500 mt-2">{players.length}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Transferencias</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">{transfers.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Usuarios por Rol</h3>
          <div ref={usersRoleRef}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usersByRole}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                  animationDuration={800}
                  animationEasing="ease-out"
              >
                {usersByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
          <button onClick={() => downloadChart(usersRoleRef, 'usuarios_por_rol')} className="mt-2 text-xs text-gray-300 hover:text-white underline">Descargar PNG</button>
        </div>

        {/* Monthly Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Actividad Mensual</h3>
          <div ref={monthlyRef}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
                <Bar dataKey="users" fill="#3B82F6" name="Usuarios" animationDuration={800} animationEasing="ease-out" />
                <Bar dataKey="transfers" fill="#10B981" name="Transferencias" animationDuration={800} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
          </div>
          <button onClick={() => downloadChart(monthlyRef, 'actividad_mensual')} className="mt-2 text-xs text-gray-300 hover:text-white underline">Descargar PNG</button>
        </div>
      </div>

      {/* Transfers by Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Estado de Transferencias</h3>
        <div ref={transfersRef}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={transfersByStatus} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" />
            <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }} 
            />
              <Bar dataKey="value" fill="#8B5CF6" animationDuration={800} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer>
        </div>
        <button onClick={() => downloadChart(transfersRef, 'transferencias_por_estado')} className="mt-2 text-xs text-gray-300 hover:text-white underline">Descargar PNG</button>
      </div>
    </div>
  );
};

export default Estadisticas;
 