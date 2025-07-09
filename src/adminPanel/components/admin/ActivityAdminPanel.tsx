import React, { useState } from 'react';
import { Activity, User, Clock, AlertCircle, Eye, Calendar } from 'lucide-react';
import SearchFilter from './SearchFilter';
import StatsCard from './StatsCard';

const ActivityAdminPanel = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('today');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const mockActivities = [
    { id: '1', type: 'login', user: 'admin', timestamp: new Date().toISOString(), details: 'Sesión iniciada', ip: '192.168.1.1', status: 'success' },
    { id: '2', type: 'transfer', user: 'dt_user1', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Transferencia aprobada: Messi → Real Madrid', ip: '192.168.1.2', status: 'success' },
    { id: '3', type: 'tournament', user: 'admin', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Nuevo torneo creado: Liga Master 2024', ip: '192.168.1.1', status: 'success' },
    { id: '4', type: 'error', user: 'dt_user2', timestamp: new Date(Date.now() - 10800000).toISOString(), details: 'Error al procesar pago', ip: '192.168.1.3', status: 'error' },
    { id: '5', type: 'user', user: 'admin', timestamp: new Date(Date.now() - 14400000).toISOString(), details: 'Usuario suspendido: dt_user3', ip: '192.168.1.1', status: 'warning' },
  ];

  const filteredActivities = mockActivities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.details.toLowerCase().includes(search.toLowerCase()) ||
                         activity.user.toLowerCase().includes(search.toLowerCase());
    
    let matchesTime = true;
    const now = new Date();
    const activityTime = new Date(activity.timestamp);
    
    switch (timeFilter) {
      case 'today':
        matchesTime = activityTime.toDateString() === now.toDateString();
        break;
      case 'week':
        matchesTime = (now.getTime() - activityTime.getTime()) < 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        matchesTime = (now.getTime() - activityTime.getTime()) < 30 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return matchesFilter && matchesSearch && matchesTime;
  });

  const todayActivities = mockActivities.filter(a => 
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const criticalActivities = mockActivities.filter(a => a.status === 'error').length;
  const uniqueUsers = new Set(mockActivities.map(a => a.user)).size;
  const totalActivities = mockActivities.length;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return User;
      case 'transfer': return Activity;
      case 'tournament': return Calendar;
      case 'error': return AlertCircle;
      case 'user': return User;
      default: return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-500/30 bg-green-500/10';
      case 'error': return 'border-red-500/30 bg-red-500/10';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      default: return 'border-gray-700/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Registro de Actividad</h1>
            <p className="text-gray-400">Monitorea todas las actividades del sistema en tiempo real</p>
          </div>
          {criticalActivities > 0 && (
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-400" />
                <span className="text-red-400 font-medium">{criticalActivities} actividades críticas</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Hoy"
            value={todayActivities}
            icon={Clock}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <StatsCard
            title="Total"
            value={totalActivities}
            icon={Activity}
            gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
          />
          <StatsCard
            title="Usuarios Activos"
            value={uniqueUsers}
            icon={User}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatsCard
            title="Críticas"
            value={criticalActivities}
            icon={AlertCircle}
            gradient="bg-gradient-to-br from-red-500 to-pink-600"
          />
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchFilter
                search={search}
                onSearchChange={setSearch}
                placeholder="Buscar actividades..."
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input min-w-[120px]"
              >
                <option value="all">Todos</option>
                <option value="login">Sesiones</option>
                <option value="transfer">Transferencias</option>
                <option value="tournament">Torneos</option>
                <option value="user">Usuarios</option>
                <option value="error">Errores</option>
              </select>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="input min-w-[120px]"
              >
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="all">Todo</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const isExpanded = selectedActivity === activity.id;
                
                return (
                  <div 
                    key={activity.id} 
                    className={`bg-gray-900/50 rounded-lg border hover:border-primary/30 transition-all ${getActivityColor(activity.status)}`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/20 rounded-lg">
                            <ActivityIcon size={18} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-white">{activity.user}</span>
                              <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(activity.status)}`}>
                                {activity.status === 'success' ? 'Éxito' : 
                                 activity.status === 'error' ? 'Error' : 'Advertencia'}
                              </span>
                              <span className="text-xs text-gray-400">{formatTime(activity.timestamp)}</span>
                            </div>
                            <p className="text-gray-300 mt-1">{activity.details}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedActivity(isExpanded ? null : activity.id)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Tipo:</span>
                              <p className="text-white font-medium capitalize">{activity.type}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">IP:</span>
                              <p className="text-white font-medium">{activity.ip}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Timestamp:</span>
                              <p className="text-white font-medium">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Activity size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron actividades</h3>
                <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityAdminPanel;
 