import React from 'react';
import { Trophy, Users, Calendar, Target, TrendingUp, Award } from 'lucide-react';

interface TournamentStatsProps {
  tournament: {
    name: string;
    teams: any[];
    rounds: number;
    matches: any[];
    startDate: string;
    endDate: string;
  };
}

const TournamentStats: React.FC<TournamentStatsProps> = ({ tournament }) => {
  const stats = [
    {
      icon: Users,
      label: 'Equipos',
      value: tournament.teams.length,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Calendar,
      label: 'Jornadas',
      value: tournament.rounds,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Target,
      label: 'Partidos',
      value: tournament.matches.length,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: TrendingUp,
      label: 'Finalizados',
      value: tournament.matches.filter(m => m.status === 'finished').length,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl border border-gray-700/50 ${stat.bgColor} transition-all duration-300 hover:scale-105 hover:shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-gray-800/50 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentStats; 