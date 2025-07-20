import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Trophy, Users, Star, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'match' | 'tournament' | 'training' | 'social';
  description?: string;
  location?: string;
  participants?: string[];
}

/**
 * Calendario de eventos para mostrar partidos, torneos y eventos programados
 */
const EventsCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Eventos de ejemplo
  const events: Event[] = [
    {
      id: '1',
      title: 'Liga Master: vs Atlético Pixelado',
      date: new Date(2025, 6, 21, 20, 0), // 21 de julio de 2025, 20:00
      type: 'match',
      description: 'Jornada 5 de la Liga Master',
      location: 'Estadio Virtual'
    },
    {
      id: '2',
      title: 'Torneo Verano 2025',
      date: new Date(2025, 6, 25, 18, 0), // 25 de julio de 2025, 18:00
      type: 'tournament',
      description: 'Fase de grupos del Torneo de Verano',
      location: 'Complejo Deportivo Digital'
    },
    {
      id: '3',
      title: 'Entrenamiento táctico',
      date: new Date(2025, 6, 23, 16, 0), // 23 de julio de 2025, 16:00
      type: 'training',
      description: 'Sesión de entrenamiento táctico con el equipo'
    },
    {
      id: '4',
      title: 'Reunión de la comunidad',
      date: new Date(2025, 6, 27, 19, 0), // 27 de julio de 2025, 19:00
      type: 'social',
      description: 'Encuentro virtual con miembros de la comunidad',
      participants: ['Usuario1', 'Usuario2', 'Usuario3']
    }
  ];
  
  // Obtener el primer día del mes actual
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };
  
  // Obtener el último día del mes actual
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };
  
  // Obtener todos los días del mes para mostrar en el calendario
  const getDaysInMonth = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const lastDay = getLastDayOfMonth(currentDate);
    
    // Obtener el primer día de la semana (domingo = 0)
    const firstDayOfWeek = firstDay.getDay();
    
    // Crear array con todos los días a mostrar
    const days = [];
    
    // Añadir días del mes anterior para completar la primera semana
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        hasEvents: events.some(event => 
          event.date.getDate() === date.getDate() && 
          event.date.getMonth() === date.getMonth() && 
          event.date.getFullYear() === date.getFullYear()
        )
      });
    }
    
    // Añadir días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({
        date,
        isCurrentMonth: true,
        hasEvents: events.some(event => 
          event.date.getDate() === date.getDate() && 
          event.date.getMonth() === date.getMonth() && 
          event.date.getFullYear() === date.getFullYear()
        )
      });
    }
    
    // Añadir días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        hasEvents: events.some(event => 
          event.date.getDate() === date.getDate() && 
          event.date.getMonth() === date.getMonth() && 
          event.date.getFullYear() === date.getFullYear()
        )
      });
    }
    
    return days;
  };
  
  // Obtener eventos para una fecha específica
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  // Cambiar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };
  
  // Cambiar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };
  
  // Formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  // Formatear hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Obtener icono según el tipo de evento
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Trophy size={16} className="text-blue-400" />;
      case 'tournament':
        return <Star size={16} className="text-yellow-400" />;
      case 'training':
        return <Clock size={16} className="text-green-400" />;
      case 'social':
        return <Users size={16} className="text-purple-400" />;
      default:
        return <Calendar size={16} className="text-gray-400" />;
    }
  };
  
  // Obtener color según el tipo de evento
  const getEventColor = (type: string) => {
    switch (type) {
      case 'match':
        return 'blue';
      case 'tournament':
        return 'yellow';
      case 'training':
        return 'green';
      case 'social':
        return 'purple';
      default:
        return 'gray';
    }
  };
  
  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Obtener todos los días a mostrar
  const days = getDaysInMonth();
  
  // Eventos para la fecha seleccionada
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="bg-dark-lighter/30 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center">
          <Calendar size={20} className="mr-2 text-primary" />
          Calendario de Eventos
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              viewMode === 'month' 
                ? 'bg-primary/20 text-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setViewMode('month')}
          >
            Mes
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              viewMode === 'week' 
                ? 'bg-primary/20 text-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setViewMode('week')}
          >
            Semana
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Cabecera del calendario */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium">
            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex space-x-2">
            <button 
              className="p-2 rounded-full hover:bg-gray-700/30 text-gray-400 hover:text-white transition-colors"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-700/30 text-gray-400 hover:text-white transition-colors"
              onClick={goToNextMonth}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div 
              key={index}
              className={`relative p-2 min-h-[80px] rounded-lg cursor-pointer transition-all duration-200 ${
                day.isCurrentMonth 
                  ? 'bg-dark/30 hover:bg-dark-lighter/50' 
                  : 'bg-dark/10 text-gray-500 hover:bg-dark/20'
              } ${
                selectedDate && 
                selectedDate.getDate() === day.date.getDate() && 
                selectedDate.getMonth() === day.date.getMonth() && 
                selectedDate.getFullYear() === day.date.getFullYear()
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => setSelectedDate(day.date)}
            >
              <div className="text-right mb-1">
                {day.date.getDate()}
              </div>
              
              {/* Indicador de eventos */}
              {day.hasEvents && (
                <div className="space-y-1">
                  {getEventsForDate(day.date).slice(0, 2).map(event => (
                    <div 
                      key={event.id}
                      className={`text-xs truncate p-1 rounded bg-${getEventColor(event.type)}-500/20 text-${getEventColor(event.type)}-400`}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {getEventsForDate(day.date).length > 2 && (
                    <div className="text-xs text-center text-gray-400">
                      +{getEventsForDate(day.date).length - 2} más
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Detalles de eventos para la fecha seleccionada */}
      {selectedDate && (
        <div className="p-4 border-t border-gray-800 bg-dark/30">
          <h4 className="text-lg font-medium mb-3">
            {formatDate(selectedDate)}
          </h4>
          
          {selectedDateEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDateEvents.map(event => (
                <div 
                  key={event.id}
                  className={`p-3 rounded-lg bg-${getEventColor(event.type)}-500/10 border border-${getEventColor(event.type)}-500/20`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg bg-${getEventColor(event.type)}-500/20 mr-3`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium">{event.title}</h5>
                        <span className="text-sm text-gray-400">{formatTime(event.date)}</span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-2">
                          Ubicación: {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">
              No hay eventos programados para esta fecha
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;