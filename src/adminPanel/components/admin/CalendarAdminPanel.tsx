import  React, { useState, useEffect } from 'react';
import  { Calendar, Clock, Plus, Edit, Trash, Users, Trophy, AlertCircle, Eye, Filter, MapPin, Settings } from 'lucide-react'; 
import { useGlobalStore } from '../../store/globalStore';
import SearchFilter from './SearchFilter';
import StatsCard from './StatsCard';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'match' | 'training' | 'meeting' | 'deadline' | 'maintenance';
  date: string;
  time: string;
  description: string;
  location?: string;
  participants?: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
}

const CalendarAdminPanel = () => {
  const { users } = useGlobalStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Liga Master - Jornada 15',
      type: 'match',
      date: '2024-01-22',
      time: '20:00',
      description: 'Partidos de la jornada 15 de Liga Master',
      location: 'Virtual Stadium',
      participants: ['Real Madrid', 'Barcelona', 'Manchester City', 'PSG'],
      status: 'scheduled',
      priority: 'high',
      createdBy: 'admin'
    },
    {
      id: '2',
      title: 'Entrenamiento Semanal',
      type: 'training',
      date: '2024-01-23',
      time: '18:00',
      description: 'Sesión de entrenamiento obligatoria para todos los equipos',
      location: 'Centro de Entrenamiento',
      participants: ['Todos los DTs'],
      status: 'scheduled',
      priority: 'medium',
      createdBy: 'admin'
    },
    {
      id: '3',
      title: 'Reunión Administrativa',
      type: 'meeting',
      date: '2024-01-24',
      time: '19:30',
      description: 'Reunión mensual con directivos y administradores',
      location: 'Sala Virtual',
      participants: ['admin', 'moderators'],
      status: 'scheduled',
      priority: 'medium',
      createdBy: 'admin'
    },
    {
      id: '4',
      title: 'Cierre Mercado Invierno',
      type: 'deadline',
      date: '2024-01-25',
      time: '23:59',
      description: 'Fecha límite para transferencias del mercado de invierno',
      status: 'scheduled',
      priority: 'high',
      createdBy: 'admin'
    },
    {
      id: '5',
      title: 'Mantenimiento Servidor',
      type: 'maintenance',
      date: '2024-01-26',
      time: '02:00',
      description: 'Mantenimiento programado del servidor - 2 horas aprox.',
      status: 'scheduled',
      priority: 'high',
      createdBy: 'system'
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
    // mockEvents is recreated on each render but contains static data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.type === filter;
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                         event.description.toLowerCase().includes(search.toLowerCase());
    const matchesDate = viewMode === 'list' || event.date === selectedDate;
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const todayEvents = events.filter(e => e.date === new Date().toISOString().split('T')[0]).length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const highPriorityEvents = events.filter(e => e.priority === 'high').length;
  const totalEvents = events.length;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'training': return Users;
      case 'meeting': return Users;
      case 'deadline': return AlertCircle;
      case 'maintenance': return Settings;
      default: return Calendar;
    }
  };

  const getEventColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-500/30 bg-red-500/10';
    switch (type) {
      case 'match': return 'border-blue-500/30 bg-blue-500/10';
      case 'training': return 'border-green-500/30 bg-green-500/10';
      case 'meeting': return 'border-purple-500/30 bg-purple-500/10';
      case 'deadline': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'maintenance': return 'border-gray-500/30 bg-gray-500/10';
      default: return 'border-gray-700/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendario de Eventos</h1>
            <p className="text-gray-400">Gestiona y monitorea todos los eventos del sistema</p>
          </div>
          <div className="flex items-center space-x-3">
            {highPriorityEvents > 0 && (
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-400 font-medium">{highPriorityEvents} eventos críticos</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowEventModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Nuevo Evento</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Hoy"
            value={todayEvents}
            icon={Calendar}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <StatsCard
            title="Próximos"
            value={upcomingEvents}
            icon={Clock}
            gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
          />
          <StatsCard
            title="Críticos"
            value={highPriorityEvents}
            icon={AlertCircle}
            gradient="bg-gradient-to-br from-red-500 to-pink-600"
          />
          <StatsCard
            title="Total"
            value={totalEvents}
            icon={Calendar}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchFilter
                search={search}
                onSearchChange={setSearch}
                placeholder="Buscar eventos..."
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input min-w-[140px]"
              >
                <option value="all">Todos</option>
                <option value="match">Partidos</option>
                <option value="training">Entrenamientos</option>
                <option value="meeting">Reuniones</option>
                <option value="deadline">Fechas límite</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
              <div className="flex rounded-lg border border-gray-700 overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === 'calendar' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Calendario
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'calendar' && (
            <div className="mb-6">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input w-auto"
              />
            </div>
          )}

          <div className="space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const EventIcon = getEventIcon(event.type);
                const isEventToday = isToday(event.date);
                const isEventPast = isPast(event.date);
                
                return (
                  <div 
                    key={event.id} 
                    className={`bg-gray-900/50 rounded-lg border hover:border-primary/30 transition-all ${getEventColor(event.type, event.priority)} ${isEventPast && event.status !== 'completed' ? 'opacity-75' : ''}`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/20 rounded-lg">
                            <EventIcon size={18} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-medium text-white">{event.title}</h3>
                              {isEventToday && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                                  Hoy
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(event.status)}`}>
                                {event.status === 'scheduled' ? 'Programado' :
                                 event.status === 'in-progress' ? 'En curso' :
                                 event.status === 'completed' ? 'Completado' : 'Cancelado'}
                              </span>
                              <span className={`text-xs font-medium ${getPriorityColor(event.priority)}`}>
                                {event.priority === 'high' ? 'Alta' :
                                 event.priority === 'medium' ? 'Media' : 'Baja'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{formatDate(event.date)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{event.time}</span>
                              </span>
                              {event.location && (
                                <span className="flex items-center space-x-1">
                                  <MapPin size={14} />
                                  <span>{event.location}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 mt-2">{event.description}</p>
                            {event.participants && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-400">Participantes: </span>
                                <span className="text-xs text-gray-300">{event.participants.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar evento"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar evento"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron eventos</h3>
                <p className="text-gray-500">
                  {viewMode === 'calendar' 
                    ? 'No hay eventos programados para esta fecha'
                    : 'Intenta ajustar los filtros de búsqueda'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarAdminPanel;
 