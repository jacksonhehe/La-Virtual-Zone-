import React, { Suspense } from 'react';
import * as Recharts from 'recharts';
import { Users, Globe, User, ShoppingBag, TrendingUp, Activity, AlertCircle, CheckCircle, Clock, Star, Trophy, Target } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalStore } from '../../store/globalStore';
import ChartSkeleton from '../../../components/common/ChartSkeleton';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                   <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div> 
          <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl">
                  <Activity size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Dashboard Administrativo
                  </h1>
                  <p className="text-gray-300 text-lg mt-2">Control central de La Virtual Zone</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle size={20} />
                  <span className="font-medium">Sistema Operativo</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-400">
                  <Clock size={20} />
                  <span className="text-sm">Actualizado: {new Date().toLocaleString('es-ES')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">15</div>
                  <div className="text-xs text-gray-400">Jornada Actual</div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">98%</div>
                  <div className="text-xs text-gray-400">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>  
      
                  {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <p className="text-gray-400 text-sm font-medium">Usuarios Activos</p>
                  <TrendingUp size={14} className="text-green-400" />
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {users.length}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    +12%
                  </span>
                  <span className="text-xs text-gray-400">este mes</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Users className="text-white" size={28} />
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <p className="text-gray-400 text-sm font-medium">Total Clubes</p>
                  <Trophy size={14} className="text-emerald-400" />
                </div>
                <p className="text-4xl font-bold text-emerald-400">
                  {clubs.length}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    +5%
                  </span>
                  <span className="text-xs text-gray-400">este mes</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Globe className="text-white" size={28} />
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <p className="text-gray-400 text-sm font-medium">Total Jugadores</p>
                  <Star size={14} className="text-purple-400" />
                </div>
                <p className="text-4xl font-bold text-purple-400">
                  {players.length}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                    +8%
                  </span>
                  <span className="text-xs text-gray-400">este mes</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <User className="text-white" size={28} />
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <p className="text-gray-400 text-sm font-medium">Fichajes Pendientes</p>
                  {pendingTransfers > 0 && <AlertCircle size={14} className="text-orange-400" />}
                </div>
                <p className="text-4xl font-bold text-orange-400">
                  {pendingTransfers}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    pendingTransfers > 0 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {pendingTransfers > 0 ? 'Requiere atención' : 'Al día'}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <ShoppingBag className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>  

             {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Users Growth Chart */}
          <div className="xl:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Crecimiento de Usuarios</h3>
                <p className="text-gray-400 text-sm">Evolución mensual de registros</p>
              </div>
              <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg p-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Usuarios</span>
              </div>
            </div>
            <Suspense fallback={<ChartSkeleton />}>
              <Recharts.ResponsiveContainer width="100%" height={320}>
                <Recharts.BarChart data={kpiData}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <Recharts.XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <Recharts.YAxis stroke="#9CA3AF" fontSize={12} />
                  <Recharts.Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F3F4F6',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }}
                  />
                  <Recharts.Bar
                    dataKey="users"
                    fill="url(#userGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </Recharts.BarChart>
              </Recharts.ResponsiveContainer>
            </Suspense>
          </div>

          {/* Activity Timeline */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Actividad Reciente</h3>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={activity.id} className="relative">
                    {index !== recentActivities.length - 1 && (
                      <div className="absolute left-3 top-8 w-px h-8 bg-gray-600"></div>
                    )}
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{activity.action}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity size={20} className="text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-sm">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div> 

             {/* Enhanced System Status */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Estado del Sistema</h3>
              <p className="text-gray-400 text-sm">Monitoreo en tiempo real</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Todo Operativo</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Mercado</p>
                  <p className="text-green-400 font-bold">Abierto</p>
                </div>
                <CheckCircle size={24} className="text-green-400" />
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4 group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Jornada</p>
                  <p className="text-blue-400 font-bold">15/38</p>
                </div>
                <Target size={24} className="text-blue-400" />
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Servidor</p>
                  <p className="text-purple-400 font-bold">98% Uptime</p>
                </div>
                <Activity size={24} className="text-purple-400" />
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Backup</p>
                  <p className="text-yellow-400 font-bold">2h ago</p>
                </div>
                <Clock size={24} className="text-yellow-400" />
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button className="flex items-center justify-center space-x-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 rounded-lg p-3 transition-all duration-300 group">
                <Users size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-purple-400">Ver Usuarios</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 transition-all duration-300 group">
                <ShoppingBag size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-400">Mercado</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 rounded-lg p-3 transition-all duration-300 group">
                <Globe size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-emerald-400">Clubes</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/30 rounded-lg p-3 transition-all duration-300 group">
                <User size={18} className="text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-orange-400">Jugadores</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
};

export default Dashboard;
 