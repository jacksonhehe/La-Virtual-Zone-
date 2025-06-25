import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import { useDataStore } from '../store/dataStore';
import { formatDate } from '../utils/helpers';
import usePersistentState from '../hooks/usePersistentState';

const Fixtures = () => {
  const [selectedRound, setSelectedRound] = usePersistentState<number | null>('fixtures_round', null);
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});
  
  const { tournaments, clubs } = useDataStore();
  
  // Get Liga Master tournament
  const ligaMaster = tournaments.find(t => t.id === 'tournament1');
  
  if (!ligaMaster) {
    return (
      <div>
        <PageHeader 
          title="Fixture y Resultados" 
          subtitle="Calendario de partidos y resultados de la Liga Master."
          image="https://images.unsplash.com/photo-1512242712282-774a8bc0d9d3?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
        />
        
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="card p-6">
            <p>No se encontró información del torneo.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Get unique rounds
  const rounds = Array.from(
    new Set(ligaMaster.matches.map(match => match.round))
  ).sort((a, b) => a - b);
  
  // Set first round as default if none selected
  if (selectedRound === null && rounds.length > 0) {
    setSelectedRound(rounds[0]);
  }
  
  // Get matches for selected round
  const roundMatches = selectedRound !== null 
    ? ligaMaster.matches.filter(match => match.round === selectedRound)
    : [];
  
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
        
        {/* Tournament info */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold">{ligaMaster.name}</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="text-gray-400">
              <span className="text-white font-medium">{ligaMaster.teams.length}</span> equipos
            </div>
            <div className="text-gray-400">
              <span className="text-white font-medium">{ligaMaster.rounds}</span> jornadas
            </div>
            <div className="text-gray-400">
              <span className="text-white font-medium">{ligaMaster.matches.length}</span> partidos
            </div>
            <div className="text-gray-400">
              <span className="text-white font-medium">{formatDate(ligaMaster.startDate)}</span> - <span className="text-white font-medium">{formatDate(ligaMaster.endDate)}</span>
            </div>
          </div>
        </div>
        
        {/* Round selector */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {rounds.map(round => (
              <button 
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${selectedRound === round ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                Jornada {round}
              </button>
            ))}
          </div>
        </div>
        
        {/* Matches */}
        <div className="space-y-4">
          {roundMatches.map(match => {
            const homeClub = getClub(match.homeTeam);
            const awayClub = getClub(match.awayTeam);
            const isExpanded = expandedMatches[match.id] || false;
            
            return (
              <Card
                key={match.id}
                className="overflow-hidden bg-gradient-to-br from-dark to-gray-800 border border-gray-700"
              >
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      {formatDate(match.date)} • Jornada {match.round}
                    </div>
                    <div className="text-sm">
                      {match.status === 'scheduled' && (
                        <span className="badge bg-blue-500/20 text-blue-400">Programado</span>
                      )}
                      {match.status === 'live' && (
                        <span className="badge bg-green-500/20 text-green-400">En vivo</span>
                      )}
                      {match.status === 'finished' && (
                        <span className="badge bg-gray-500/20 text-gray-400">Finalizado</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center w-2/5 sm:w-1/3">
                      <img
                        src={homeClub?.logo}
                        alt={homeClub?.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2"
                      />
                      <span className="font-medium text-center">{homeClub?.name}</span>
                    </div>

                    <div className="flex flex-col items-center flex-1 text-center">
                      {match.status === 'finished' ? (
                        <div className="text-3xl sm:text-4xl font-bold mb-1 neon-text-blue">
                          {match.homeScore} - {match.awayScore}
                        </div>
                      ) : (
                        <div className="text-2xl sm:text-3xl font-bold mb-1 neon-text-blue">VS</div>
                      )}
                      
                      <button
                        onClick={() => toggleMatchDetails(match.id)}
                        className="text-primary text-sm flex items-center"
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
                    
                    <div className="flex flex-col items-center w-2/5 sm:w-1/3">
                      <img
                        src={awayClub?.logo}
                        alt={awayClub?.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2"
                      />
                      <span className="font-medium text-center">{awayClub?.name}</span>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-4 pt-0">
                    <div className="border-t border-gray-800 my-4" />
                    
                    {match.status === 'finished' && match.scorers && match.scorers.length > 0 ? (
                      <div>
                        <h3 className="font-bold mb-3">Goleadores</h3>
                        <ul className="space-y-2">
                          {match.scorers.map((scorer, index) => {
                            const club = clubs.find(c => c.id === scorer.clubId);
                            
                            return (
                              <li key={index} className="flex items-center">
                                <div className="w-12 text-center text-gray-400">
                                  {scorer.minute}'
                                </div>
                                <div className="flex items-center">
                                  <img 
                                    src={club?.logo} 
                                    alt={club?.name}
                                    className="w-5 h-5 mr-2"
                                  />
                                  <span>{scorer.playerName}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        {match.status === 'finished' 
                          ? 'No hay información detallada disponible para este partido.' 
                          : 'El partido aún no se ha disputado.'}
                      </div>
                    )}
                  </div>
                )}
                </Card>
              );
          })}
          
          {roundMatches.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-gray-400">No hay partidos disponibles para esta jornada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fixtures;
 