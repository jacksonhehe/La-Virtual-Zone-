import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import Card from './Card';

interface MatchCardProps {
  match: any;
  homeClub: any;
  awayClub: any;
  onToggleDetails: (matchId: string) => void;
  isExpanded: boolean;
  viewMode: 'grid' | 'list';
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  homeClub,
  awayClub,
  onToggleDetails,
  isExpanded,
  viewMode
}) => {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const isScheduled = match.status === 'scheduled';

  const getStatusBadge = () => {
    switch (match.status) {
      case 'scheduled':
        return (
          <span className="badge bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Programado
          </span>
        );
      case 'live':
        return (
          <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
            En vivo
          </span>
        );
      case 'finished':
        return (
          <span className="badge bg-gray-500/20 text-gray-400 border border-gray-500/30">
            Finalizado
          </span>
        );
      default:
        return null;
    }
  };

  return (
         <Card
       className={`overflow-hidden transition-all duration-300 hover:shadow-xl match-card-hover ${
         viewMode === 'grid' ? 'h-full' : ''
       }`}
     >
      {/* Match header */}
      <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{new Date(match.date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span className="mx-2">•</span>
            <span className="text-sm">Jornada {match.round}</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
          </div>
        </div>
        
        {/* Teams and score */}
        <div className="flex items-center justify-between">
          {/* Home team */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-3">
              <img
                src={homeClub?.logo}
                alt={homeClub?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain transition-transform duration-200 hover:scale-110"
              />
              {isLive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="font-semibold text-center text-white">{homeClub?.name}</span>
            {isFinished && (
              <span className="text-2xl font-bold text-primary mt-1">{match.homeScore}</span>
            )}
          </div>

          {/* Score/VS */}
          <div className="flex flex-col items-center mx-4">
            {isFinished ? (
              <div className="text-4xl sm:text-5xl font-bold mb-2 neon-text-blue">
                {match.homeScore} - {match.awayScore}
              </div>
            ) : (
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-gray-400">VS</div>
            )}
            
            <button
              onClick={() => onToggleDetails(match.id)}
              className="text-primary text-sm flex items-center hover:text-primary-light transition-colors duration-200"
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
          
          {/* Away team */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-3">
              <img
                src={awayClub?.logo}
                alt={awayClub?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain transition-transform duration-200 hover:scale-110"
              />
              {isLive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="font-semibold text-center text-white">{awayClub?.name}</span>
            {isFinished && (
              <span className="text-2xl font-bold text-primary mt-1">{match.awayScore}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded details */}
      {isExpanded && (
        <div className="p-6 pt-4 animate-in slide-in-from-top-2 duration-300">
          <div className="border-t border-gray-800 my-4" />
          
          {isFinished && match.scorers && match.scorers.length > 0 ? (
            <div>
              <h3 className="font-bold mb-4 text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Goleadores
              </h3>
              <div className="space-y-3">
                {match.scorers.map((scorer: any, index: number) => {
                  const club = scorer.clubId ? { name: scorer.clubName } : null;
                  
                  return (
                    <div key={index} className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-12 text-center text-gray-400 font-mono">
                        {scorer.minute}'
                      </div>
                      <div className="flex items-center flex-1">
                        {club && (
                          <img 
                            src={club.logo} 
                            alt={club.name}
                            className="w-6 h-6 mr-3"
                          />
                        )}
                        <span className="text-white">{scorer.playerName}</span>
                      </div>
                      {club && (
                        <div className="text-primary font-semibold">
                          {club.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                {isFinished ? (
                  <Trophy className="w-8 h-8 text-gray-400" />
                ) : (
                  <Clock className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-400">
                {isFinished 
                  ? 'No hay información detallada disponible para este partido.' 
                  : 'El partido aún no se ha disputado.'}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default MatchCard; 