import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronUp, Calendar, Clock, MapPin, Users, Trophy, CalendarDays } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import TournamentStats from '../components/common/TournamentStats';
import MatchCard from '../components/common/MatchCard';
import { useDataStore } from '../store/dataStore';
import { formatDate } from '../utils/helpers';
import usePersistentState from '../hooks/usePersistentState';

const Fixtures = () => {
  const [selectedRound, setSelectedRound] = usePersistentState<number | null>('fixtures_round', null);
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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

  // Get match statistics
  const getMatchStats = (match: any) => {
    const homeClub = getClub(match.homeTeam);
    const awayClub = getClub(match.awayTeam);
    
    return {
      homeClub,
      awayClub,
      isFinished: match.status === 'finished',
      isLive: match.status === 'live',
      isScheduled: match.status === 'scheduled'
    };
  };


  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PageHeader 
        title="Fixture y Resultados" 
        subtitle="Calendario de partidos y resultados de la Liga Master."
        image="https://images.unsplash.com/photo-1494178270175-e96de2971df9?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/liga-master"
            className="inline-flex items-center text-primary hover:text-primary-light transition-colors duration-200 group"
          >
            <ChevronLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Volver a Liga Master</span>
          </Link>
        </div>
        
        {/* Tournament info card */}
        <div className="card p-8 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold gradient-text-primary">{ligaMaster.name}</h2>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                                     className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                     viewMode === 'grid' 
                       ? 'bg-primary text-white shadow-lg' 
                       : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                   }`}
                >
                  Vista Cuadrícula
                </button>
                <button
                  onClick={() => setViewMode('list')}
                                     className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                     viewMode === 'list' 
                       ? 'bg-primary text-white shadow-lg' 
                       : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                   }`}
                >
                  Vista Lista
                </button>
              </div>
            </div>
          </div>
          
          {/* Tournament Statistics */}
          <TournamentStats tournament={ligaMaster} />
        </div>
        
        {/* Round selector */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-white">Seleccionar Jornada</h3>
          <div className="overflow-x-auto">
            <div className="flex space-x-3 min-w-max pb-2">
              {rounds.map(round => (
                <button 
                  key={round}
                  onClick={() => setSelectedRound(round)}
                                     className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                     selectedRound === round 
                       ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                       : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                   }`}
                >
                  Jornada {round}
                </button>
              ))}
            </div>
          </div>
        </div>
        
                {/* Matches */}
        <div className={`space-y-6 ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
          {roundMatches.map(match => {
            const { homeClub, awayClub } = getMatchStats(match);
            const isExpanded = expandedMatches[match.id] || false;
            
            return (
              <MatchCard
                key={match.id}
                match={match}
                homeClub={homeClub}
                awayClub={awayClub}
                onToggleDetails={toggleMatchDetails}
                isExpanded={isExpanded}
                viewMode={viewMode}
              />
            );
          })}
          
          {roundMatches.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No hay partidos disponibles</h3>
              <p className="text-gray-400">No hay partidos programados para esta jornada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fixtures;
 