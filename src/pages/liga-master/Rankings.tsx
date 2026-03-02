import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useDataStore } from '../../store/dataStore';
import { getTranslatedPosition } from '../../utils/helpers';
import { createFallbackStandings } from '../../utils/standingsHelpers';

const Rankings = () => {
  const [activeTab, setActiveTab] = useState('clubs');
  const [season, setSeason] = useState('2025');

  const { clubs, players, standings } = useDataStore();

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

  const topScorers = useMemo(() => [...players]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10), [players]);

  const topAssisters = useMemo(() => [...players]
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 10), [players]);

  const topManagers = useMemo(() => clubStandings
    .slice(0, 10)
    .map(standing => {
      const club = clubs.find(c => c.id === standing.clubId);
      return {
        name: club?.manager || 'DT sin tag',
        club: club?.name || 'Club sin nombre',
        clubLogo: club?.logo || '',
        points: standing.points,
        winRate: standing.played > 0 ? Math.round((standing.won / standing.played) * 100) : 0
      };
    }), [clubStandings, clubs]);

  const isLoadingClubs = clubStandings.length === 0;
  const isLoadingPlayers = players.length === 0;

  const skeletonArray = Array.from({ length: 6 }).map((_, index) => index);

  return (
    <div>
      <PageHeader
        title="Rankings"
        subtitle="Clasificaciones y stats rapidas de clubes, goleadores y DTs. Datos al momento para la comunidad LVZ."
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?auto=format&fit=crop&w=1600&q=70&fm=webp"
      />

      <div className="container mx-auto px-4 lg:px-6 py-8 tight-safe">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin">
            <button
              onClick={() => setActiveTab('clubs')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 ${
                activeTab === 'clubs' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Clubes
            </button>
            <button
              onClick={() => setActiveTab('scorers')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 ${
                activeTab === 'scorers' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Goleadores
            </button>
            <button
              onClick={() => setActiveTab('assisters')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 ${
                activeTab === 'assisters' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Asistentes
            </button>
            <button
              onClick={() => setActiveTab('managers')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 ${
                activeTab === 'managers' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              DTs
            </button>
          </div>

          <div className="inline-flex">
            <label className="sr-only" htmlFor="season">Temporada</label>
            <select
              id="season"
              className="input py-2"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="2025">Temporada 2025</option>
              <option value="2024">Temporada 2024</option>
              <option value="2023">Temporada 2023</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <Link
            to="/liga-master"
            className="inline-flex items-center text-primary hover:text-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 rounded"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver a Liga Master</span>
          </Link>
        </div>
        {activeTab === 'clubs' && (
          <div className="card">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Ranking de Clubes</h2>
              <p className="text-gray-300 text-sm">Temporada {season} - puestos y diferencial al instante.</p>
            </div>

            <div className="grid gap-3 md:hidden p-4">
              {(isLoadingClubs ? skeletonArray : clubStandings).map((team, index) => {
                const club = !isLoadingClubs ? clubs.find(c => c.id === team.clubId) : undefined;
                return (
                  <article key={isLoadingClubs ? index : team.clubId} className="rounded-xl border border-gray-700 bg-gray-900/70 p-4 shadow-sm" aria-label="Tarjeta club mobile">
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
                          <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
                            {!isLoadingClubs ? (
                              <img
                                src={club?.logo}
                                alt={`Escudo de ${club?.name}`}
                                className="w-10 h-10 object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <span className="w-full h-full bg-gray-700 animate-pulse rounded" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold leading-tight">
                              {!isLoadingClubs ? club?.name : <span className="inline-block h-3 w-24 bg-gray-700 animate-pulse rounded" />}
                            </p>
                            <p className="text-xs text-slate-300">
                              {!isLoadingClubs ? `PTS: ${team.points}` : <span className="inline-block h-2 w-16 bg-gray-700 animate-pulse rounded" />}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-200 font-semibold">
                        {!isLoadingClubs ? `${team.played} PJ` : <span className="inline-block h-3 w-8 bg-gray-700 animate-pulse rounded" />}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-slate-300">
                      {['G', 'E', 'P', 'DG'].map((label, colIndex) => (
                        <div className="flex flex-col" key={`${label}-${colIndex}`}>
                          <span className="text-white font-semibold">{label}</span>
                          {isLoadingClubs ? (
                            <span className="h-3 w-6 bg-gray-700 animate-pulse rounded" />
                          ) : (
                            <span>
                              {label === 'G' && team.won}
                              {label === 'E' && team.drawn}
                              {label === 'P' && team.lost}
                              {label === 'DG' && team.goalsFor - team.goalsAgainst}
                            </span>
                          )}
                        </div>
                      ))}
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
                    <th className="font-medium p-4 text-center">GF</th>
                    <th className="font-medium p-4 text-center">GC</th>
                    <th className="font-medium p-4 text-center">DG</th>
                    <th className="font-medium p-4 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {(isLoadingClubs ? skeletonArray : clubStandings).map((team, index) => {
                    const club = !isLoadingClubs ? clubs.find(c => c.id === team.clubId) : undefined;
                    const clubSlug = club?.name ? club.name.toLowerCase().replace(/\s+/g, '-') : '';

                    return (
                      <tr key={isLoadingClubs ? index : team.clubId} className="hover:bg-gray-800/50">
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
                          {!isLoadingClubs ? (
                            <Link
                              to={clubSlug ? `/liga-master/club/${clubSlug}` : '/liga-master'}
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
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-gray-700 rounded animate-pulse" />
                              <span className="w-24 h-3 bg-gray-700 rounded animate-pulse" />
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center text-gray-400">{isLoadingClubs ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : team.played}</td>
                        <td className="p-4 text-center text-gray-400">{isLoadingClubs ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : team.won}</td>
                        <td className="p-4 text-center text-gray-400">{isLoadingClubs ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : team.drawn}</td>
                        <td className="p-4 text-center text-gray-400">{isLoadingClubs ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : team.lost}</td>
                        <td className="p-4 text-center text-gray-400">{isLoadingClubs ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : team.goalsFor}</td>
                        <td className="p-4 text-center text-gray-400">{isLoadingClubs ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : team.goalsAgainst}</td>
                        <td className="p-4 text-center text-gray-400">{isLoadingClubs ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : team.goalsFor - team.goalsAgainst}</td>
                        <td className="p-4 text-center font-bold">{isLoadingClubs ? <span className="w-8 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : team.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'scorers' && (
          <div className="card">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Maximos Goleadores</h2>
              <p className="text-gray-300 text-sm">Temporada {season} - killers del area listos para romper redes.</p>
            </div>

            <div className="grid gap-3 md:hidden p-4">
              {(isLoadingPlayers ? skeletonArray : topScorers).map((player, index) => {
                const club = !isLoadingPlayers ? clubs.find(c => c.id === player.clubId) : undefined;
                return (
                  <article key={isLoadingPlayers ? index : player.id} className="rounded-xl border border-gray-700 bg-gray-900/70 p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
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
                      <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                        {!isLoadingPlayers ? (
                          <img
                            src={player.image || '/default.png'}
                            alt={`Foto de ${player.name}`}
                            className="w-10 h-10 object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default.png';
                            }}
                          />
                        ) : (
                          <span className="w-full h-full bg-gray-700 animate-pulse block" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold leading-tight">
                          {!isLoadingPlayers ? player.name : <span className="inline-block h-3 w-24 bg-gray-700 animate-pulse rounded" />}
                        </p>
                        <p className="text-xs text-slate-300">
                          {!isLoadingPlayers ? club?.name : <span className="inline-block h-2 w-16 bg-gray-700 animate-pulse rounded" />}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold text-white">
                        {!isLoadingPlayers ? getTranslatedPosition(player.position) : <span className="inline-block h-3 w-10 bg-gray-700 animate-pulse rounded" />}
                      </span>
                      <span className="font-semibold text-green-300">
                        {!isLoadingPlayers ? `${player.goals} goles` : <span className="inline-block h-3 w-8 bg-gray-700 animate-pulse rounded" />}
                      </span>
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
                    <th className="font-medium p-4 text-left">Jugador</th>
                    <th className="font-medium p-4 text-left">Club</th>
                    <th className="font-medium p-4 text-center">Pos</th>
                    <th className="font-medium p-4 text-center">PJ</th>
                    <th className="font-medium p-4 text-center">Goles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {(isLoadingPlayers ? skeletonArray : topScorers).map((player, index) => {
                    const club = !isLoadingPlayers ? clubs.find(c => c.id === player.clubId) : undefined;

                    return (
                      <tr key={isLoadingPlayers ? index : player.id} className="hover:bg-gray-800/50">
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
                          <div className="flex items-center">
                            {!isLoadingPlayers ? (
                              <img
                                src={player.image || '/default.png'}
                                alt={`Foto de ${player.name}`}
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/default.png';
                                }}
                              />
                            ) : (
                              <span className="w-8 h-8 rounded-full mr-2 bg-gray-700 animate-pulse inline-block" />
                            )}
                            <span className="font-medium">
                              {!isLoadingPlayers ? player.name : <span className="w-20 h-3 bg-gray-700 rounded animate-pulse inline-block" />}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {!isLoadingPlayers ? (
                              <img
                                src={club?.logo}
                                alt={`Escudo de ${club?.name}`}
                                className="w-6 h-6 mr-2"
                                loading="lazy"
                              />
                            ) : (
                              <span className="w-6 h-6 mr-2 bg-gray-700 rounded animate-pulse inline-block" />
                            )}
                            <span>{!isLoadingPlayers ? club?.name : <span className="w-20 h-3 bg-gray-700 rounded animate-pulse inline-block" />}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {!isLoadingPlayers ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                              player.position === 'PT' ? 'bg-yellow-500/20 text-yellow-400' :
                              player.position === 'DEC' ? 'bg-blue-500/20 text-blue-400' :
                              player.position === 'CD' ? 'bg-red-500/20 text-red-400' :
                              player.position === 'SD' ? 'bg-red-500/20 text-red-400' :
                              ['LI', 'LD'].includes(player.position) ? 'bg-blue-500/20 text-blue-400' :
                              ['MCD', 'MC', 'MO'].includes(player.position) ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {getTranslatedPosition(player.position)}
                            </span>
                          ) : (
                            <span className="w-10 h-3 bg-gray-700 rounded animate-pulse inline-block" />
                          )}
                        </td>
                        <td className="p-4 text-center text-gray-400">{isLoadingPlayers ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : player.appearances}</td>
                        <td className="p-4 text-center font-bold">{isLoadingPlayers ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : player.goals}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'assisters' && (
          <div className="card">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Maximos Asistentes</h2>
              <p className="text-gray-300 text-sm">Temporada {season} - los que reparten magia y dejan al 9 mano a mano.</p>
            </div>

            <div className="grid gap-3 md:hidden p-4">
              {(isLoadingPlayers ? skeletonArray : topAssisters).map((player, index) => {
                const club = !isLoadingPlayers ? clubs.find(c => c.id === player.clubId) : undefined;
                return (
                  <article key={isLoadingPlayers ? index : player.id} className="rounded-xl border border-gray-700 bg-gray-900/70 p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
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
                      <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                        {!isLoadingPlayers ? (
                          <img
                            src={player.image || '/default.png'}
                            alt={`Foto de ${player.name}`}
                            className="w-10 h-10 object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default.png';
                            }}
                          />
                        ) : (
                          <span className="w-full h-full bg-gray-700 animate-pulse block" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold leading-tight">
                          {!isLoadingPlayers ? player.name : <span className="inline-block h-3 w-24 bg-gray-700 animate-pulse rounded" />}
                        </p>
                        <p className="text-xs text-slate-300">
                          {!isLoadingPlayers ? club?.name : <span className="inline-block h-2 w-16 bg-gray-700 animate-pulse rounded" />}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold text-white">
                        {!isLoadingPlayers ? getTranslatedPosition(player.position) : <span className="inline-block h-3 w-10 bg-gray-700 animate-pulse rounded" />}
                      </span>
                      <span className="font-semibold text-green-300">
                        {!isLoadingPlayers ? `${player.assists} asist.` : <span className="inline-block h-3 w-10 bg-gray-700 animate-pulse rounded" />}
                      </span>
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
                    <th className="font-medium p-4 text-left">Jugador</th>
                    <th className="font-medium p-4 text-left">Club</th>
                    <th className="font-medium p-4 text-center">Pos</th>
                    <th className="font-medium p-4 text-center">PJ</th>
                    <th className="font-medium p-4 text-center">Asistencias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {(isLoadingPlayers ? skeletonArray : topAssisters).map((player, index) => {
                    const club = !isLoadingPlayers ? clubs.find(c => c.id === player.clubId) : undefined;

                    return (
                      <tr key={isLoadingPlayers ? index : player.id} className="hover:bg-gray-800/50">
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
                          <div className="flex items-center">
                            {!isLoadingPlayers ? (
                              <img
                                src={player.image || '/default.png'}
                                alt={`Foto de ${player.name}`}
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/default.png';
                                }}
                              />
                            ) : (
                              <span className="w-8 h-8 rounded-full mr-2 bg-gray-700 animate-pulse inline-block" />
                            )}
                            <span className="font-medium">
                              {!isLoadingPlayers ? player.name : <span className="w-20 h-3 bg-gray-700 rounded animate-pulse inline-block" />}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {!isLoadingPlayers ? (
                              <img
                                src={club?.logo}
                                alt={`Escudo de ${club?.name}`}
                                className="w-6 h-6 mr-2"
                                loading="lazy"
                              />
                            ) : (
                              <span className="w-6 h-6 mr-2 bg-gray-700 rounded animate-pulse inline-block" />
                            )}
                            <span>{!isLoadingPlayers ? club?.name : <span className="w-20 h-3 bg-gray-700 rounded animate-pulse inline-block" />}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {!isLoadingPlayers ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                              player.position === 'PT' ? 'bg-yellow-500/20 text-yellow-400' :
                              player.position === 'DEC' ? 'bg-blue-500/20 text-blue-400' :
                              player.position === 'CD' ? 'bg-red-500/20 text-red-400' :
                              player.position === 'SD' ? 'bg-red-500/20 text-red-400' :
                              ['LI', 'LD'].includes(player.position) ? 'bg-blue-500/20 text-blue-400' :
                              ['MCD', 'MC', 'MO'].includes(player.position) ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {getTranslatedPosition(player.position)}
                            </span>
                          ) : (
                            <span className="w-10 h-3 bg-gray-700 rounded animate-pulse inline-block" />
                          )}
                        </td>
                        <td className="p-4 text-center text-gray-400">{isLoadingPlayers ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : player.appearances}</td>
                        <td className="p-4 text-center font-bold">{isLoadingPlayers ? <span className="w-6 h-3 bg-gray-700 rounded animate-pulse inline-block" /> : player.assists}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'managers' && (
          <div className="card">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Mejores DTs</h2>
              <p className="text-gray-300 text-sm">Temporada {season} - estrategas que meten mano y suman puntos.</p>
            </div>

            <div className="grid gap-3 md:hidden p-4">
              {(isLoadingClubs ? skeletonArray : topManagers).map((manager, index) => (
                <article key={index} className="rounded-xl border border-gray-700 bg-gray-900/70 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
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
                      <div>
                        <p className="text-white font-semibold leading-tight">
                          {!isLoadingClubs ? manager.name : <span className="inline-block h-3 w-24 bg-gray-700 animate-pulse rounded" />}
                        </p>
                        <p className="text-xs text-slate-300">
                          {!isLoadingClubs ? manager.club : <span className="inline-block h-2 w-16 bg-gray-700 animate-pulse rounded" />}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-green-300 font-semibold">
                      {!isLoadingClubs ? `${manager.winRate}%` : <span className="inline-block h-3 w-8 bg-gray-700 animate-pulse rounded" />}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      {!isLoadingClubs ? (
                        <img
                          src={manager.clubLogo}
                          alt={`Escudo de ${manager.club}`}
                          className="w-6 h-6 rounded object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="w-6 h-6 bg-gray-700 rounded animate-pulse inline-block" />
                      )}
                      <span className="font-semibold text-white">
                        {!isLoadingClubs ? `${manager.points} pts` : <span className="inline-block h-3 w-10 bg-gray-700 animate-pulse rounded" />}
                      </span>
                    </div>
                    <span className="text-slate-400">Winrate</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="table-scroll overflow-x-auto hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-800">
                    <th className="font-medium p-4 text-left">Pos</th>
                    <th className="font-medium p-4 text-left">DT</th>
                    <th className="font-medium p-4 text-left">Club</th>
                    <th className="font-medium p-4 text-center">Puntos</th>
                    <th className="font-medium p-4 text-center">% Victorias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {(isLoadingClubs ? skeletonArray : topManagers).map((manager, index) => (
                    <tr key={index} className="hover:bg-gray-800/50">
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
                        {!isLoadingClubs ? (
                          <Link
                            to={`/usuarios/${manager.name}`}
                            className="font-medium hover:text-primary"
                          >
                            {manager.name}
                          </Link>
                        ) : (
                          <span className="w-20 h-3 bg-gray-700 rounded animate-pulse inline-block" />
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {!isLoadingClubs ? (
                            <img
                              src={manager.clubLogo}
                              alt={`Escudo de ${manager.club}`}
                              className="w-6 h-6 mr-2"
                              loading="lazy"
                            />
                          ) : (
                            <span className="w-6 h-6 bg-gray-700 rounded animate-pulse inline-block mr-2" />
                          )}
                          <span>{!isLoadingClubs ? manager.club : <span className="w-20 h-3 bg-gray-700 rounded animate-pulse inline-block" />}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold">{!isLoadingClubs ? manager.points : <span className="w-8 h-3 bg-gray-700 rounded animate-pulse inline-block" />}</td>
                      <td className="p-4 text-center text-gray-300">{!isLoadingClubs ? `${manager.winRate}%` : <span className="w-10 h-3 bg-gray-700 rounded animate-pulse inline-block" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rankings;
