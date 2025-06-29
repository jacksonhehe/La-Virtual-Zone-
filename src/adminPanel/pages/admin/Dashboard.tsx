import  { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Globe, User, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalStore } from '../../store/globalStore';

const Dashboard = () => {
  const { users, clubs, players, transfers, activities } = useGlobalStore();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const kpiData = [
    { name: 'Ene', users: 4, revenue: 2400 },
    { name: 'Feb', users: 3, revenue: 1398 },
    { name: 'Mar', users: 2, revenue: 9800 },
    { name: 'Abr', users: 8, revenue: 3908 },
    { name: 'May', users: 12, revenue: 4800 },
    { name: 'Jun', users: 9, revenue: 3800 }
  ];

  const pendingTransfers = transfers.filter(t => t.status === 'pending').length;
  const recentActivities = activities.slice(-5);

  return (
       <div className="p-8 space-y-8">
      <header className="flex items-center justify-between bg-vz-surface p-6 rounded">
        <div>
          <h1 className="text-4xl font-heading font-bold gradient-text">Dashboard</h1>
          <p className="text-secondary mt-2">Bienvenido al panel de administración de La Virtual Zone</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="glass-panel p-3">
            <p className="text-sm text-secondary">Última actualización</p>
            <p className="text-xs text-secondary">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </header>
      
           {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">Usuarios Activos</p>
              <p className="text-3xl font-bold gradient-text">{users.length}</p>
              <p className="text-green-400 text-xs mt-1">+12% este mes</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>
        
        <div className="kpi-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">Total Clubes</p>
              <p className="text-3xl font-bold text-emerald-400">{clubs.length}</p>
              <p className="text-green-400 text-xs mt-1">+5% este mes</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
              <Globe className="text-white" size={28} />
            </div>
          </div>
        </div>
        
        <div className="kpi-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">Total Jugadores</p>
              <p className="text-3xl font-bold text-purple-400">{players.length}</p>
              <p className="text-green-400 text-xs mt-1">+8% este mes</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
              <User className="text-white" size={28} />
            </div>
          </div>
        </div>
        
        <div className="kpi-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">Fichajes Pendientes</p>
              <p className="text-3xl font-bold text-orange-400">{pendingTransfers}</p>
              <p className="text-red-400 text-xs mt-1">Requiere atención</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
              <ShoppingBag className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div> 

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Usuarios por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Bar dataKey="users" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Timeline */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-secondary">{activity.details}</p>
                    <p className="text-xs text-secondary">{new Date(activity.date).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary text-center py-4">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-800 rounded-lg">
            <span className="text-sm">Mercado</span>
            <span className="text-green-400 text-sm font-medium">Abierto</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <span className="text-sm">Jornada Actual</span>
            <span className="text-blue-400 text-sm font-medium">15</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800 border border-dark-light rounded-lg">
            <span className="text-sm">Último Backup</span>
            <span className="text-secondary text-sm">Hace 2h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
 