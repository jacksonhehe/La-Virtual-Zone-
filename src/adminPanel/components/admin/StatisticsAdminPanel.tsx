import React, { Suspense, useState } from 'react';
import * as Recharts from 'recharts';
import { TrendingUp, TrendingDown, Users, Globe, User, Trophy, Calendar, Filter, Download, RefreshCw, ChevronDown } from 'lucide-react';
import StatsCard from './StatsCard';
import ChartSkeleton from '../../../components/common/ChartSkeleton';

const StatisticsAdminPanel = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  const userGrowthData = [
    { name: 'Ene', users: 45, clubs: 8, players: 180, matches: 42 },
    { name: 'Feb', users: 52, clubs: 12, players: 210, matches: 58 },
    { name: 'Mar', users: 67, clubs: 15, players: 275, matches: 73 },
    { name: 'Abr', users: 78, clubs: 18, players: 320, matches: 89 },
    { name: 'May', users: 89, clubs: 22, players: 380, matches: 105 },
    { name: 'Jun', users: 95, clubs: 24, players: 425, matches: 120 }
  ];

  const engagementData = [
    { name: 'Lun', sessions: 120, duration: 25 },
    { name: 'Mar', sessions: 145, duration: 32 },
    { name: 'Mié', sessions: 180, duration: 28 },
    { name: 'Jue', sessions: 165, duration: 35 },
    { name: 'Vie', sessions: 220, duration: 42 },
    { name: 'Sáb', sessions: 250, duration: 38 },
    { name: 'Dom', sessions: 190, duration: 30 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: '#8B5CF6' },
    { name: 'Mobile', value: 30, color: '#3B82F6' },
    { name: 'Tablet', value: 5, color: '#10B981' }
  ];

  const topClubsData = [
    { name: 'Real Madrid CF', members: 45, rating: 4.8, matches: 28 },
    { name: 'FC Barcelona', members: 42, rating: 4.7, matches: 26 },
    { name: 'Manchester United', members: 38, rating: 4.6, matches: 24 },
    { name: 'Bayern Munich', members: 35, rating: 4.5, matches: 22 },
    { name: 'Liverpool FC', members: 33, rating: 4.4, matches: 20 }
  ];

  const activityHeatmap = [
    { hour: '00', Mon: 2, Tue: 1, Wed: 3, Thu: 2, Fri: 4, Sat: 8, Sun: 6 },
    { hour: '06', Mon: 8, Tue: 12, Wed: 15, Thu: 18, Fri: 22, Sat: 25, Sun: 20 },
    { hour: '12', Mon: 35, Tue: 42, Wed: 48, Thu: 52, Fri: 58, Sat: 65, Sun: 55 },
    { hour: '18', Mon: 65, Tue: 70, Wed: 75, Thu: 80, Fri: 85, Sat: 90, Sun: 82 },
    { hour: '21', Mon: 45, Tue: 48, Wed: 52, Thu: 55, Fri: 62, Sat: 78, Sun: 68 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
                  <TrendingUp size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Estadísticas
                  </h1>
                  <p className="text-gray-300 text-lg mt-2">Analytics y métricas de rendimiento</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="24h">Últimas 24h</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 3 meses</option>
              </select>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2">
                <Download size={20} />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Usuarios Activos"
            value="1,234"
            change="+12.5%"
            changeType="positive"
            icon={Users}
            gradient="from-purple-500 to-blue-600"
          />
          <StatsCard
            title="Clubes Registrados"
            value="89"
            change="+8.3%"
            changeType="positive"
            icon={Globe}
            gradient="from-emerald-500 to-green-600"
          />
          <StatsCard
            title="Jugadores"
            value="2,456"
            change="+15.7%"
            changeType="positive"
            icon={User}
            gradient="from-orange-500 to-red-600"
          />
          <StatsCard
            title="Partidos Jugados"
            value="567"
            change="+23.1%"
            changeType="positive"
            icon={Trophy}
            gradient="from-pink-500 to-purple-600"
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Growth Chart */}
          <div className="xl:col-span-2 bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Crecimiento General</h3>
                <p className="text-gray-400 text-sm">Evolución de métricas clave</p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 transition-all"
                >
                  <option value="users">Usuarios</option>
                  <option value="clubs">Clubes</option>
                  <option value="players">Jugadores</option>
                  <option value="matches">Partidos</option>
                </select>
              </div>
            </div>
            <Suspense fallback={<ChartSkeleton />}>
              <Recharts.ResponsiveContainer width="100%" height={320}>
                <Recharts.AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <Recharts.XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <Recharts.YAxis stroke="#9CA3AF" fontSize={12} />
                <Recharts.Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#F3F4F6'
                  }}
                />
                <Recharts.Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#8B5CF6"
                  fill="url(#areaGradient)"
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                </Recharts.AreaChart>
              </Recharts.ResponsiveContainer>
            </Suspense>
          </div>

          {/* Device Distribution */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Dispositivos</h3>
              <RefreshCw size={18} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
            <Suspense fallback={<ChartSkeleton />}>
              <Recharts.ResponsiveContainer width="100%" height={240}>
                <Recharts.PieChart>
                  <Recharts.Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
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
            <div className="space-y-3 mt-4">
              {deviceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement & Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* User Engagement */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Engagement Semanal</h3>
                <p className="text-gray-400 text-sm">Sessions y duración promedio</p>
              </div>
            </div>
            <Suspense fallback={<ChartSkeleton />}>
              <Recharts.ResponsiveContainer width="100%" height={280}>
                <Recharts.BarChart data={engagementData}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <Recharts.XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <Recharts.YAxis stroke="#9CA3AF" fontSize={12} />
                  <Recharts.Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Recharts.Bar dataKey="sessions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </Recharts.BarChart>
              </Recharts.ResponsiveContainer>
            </Suspense>
          </div>

          {/* Top Clubs */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Top Clubes</h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Ver todos
              </button>
            </div>
            <div className="space-y-4">
              {topClubsData.map((club, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{club.name}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span>{club.members} miembros</span>
                        <span>•</span>
                        <span>{club.matches} partidos</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Trophy size={14} className="text-yellow-400" />
                      <span className="text-sm font-medium text-white">{club.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Análisis Detallado</h3>
              <p className="text-gray-400 text-sm">Métricas avanzadas y tendencias</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Retention Rate */}
            <div className="bg-gray-700/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">Retención</h4>
                <TrendingUp size={18} className="text-green-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Día 1</span>
                  <span className="text-sm font-medium text-white">85%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Día 7</span>
                  <span className="text-sm font-medium text-white">65%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Día 30</span>
                  <span className="text-sm font-medium text-white">42%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '42%'}}></div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-700/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">Rendimiento</h4>
                <Calendar size={18} className="text-blue-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Tiempo de carga</span>
                  <span className="text-sm font-medium text-green-400">1.2s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Bounce rate</span>
                  <span className="text-sm font-medium text-orange-400">23%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Session duration</span>
                  <span className="text-sm font-medium text-purple-400">8m 42s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Page views</span>
                  <span className="text-sm font-medium text-blue-400">4.2/session</span>
                </div>
              </div>
            </div>

            {/* Growth Forecast */}
            <div className="bg-gray-700/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">Proyección</h4>
                <TrendingUp size={18} className="text-purple-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Usuarios (próximo mes)</span>
                    <span className="text-sm font-medium text-white">~1,500</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Engagement</span>
                    <span className="text-sm font-medium text-green-400">+15%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Revenue</span>
                    <span className="text-sm font-medium text-yellow-400">+22%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsAdminPanel;
 