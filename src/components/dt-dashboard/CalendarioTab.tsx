import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Trophy, 
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Users,
  Target,
  BookOpen,
  AlertCircle,
  CheckCircle,
  X,
  Edit3,
  Trash2
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const weekDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface ClubEvent {
  id: string;
  type: 'match' | 'training' | 'meeting' | 'event';
  title: string;
  description?: string;
  date: string;
  duration: number; // in minutes
  location?: string;
  participants?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function CalendarioTab() {
  const { club, fixtures, tournaments } = useDataStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [eventFilter, setEventFilter] = useState<'all' | 'matches' | 'training' | 'meetings'>('all');

  // Mock data for club events (en producción esto vendría del store)
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([
    {
      id: '1',
      type: 'training',
      title: 'Entrenamiento Táctico',
      description: 'Trabajo en formación 4-3-3 y transiciones',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      location: 'Campo Principal',
      participants: ['Plantilla completa'],
      status: 'scheduled'
    },
    {
      id: '2',
      type: 'meeting',
      title: 'Reunión de Equipo',
      description: 'Análisis del último partido y preparación del próximo',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      location: 'Sala de Reuniones',
      participants: ['Plantilla completa', 'Cuerpo técnico'],
      status: 'scheduled'
    }
  ]);

  const clubMatches = useMemo(() => 
    fixtures.filter(match => 
      match.homeTeam === club?.name || match.awayTeam === club?.name
    ),
    [fixtures, club?.name]
  );

  const nextMatch = useMemo(() => 
    clubMatches.find(match => !match.played),
    [clubMatches]
  );

  // Combine matches and club events
  const allEvents = useMemo(() => {
    const matchEvents: ClubEvent[] = clubMatches.map(match => ({
      id: `match-${match.id}`,
      type: 'match' as const,
      title: `${match.homeTeam} vs ${match.awayTeam}`,
      description: match.tournament || 'Liga',
      date: match.date,
      duration: 120,
      location: 'Estadio',
      participants: [match.homeTeam, match.awayTeam],
      status: match.played ? 'completed' as const : 'scheduled' as const
    }));

    return [...matchEvents, ...clubEvents].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [clubMatches, clubEvents]);

  const filteredEvents = useMemo(() => {
    if (eventFilter === 'all') return allEvents;
    return allEvents.filter(event => event.type === eventFilter);
  }, [allEvents, eventFilter]);

  const monthEvents = useMemo(() => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  }, [filteredEvents, currentDate]);

  const weekEvents = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  }, [filteredEvents, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDay = (day: number | null, date?: Date) => {
    if (!day && !date) return [];
    
    const targetDate = date || new Date(currentDate.getFullYear(), currentDate.getMonth(), day!);
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === targetDate.getDate() &&
             eventDate.getMonth() === targetDate.getMonth() &&
             eventDate.getFullYear() === targetDate.getFullYear();
    });
  };

  const getTimeUntilNextMatch = () => {
    if (!nextMatch) return null;
    
    const now = new Date();
    const matchDate = new Date(nextMatch.date);
    const diff = matchDate.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  const countdown = getTimeUntilNextMatch();
  const days = getDaysInMonth(currentDate);
  const weekDays = getWeekDays();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'match': return <Trophy size={16} />;
      case 'training': return <Target size={16} />;
      case 'meeting': return <Users size={16} />;
      case 'event': return <BookOpen size={16} />;
      default: return <CalendarIcon size={16} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'match': return 'border-primary/30 bg-primary/20';
      case 'training': return 'border-green-500/30 bg-green-500/20';
      case 'meeting': return 'border-blue-500/30 bg-blue-500/20';
      case 'event': return 'border-purple-500/30 bg-purple-500/20';
      default: return 'border-white/30 bg-white/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Next Match Countdown */}
      {nextMatch && countdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-2xl p-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32">
            <Trophy size={128} className="opacity-10 text-primary" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-primary" size={20} />
              <h3 className="text-xl font-bold text-white">Próximo Partido</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <img 
                      src={club?.logo} 
                      alt={club?.name}
                      className="w-12 h-12 rounded-xl mx-auto mb-2"
                    />
                    <p className="text-sm text-white/70">{club?.name}</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">VS</div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Trophy size={24} className="text-white/50" />
                    </div>
                    <p className="text-sm text-white/70">
                      {nextMatch.homeTeam === club?.name ? nextMatch.awayTeam : nextMatch.homeTeam}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin size={14} />
                  <span>{nextMatch.homeTeam === club?.name ? 'Local' : 'Visitante'}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-white/70 mb-2">Tiempo restante:</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-2xl font-bold text-primary">{countdown.days}</div>
                    <div className="text-xs text-white/70">Días</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-2xl font-bold text-primary">{countdown.hours}</div>
                    <div className="text-xs text-white/70">Horas</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-2xl font-bold text-primary">{countdown.minutes}</div>
                    <div className="text-xs text-white/70">Min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Calendar Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <CalendarIcon size={24} />
              {viewMode === 'month' 
                ? `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `Semana del ${weekDays[0]?.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
              }
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'month'
                    ? 'bg-primary text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-primary text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Semana
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value as any)}
              className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos los eventos</option>
              <option value="matches">Solo partidos</option>
              <option value="training">Solo entrenamientos</option>
              <option value="meetings">Solo reuniones</option>
            </select>

            <button
              onClick={() => setShowEventModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary-light transition-colors"
            >
              <Plus size={16} />
              Nuevo Evento
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-white" />
            </motion.button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            Hoy
          </button>
        </div>

        {/* Calendar Grid */}
        {viewMode === 'month' ? (
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {weekDayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              const events = getEventsForDay(day);
              const isToday = day && 
                new Date().getDate() === day && 
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear();
              
              return (
                <motion.div
                  key={index}
                  whileHover={day ? { scale: 1.05 } : {}}
                  className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all ${
                    day 
                      ? isToday
                        ? 'bg-primary text-black font-bold'
                        : events.length > 0
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      : ''
                  }`}
                >
                  {day && (
                    <>
                      <span className="font-medium">{day}</span>
                      {events.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {events.slice(0, 2).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`w-2 h-2 rounded-full mx-auto ${getEventColor(event.type).split(' ')[1]}`}
                              title={event.title}
                            />
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-white/60">+{events.length - 2}</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Week headers */}
            {weekDays.map((day, index) => (
              <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
                <div>{day}</div>
                <div className="text-xs text-white/40">
                  {weekDays[index]?.getDate()}
                </div>
              </div>
            ))}
            
            {/* Week days */}
            {weekDays.map((date, index) => {
              const events = getEventsForDay(null, date);
              const isToday = date && 
                new Date().getDate() === date.getDate() && 
                new Date().getMonth() === date.getMonth() &&
                new Date().getFullYear() === date.getFullYear();
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`min-h-[120px] p-2 rounded-lg transition-all ${
                    isToday
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs text-white/60 mb-2">
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {events.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`p-2 rounded text-xs ${getEventColor(event.type)} cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {getEventIcon(event.type)}
                          <span className="font-medium truncate">{event.title}</span>
                        </div>
                        <div className="text-white/70 text-xs">
                          {new Date(event.date).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">
          {viewMode === 'month' ? 'Eventos del Mes' : 'Eventos de la Semana'}
        </h3>
        
        {(viewMode === 'month' ? monthEvents : weekEvents).length === 0 ? (
          <p className="text-white/60 text-center py-8">No hay eventos programados en este período</p>
        ) : (
          <div className="space-y-4">
            {(viewMode === 'month' ? monthEvents : weekEvents).map(event => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border transition-all ${getEventColor(event.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <div className="text-xs text-white/60">
                        {new Date(event.date).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </div>
                      <div className="text-sm font-medium text-white">
                        {new Date(event.date).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type)}
                        <div>
                          <div className="font-medium text-white">{event.title}</div>
                          {event.description && (
                            <div className="text-xs text-white/70">{event.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      event.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : event.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {event.status === 'completed' ? 'Completado' : 
                       event.status === 'cancelled' ? 'Cancelado' : 'Programado'}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2 text-xs text-white/60 mt-3">
                    <MapPin size={12} />
                    <span>{event.location}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {selectedEvent ? 'Editar Evento' : 'Nuevo Evento'}
                </h3>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Tipo de Evento
                  </label>
                  <select className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="training">Entrenamiento</option>
                    <option value="meeting">Reunión</option>
                    <option value="event">Evento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: Entrenamiento Táctico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: Campo Principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Descripción
                  </label>
                  <textarea
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Descripción del evento..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary-light transition-colors">
                  {selectedEvent ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
 