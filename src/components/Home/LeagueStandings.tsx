import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { createFallbackStandings } from '../../utils/standingsHelpers';

const LeagueStandings = () => {
  const { standings, clubs } = useDataStore();

  const clubStandings = useMemo(() => {
    const source = standings.length ? standings : createFallbackStandings(clubs);
    return [...source].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.goalsFor - a.goalsAgainst;
      const diffB = b.goalsFor - b.goalsAgainst;
      if (diffB !== diffA) return diffB - diffA;
      return (b.goalsFor || 0) - (a.goalsFor || 0);
    });
  }, [clubs, standings]);

  const topTeams = clubStandings.slice(0, 5);

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Clasificación Liga Master</h2>
          <Link
            to="/liga-master/rankings"
            className="text-primary hover:text-primary-light flex items-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 rounded"
          >
            <span>Ver tabla completa</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:hidden p-4">
        {topTeams.map((team, index) => {
          const club = clubs.find(c => c.id === team.clubId);

          return (
            <article key={team.clubId} className="rounded-xl border border-gray-700 bg-gray-900/70 p-4 shadow-sm" aria-label={`Tarjeta ${club?.name}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`
                      inline-flex w-7 h-7 rounded-full font-medium text-sm items-center justify-center
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                        index === 1 ? 'bg-gray-400/20 text-gray-200' :
                        index === 2 ? 'bg-amber-600/20 text-amber-400' : 'text-gray-300 border border-gray-600'}
                    `}
                  >
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={club?.logo}
                      alt={`Escudo de ${club?.name}`}
                      className="w-8 h-8 rounded object-contain"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-white font-semibold leading-tight">{club?.name}</p>
                      <p className="text-xs text-slate-300">PTS: {team.points}</p>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-200 font-semibold">{team.played} PJ</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-slate-300">
                <div className="flex flex-col">
                  <span className="text-white font-semibold">G</span>
                  <span>{team.won}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold">E</span>
                  <span>{team.drawn}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold">P</span>
                  <span>{team.lost}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold">DG</span>
                  <span>{team.goalsFor - team.goalsAgainst}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="table-scroll overflow-x-auto hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-800">
              <th className="font-medium p-4 text-left">Pos</th>
              <th className="font-medium p-4 text-left">Club</th>
              <th className="font-medium p-4 text-center">PJ</th>
              <th className="font-medium p-4 text-center">G</th>
              <th className="font-medium p-4 text-center">E</th>
              <th className="font-medium p-4 text-center">P</th>
              <th className="font-medium p-4 text-center">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {topTeams.map((team, index) => {
              const club = clubs.find(c => c.id === team.clubId);

              return (
                <tr key={team.clubId} className="hover:bg-gray-800/50">
                  <td className="p-4 text-center">
                    <span className={`
                      inline-block w-6 h-6 rounded-full font-medium text-sm flex items-center justify-center
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        index === 2 ? 'bg-amber-600/20 text-amber-500' : 'text-gray-400'}
                    `}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/liga-master/club/${club?.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center"
                    >
                      <img
                        src={club?.logo}
                        alt={`Escudo de ${club?.name}`}
                        className="w-6 h-6 mr-2"
                        loading="lazy"
                      />
                      <span className="font-medium">{club?.name}</span>
                    </Link>
                  </td>
                  <td className="p-4 text-center text-gray-400">{team.played}</td>
                  <td className="p-4 text-center text-gray-400">{team.won}</td>
                  <td className="p-4 text-center text-gray-400">{team.drawn}</td>
                  <td className="p-4 text-center text-gray-400">{team.lost}</td>
                  <td className="p-4 text-center font-bold">{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueStandings;
