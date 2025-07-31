import  { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin, Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function CalendarioTab() {
  const { club, fixtures, tournaments } = useDataStore();
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const monthMatches = useMemo(() => {
    return clubMatches.filter(match => {
      const matchDate = new Date(match.date);
      return matchDate.getMonth() === currentDate.getMonth() &&
             matchDate.getFullYear() === currentDate.getFullYear();
    });
  }, [clubMatches, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
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

  const getMatchForDay = (day: number | null) => {
    if (!day) return null;
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return monthMatches.find(match => {
      const matchDate = new Date(match.date);
      return matchDate.getDate() === day;
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

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon size={24} />
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateMonth('prev')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateMonth('next')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-white" />
            </motion.button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => {
            const match = getMatchForDay(day);
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
                      : match
                        ? match.played
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    : ''
                }`}
              >
                {day && (
                  <>
                    <span className={match ? 'text-xs' : ''}>{day}</span>
                    {match && (
                      <div className="text-xs mt-1 text-center">
                        {match.played ? (
                          <div className="font-bold">
                            {match.homeTeam === club?.name 
                              ? `${match.homeScore}-${match.awayScore}`
                              : `${match.awayScore}-${match.homeScore}`
                            }
                          </div>
                        ) : (
                          <div className="font-medium">
                            {new Date(match.date).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Match List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Partidos del Mes</h3>
        {monthMatches.length === 0 ? (
          <p className="text-white/60 text-center py-8">No hay partidos programados este mes</p>
        ) : (
          <div className="space-y-4">
            {monthMatches.map(match => (
              <motion.div
                key={match.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border transition-all ${
                  match.played
                    ? 'bg-white/5 border-white/10'
                    : 'bg-primary/10 border-primary/20 hover:bg-primary/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-xs text-white/60">
                        {new Date(match.date).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </div>
                      <div className="text-sm font-medium text-white">
                        {new Date(match.date).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {match.homeTeam === club?.name ? club.name : match.homeTeam}
                        </div>
                        <div className="text-xs text-white/60">
                          {match.homeTeam === club?.name ? 'Local' : 'Visitante'}
                        </div>
                      </div>
                      
                      <div className="text-center px-3">
                        {match.played ? (
                          <div className="text-lg font-bold text-primary">
                            {match.homeScore} - {match.awayScore}
                          </div>
                        ) : (
                          <div className="text-white/40 font-bold">VS</div>
                        )}
                      </div>
                      
                      <div>
                        <div className="font-medium text-white">
                          {match.awayTeam === club?.name ? club.name : match.awayTeam}
                        </div>
                        <div className="text-xs text-white/60">
                          {match.awayTeam === club?.name ? 'Local' : 'Visitante'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {match.played && (
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      (match.homeTeam === club?.name && match.homeScore! > match.awayScore!) ||
                      (match.awayTeam === club?.name && match.awayScore! > match.homeScore!)
                        ? 'bg-green-500/20 text-green-400'
                        : match.homeScore === match.awayScore
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {(match.homeTeam === club?.name && match.homeScore! > match.awayScore!) ||
                       (match.awayTeam === club?.name && match.awayScore! > match.homeScore!)
                        ? 'Victoria'
                        : match.homeScore === match.awayScore
                        ? 'Empate'
                        : 'Derrota'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
 