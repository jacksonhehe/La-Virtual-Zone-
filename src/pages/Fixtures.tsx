import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronUp, Award, Target } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDataStore } from '../store/dataStore';
import { formatDate } from '../utils/format';
import { listMatches } from '../utils/matchService';
import type { Match } from '../types';

const Fixtures = () => {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [allMatches, setAllMatches] = useState<(Match & { tournamentName?: string; tournamentLogo?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { tournaments, clubs } = useDataStore();
  
  // Load matches from independent table
  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const matches = await listMatches();
        
        // Enrich matches with tournament info
        const enrichedMatches = matches.map(match => {
          const tournament = tournaments.find(t => t.id === match.tournamentId);
          return {
            ...match,
            tournamentName: tournament?.name,
            tournamentLogo: tournament?.logo
          };
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setAllMatches(enrichedMatches);
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMatches();
  }, [tournaments]);
  
  // Get unique rounds from all matches
  const rounds = Array.from(
    new Set(allMatches.map(match => match.round))
  ).sort((a, b) => a - b);
  
  // Get unique tournaments
  const tournamentList = tournaments.map(t => ({ id: t.id, name: t.name, logo: t.logo }));
  
  // Set first round as default if none selected and we have matches
  useEffect(() => {
    if (selectedRound === null && rounds.length > 0) {
      setSelectedRound(rounds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rounds.length]);
  
  // Show loading state
  if (loading) {
    return (
      <div>
        <PageHeader 
          title="Fixture y Resultados" 
          subtitle="Calendario de partidos y resultados de la Liga Master."
          image="https://images.unsplash.com/photo-1494178270175-e96de2971df9?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="card p-8 text-center">
            <p className="text-gray-400">Cargando partidos...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Filter matches by tournament and round
  let filteredMatches = allMatches;
  
  if (selectedTournament !== 'all') {
    filteredMatches = filteredMatches.filter(m => m.tournamentId === selectedTournament);
  }
  
  if (selectedRound !== null) {
    filteredMatches = filteredMatches.filter(match => match.round === selectedRound);
  }
  
  // Toggle match details
  const toggleMatchDetails = (matchId: string) => {
    setExpandedMatches(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };
  
  // Get club by name
  const getClub = (name: string) => {
    return clubs.find(c => c.name === name);
  };

  // Handle image error
  const handleImageError = (clubId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [clubId]: true
    }));
  };

  // Get logo source with fallback
  const getLogoSrc = (club: any) => {
    if (imageErrors[club?.id]) {
      return '/default-club.svg';
    }
    return club?.logo || '/default-club.svg';
  };
  
  return (
    <div>
      <PageHeader 
        title="Fixture y Resultados" 
        subtitle="Calendario de partidos y resultados de la Liga Master."
        image="https://images.unsplash.com/photo-1494178270175-e96de2971df9?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/liga-master"
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver a Liga Master</span>
          </Link>
        </div>
        
        {/* Tournament info and filters */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Fixture y Resultados</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="text-gray-400">
                  <span className="text-white font-medium">{tournaments.length}</span> torneos
                </div>
                <div className="text-gray-400">
                  <span className="text-white font-medium">{rounds.length}</span> jornadas
                </div>
                <div className="text-gray-400">
                  <span className="text-white font-medium">{allMatches.length}</span> partidos totales
                </div>
              </div>
            </div>
            
            {/* Tournament filter */}
            <div className="flex-shrink-0">
              <label className="block text-sm text-gray-400 mb-2">Filtrar por torneo</label>
              <select
                value={selectedTournament}
                onChange={(e) => {
                  setSelectedTournament(e.target.value);
                  setSelectedRound(null); // Reset round when tournament changes
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Todos los torneos</option>
                {tournamentList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Round selector */}
        {rounds.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filtrar por jornada</h3>
              <button
                onClick={() => setSelectedRound(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedRound === null
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50'
                }`}
              >
                Todas las jornadas
              </button>
            </div>
            <div className="overflow-x-auto">
              <div className="flex space-x-3 min-w-max pb-2">
                {rounds.map(round => (
                  <button
                    key={round}
                    onClick={() => setSelectedRound(round)}
                    className={`px-5 py-3 rounded-lg whitespace-nowrap font-medium transition-all duration-200 transform hover:scale-105 ${
                      selectedRound === round
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50'
                    }`}
                  >
                    Jornada {round}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Matches */}
        <div className="space-y-6">
          {filteredMatches.map(match => {
            const homeClub = getClub(match.homeTeam);
            const awayClub = getClub(match.awayTeam);
            const isExpanded = expandedMatches[match.id] || false;

            return (
              <div key={match.id} className="card card-hover overflow-hidden shadow-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                <div className="p-5 border-b border-gray-700/50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="text-sm text-gray-300 font-medium">
                        {formatDate(match.date)} • Jornada {match.round}
                      </div>
                      {match.tournamentName && (
                        <div className="flex items-center gap-2">
                          <img src={match.tournamentLogo} alt={match.tournamentName} className="w-4 h-4 rounded" />
                          <span className="text-xs text-gray-400">{match.tournamentName}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      {match.status === 'scheduled' && (
                        <span className="badge bg-blue-500/25 text-blue-300 border border-blue-500/30 px-3 py-1">Programado</span>
                      )}
                      {match.status === 'live' && (
                        <span className="badge bg-green-500/25 text-green-300 border border-green-500/30 px-3 py-1 animate-pulse">En vivo</span>
                      )}
                      {match.status === 'finished' && (
                        <span className="badge bg-gray-500/25 text-gray-300 border border-gray-500/30 px-3 py-1">Finalizado</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center w-2/5 sm:w-1/3 group">
                      <div className="relative mb-3">
                        <img
                          src={getLogoSrc(homeClub)}
                          alt={homeClub?.name}
                          onError={() => handleImageError(homeClub?.id)}
                          className="w-14 h-14 sm:w-18 sm:h-18 object-contain rounded-lg bg-white/5 p-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <span className="font-semibold text-center text-white leading-tight">{homeClub?.name}</span>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      {match.status === 'finished' ? (
                        <div className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                          {match.homeScore} - {match.awayScore}
                        </div>
                      ) : (
                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-gray-400">VS</div>
                      )}

                      <button
                        onClick={() => toggleMatchDetails(match.id)}
                        className="text-primary hover:text-primary-light text-sm flex items-center transition-colors duration-200 hover:scale-105"
                      >
                        {isExpanded ? (
                          <>
                            <span>Menos detalles</span>
                            <ChevronUp size={16} className="ml-1" />
                          </>
                        ) : (
                          <>
                            <span>Más detalles</span>
                            <ChevronDown size={16} className="ml-1" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col items-center w-2/5 sm:w-1/3 group">
                      <div className="relative mb-3">
                        <img
                          src={getLogoSrc(awayClub)}
                          alt={awayClub?.name}
                          onError={() => handleImageError(awayClub?.id)}
                          className="w-14 h-14 sm:w-18 sm:h-18 object-contain rounded-lg bg-white/5 p-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <span className="font-semibold text-center text-white leading-tight">{awayClub?.name}</span>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-gradient-to-r from-transparent via-gray-700/50 to-transparent my-6" />

                    {match.status === 'finished' && match.scorers && match.scorers.length > 0 ? (
                      <div>
                        <h3 className="font-bold mb-4 text-lg text-white">Goleadores</h3>
                        <ul className="space-y-3">
                          {match.scorers.map((scorer, index) => {
                            const club = clubs.find(c => c.id === scorer.clubId);

                            return (
                              <li key={index} className="flex items-center p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors duration-200">
                                <div className="w-14 text-center">
                                  <span className="text-primary font-bold text-lg">{scorer.minute}'</span>
                                </div>
                                <div className="flex items-center flex-1">
                                  <img
                                    src={getLogoSrc(club)}
                                    alt={club?.name}
                                    onError={() => handleImageError(club?.id)}
                                    className="w-6 h-6 mr-3 rounded"
                                  />
                                  <span className="font-medium text-white">{scorer.playerName}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 bg-gray-800/20 rounded-lg">
                        <div className="mb-3">
                          <Target size={48} className="text-primary mx-auto" />
                        </div>
                        {match.status === 'finished'
                          ? 'No hay información detallada disponible para este partido.'
                          : 'El partido aún no se ha disputado.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredMatches.length === 0 && (
            <div className="card p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <div className="mb-4">
                <Award size={60} className="text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sin partidos disponibles</h3>
              <p className="text-gray-400">
                {selectedRound !== null 
                  ? `No hay partidos disponibles para la jornada ${selectedRound}.`
                  : selectedTournament !== 'all'
                  ? 'No hay partidos disponibles para este torneo.'
                  : 'No hay partidos programados.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fixtures;
 
