import  { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Trophy, Calendar, MapPin, Filter } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';

export default function FixtureTab() {
  const { user } = useAuthStore();
  const { fixtures, clubs, tournaments, club: userClub } = useDataStore();
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'played' | 'upcoming'>('all');

   const filteredFixtures = useMemo(() => {
    return (fixtures || [])
      .filter(match => { 
        const matchesToShow = userClub 
          ? match.homeTeam === userClub.name || match.awayTeam === userClub.name
          : true;
        
        const tournamentMatch = selectedTournament === 'all' || match.tournament === selectedTournament;
        const statusMatch = statusFilter === 'all' || 
          (statusFilter === 'played' && match.played) ||
          (statusFilter === 'upcoming' && !match.played);
        
        return matchesToShow && tournamentMatch && statusMatch;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [fixtures, userClub, selectedTournament, statusFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short',
      day: '2-digit', 
      month: 'short' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

   const getClubData = (clubName: string) => 
    clubs?.find(c => c.name === clubName); 

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
            >
              <option value="all">Todos los torneos</option>
                           {(tournaments || []).map(tournament => ( 
                <option key={tournament.id} value={tournament.name}>
                  {tournament.name}
                </option>
              ))}
            </select>

            <div className="flex rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              {(['all', 'upcoming', 'played'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === status 
                      ? 'bg-primary text-black' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {status === 'all' ? 'Todos' : status === 'upcoming' ? 'Próximos' : 'Jugados'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fixtures Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <AnimatePresence>
          {filteredFixtures.map((match, index) => {
            const homeClub = getClubData(match.homeTeam);
            const awayClub = getClubData(match.awayTeam);
            const isUserMatch = userClub && (match.homeTeam === userClub.name || match.awayTeam === userClub.name);
            
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-black/20 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 ${
                  isUserMatch 
                    ? 'border-primary/30 bg-primary/5' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {match.played ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <Clock size={18} className="text-yellow-500" />
                      )}
                      <span className="text-sm font-medium">
                        {match.played ? 'Finalizado' : 'Próximo'}
                      </span>
                    </div>
                    {match.tournament && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Trophy size={14} />
                        {match.tournament}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={14} />
                      {formatDate(match.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={14} />
                      {formatTime(match.date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex items-center gap-4 flex-1">
                    <img 
                      src={homeClub?.logo} 
                      alt={homeClub?.name}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{match.homeTeam}</h3>
                      <p className="text-sm text-gray-400">{homeClub?.stadium}</p>
                    </div>
                  </div>

                  {/* Score/VS */}
                  <div className="flex items-center gap-6 mx-8">
                    {match.played ? (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {match.homeScore} - {match.awayScore}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Final
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white/50">VS</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTime(match.date)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="text-right">
                      <h3 className="font-bold text-lg">{match.awayTeam}</h3>
                      <p className="text-sm text-gray-400">{awayClub?.stadium}</p>
                    </div>
                    <img 
                      src={awayClub?.logo} 
                      alt={awayClub?.name}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                  </div>
                </div>

                {match.venue && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin size={14} />
                      {match.venue}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredFixtures.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              No hay partidos
            </h3>
            <p className="text-gray-500">
              No se encontraron partidos con los filtros seleccionados
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
 