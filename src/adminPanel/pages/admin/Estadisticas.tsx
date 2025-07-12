import React, { Suspense, useState } from 'react';
import * as Recharts from 'recharts';
import { useGlobalStore } from '../../store/globalStore';
import ChartSkeleton from '../../../components/common/ChartSkeleton';

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
          <Suspense fallback={<ChartSkeleton />}>
            <Recharts.ResponsiveContainer width="100%" height={300}>
              <Recharts.PieChart>
                <Recharts.Pie
                data={usersByRole}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {usersByRole.map((entry, index) => (
                  <Recharts.Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Recharts.Pie>
              <Recharts.Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              </Recharts.PieChart>
            </Recharts.ResponsiveContainer>
          </Suspense>
        </div>

        {/* Monthly Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Actividad Mensual</h3>
          <Suspense fallback={<ChartSkeleton />}>
            <Recharts.ResponsiveContainer width="100%" height={300}>
              <Recharts.BarChart data={monthlyData}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <Recharts.XAxis dataKey="month" stroke="#9CA3AF" />
                <Recharts.YAxis stroke="#9CA3AF" />
                <Recharts.Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Recharts.Bar dataKey="users" fill="#3B82F6" name="Usuarios" />
                <Recharts.Bar dataKey="transfers" fill="#10B981" name="Transferencias" />
              </Recharts.BarChart>
            </Recharts.ResponsiveContainer>
          </Suspense>
        </div>
      </div>

      {/* Transfers by Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Estado de Transferencias</h3>
        <Suspense fallback={<ChartSkeleton />}>
          <Recharts.ResponsiveContainer width="100%" height={300}>
            <Recharts.BarChart data={transfersByStatus} layout="horizontal">
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <Recharts.XAxis type="number" stroke="#9CA3AF" />
              <Recharts.YAxis dataKey="name" type="category" stroke="#9CA3AF" />
              <Recharts.Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Recharts.Bar dataKey="value" fill="#8B5CF6" />
            </Recharts.BarChart>
          </Recharts.ResponsiveContainer>
        </Suspense>
      </div>
    </div>
  );
};

export default Estadisticas;
 