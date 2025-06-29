import  { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Globe, User, ShoppingBag } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatsCard from '../../components/admin/StatsCard';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading gradient-text">Dashboard</h1>
          <p className="text-vz-text mt-2">Bienvenido al panel de administración de La Virtual Zone</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="glass-panel p-3">
            <p className="text-sm text-vz-text">Última actualización</p>
            <p className="text-xs text-vz-text">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
      
           {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Usuarios Activos"
          value={users.length}
          change="+12% este mes"
          changeType="positive"
          icon={Users}
          gradient="bg-gradient-to-r from-neon-blue to-vz-primary"
        />
        <StatsCard
          title="Total Clubes"
          value={clubs.length}
          change="+5% este mes"
          changeType="positive"
          icon={Globe}
          gradient="bg-gradient-to-r from-neon-green to-vz-primary"
        />
        <StatsCard
          title="Total Jugadores"
          value={players.length}
          change="+8% este mes"
          changeType="positive"
          icon={User}
          gradient="bg-gradient-to-r from-vz-primary to-neon-yellow"
        />
        <StatsCard
          title="Fichajes Pendientes"
          value={pendingTransfers}
          change="Requiere atención"
          changeType="negative"
          icon={ShoppingBag}
          gradient="bg-gradient-to-r from-neon-yellow to-neon-red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-heading mb-4">Usuarios por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--vz-bg-overlay)" />
              <XAxis dataKey="name" stroke="var(--vz-text-main)" />
              <YAxis stroke="var(--vz-text-main)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--vz-bg-surface)',
                  border: '1px solid var(--vz-bg-overlay)',
                  borderRadius: '8px',
                  color: 'var(--vz-text-main)'
                }}
              />
              <Bar dataKey="users" fill="var(--vz-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Activity Timeline */}
        <Card className="p-6">
          <h3 className="text-lg font-heading mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-vz-overlay rounded">
                  <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-heading">{activity.action}</p>
                    <p className="text-xs text-vz-text">{activity.details}</p>
                    <p className="text-xs text-vz-text">{new Date(activity.date).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-vz-text text-center py-4">No hay actividad reciente</p>
            )}
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="p-6">
        <h3 className="text-lg font-heading mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-neon-green/20 border border-neon-green rounded">
            <span className="text-sm font-heading">Mercado</span>
            <span className="text-neon-green text-sm font-medium">Abierto</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-neon-blue/20 border border-neon-blue rounded">
            <span className="text-sm font-heading">Jornada Actual</span>
            <span className="text-neon-blue text-sm font-medium">15</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-vz-overlay border border-vz-overlay rounded">
            <span className="text-sm font-heading">Último Backup</span>
            <span className="text-vz-text text-sm">Hace 2h</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
 