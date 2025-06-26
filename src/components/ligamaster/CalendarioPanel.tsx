import { useState } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import { Clock, MapPin, Users, Star, TrendingUp, Calendar as CalendarIcon, Trophy } from 'lucide-react';

const mockMatches = [
  {
    id: 1,
    date: new Date(2024, 11, 15),
    opponent: 'Real Madrid',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
    location: 'Santiago Bernabéu',
    isHome: false,
    result: null,
    importance: 'high'
  },
  {
    id: 2,
    date: new Date(2024, 11, 22),
    opponent: 'Atletico Madrid',
    logo: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop',
    location: 'Camp Nou',
    isHome: true,
    result: { home: 2, away: 1 },
    importance: 'medium'
  },
  {
    id: 3,
    date: new Date(2024, 11, 29),
    opponent: 'Valencia CF',
    logo: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100&h=100&fit=crop',
    location: 'Mestalla',
    isHome: false,
    result: null,
    importance: 'low'
  },
];

const mockEvents = [
  {
    id: 1,
    date: new Date(2024, 11, 10),
    type: 'training',
    title: 'Entrenamiento Táctico',
    description: 'Trabajo de posicionamiento defensivo'
  },
  {
    id: 2,
    date: new Date(2024, 11, 18),
    type: 'medical',
    title: 'Revisiones Médicas',
    description: 'Chequeos rutinarios del plantel'
  },
  {
    id: 3,
    date: new Date(2024, 11, 25),
    type: 'travel',
    title: 'Viaje a Valencia',
    description: 'Salida hacia Valencia para el partido'
  },
];

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

  function getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    return { total, days, hours, minutes, seconds };
  }

  const nextMatch = mockMatches.find(match => match.result === null);

  if (!nextMatch || timeLeft.total <= 0) {
    return <div className="text-gray-400">No hay próximos partidos</div>;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Clock className="text-blue-400" size={20} />
        Próximo Partido
      </h3>
      
      <div className="flex items-center gap-4 mb-6">
        <img
          src={nextMatch.logo}
          alt={nextMatch.opponent}
          className="w-16 h-16 rounded-full border-2 border-gray-600"
        />
        <div>
          <h4 className="text-xl font-bold text-white">{nextMatch.opponent}</h4>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin size={14} />
            <span>{nextMatch.location}</span>
            {nextMatch.isHome && <span className="text-green-400">(Local)</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        {[
          { label: 'Días', value: timeLeft.days },
          { label: 'Horas', value: timeLeft.hours },
          { label: 'Min', value: timeLeft.minutes },
          { label: 'Seg', value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{item.value}</div>
            <div className="text-gray-400 text-xs">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MatchCard = ({ match }) => {
  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-green-500 bg-green-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border ${getImportanceColor(match.importance)} cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={match.logo}
            alt={match.opponent}
            className="w-12 h-12 rounded-full border border-gray-600"
          />
          <div>
            <h4 className="text-white font-semibold">{match.opponent}</h4>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin size={12} />
              <span>{match.location}</span>
            </div>
          </div>
        </div>
        
        {match.result ? (
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {match.result.home} - {match.result.away}
            </div>
            <div className="text-green-400 text-xs">Ganado</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-400 text-sm">
              {match.date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'short'
              })}
            </div>
            <div className="text-gray-400 text-xs">
              {match.date.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded ${match.isHome ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
          {match.isHome ? 'Local' : 'Visitante'}
        </span>
        <span className={`
          px-2 py-1 rounded text-white
          ${match.importance === 'high' ? 'bg-red-600' : 
            match.importance === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}
        `}>
          {match.importance === 'high' ? 'Alta' : 
           match.importance === 'medium' ? 'Media' : 'Baja'} importancia
        </span>
      </div>
    </motion.div>
  );
};

const CalendarioPanel = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('calendar');

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasMatch = mockMatches.some(match => 
        match.date.toDateString() === date.toDateString()
      );
      const hasEvent = mockEvents.some(event => 
        event.date.toDateString() === date.toDateString()
      );
      
      return (
        <div className="flex justify-center gap-1 mt-1">
          {hasMatch && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
          {hasEvent && <div className="w-2 h-2 bg-green-500 rounded-full" />}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
        <div className="flex space-x-2">
          {[
            { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
            { id: 'matches', label: 'Partidos', icon: Trophy },
            { id: 'countdown', label: 'Próximo', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${view === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === 'calendar' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Calendar */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-6">Calendario de Eventos</h3>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="react-calendar-dark w-full"
            />
          </div>

          {/* Events for Selected Date */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">
              {selectedDate.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'long' 
              })}
            </h3>
            
            <div className="space-y-4">
              {mockMatches
                .filter(match => match.date.toDateString() === selectedDate.toDateString())
                .map(match => (
                  <div key={match.id} className="p-3 bg-blue-600/20 rounded-lg border border-blue-600/30">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <Trophy size={14} />
                      <span className="font-medium">Partido</span>
                    </div>
                    <p className="text-white">{match.opponent}</p>
                    <p className="text-gray-400 text-sm">{match.location}</p>
                  </div>
                ))}
              
              {mockEvents
                .filter(event => event.date.toDateString() === selectedDate.toDateString())
                .map(event => (
                  <div key={event.id} className="p-3 bg-green-600/20 rounded-lg border border-green-600/30">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <Star size={14} />
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{event.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}

      {view === 'matches' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {mockMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </motion.div>
      )}

      {view === 'countdown' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CountdownTimer targetDate={mockMatches.find(m => !m.result)?.date} />
        </motion.div>
      )}
    </div>
  );
};

export default CalendarioPanel;
 