import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Users,
  Layout,
  DollarSign,
  TrendingUp,
  Home,
  Plane,
  Newspaper,
  Check
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { formatCurrency, formatDate, slugify } from '../utils/helpers';

const marketReopenDate = '2025-07-01';

const DtDashboard = () => {
  const [countdown, setCountdown] = useState('');
  const [reminders, setReminders] = useState<string[]>([
    'Confirma tu alineación antes del viernes',
    'Revisa el informe médico de tu delantero lesionado'
  ]);
  const handleComplete = (index: number) => {
    setReminders(prev => prev.filter((_, i) => i !== index));
  };
  const { user, isAuthenticated } = useAuthStore();
  const { clubs, players, standings, tournaments, newsItems, marketStatus, transfers } = useDataStore();

  if (!isAuthenticated || !user || user.role !== 'dt') {
    return <Navigate to="/liga-master" />;
  }

  const club = user.clubId
    ? clubs.find(c => c.id === user.clubId)
    : user.club
      ? clubs.find(c => c.name === user.club)
      : undefined;

  if (!club) {
    return <Navigate to="/liga-master" />;
  }

  const slug = slugify(club.name);
  const clubPlayers = players.filter(p => p.clubId === club.id);
  const captain = clubPlayers[0];
  const formation = (club as unknown as { formation?: string }).formation || '4-3-3';
  const standing = standings.find(s => s.clubId === club.id);
  const morale = standing && standing.form.length > 0
    ? Math.round(
        (standing.form.reduce((sum, r) => sum + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0) /
          (standing.form.length * 3)) * 100
      )
    : undefined;

  const ligaMaster = tournaments.find(t => t.id === 'tournament1');
  const nextMatch = ligaMaster
    ? ligaMaster.matches
        .filter(
          m => (m.homeTeam === club.name || m.awayTeam === club.name) && m.status === 'scheduled'
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!nextMatch) return;
    const updateCountdown = () => {
      const diff = new Date(nextMatch.date).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('');
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      setCountdown(`Faltan ${days} días y ${hours} horas`);
    };
    updateCountdown();
    const id = setInterval(updateCountdown, 60000);
    return () => clearInterval(id);
  }, [nextMatch]);

  const latestNews = newsItems
    .filter(n => n.clubId === club.id)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 3);

  const rankIndex = standings.findIndex(s => s.clubId === club.id);
  const miniStart = Math.max(0, rankIndex - 2);
  const miniRanking = standings.slice(miniStart, miniStart + 5);

  const topTransfers = [...transfers]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const announcements = newsItems
    .filter(n => n.type === 'announcement')
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 2);


  const leagueAvgGoals = standings.reduce((sum, s) => sum + s.goalsFor, 0) / standings.length;
  const leagueAvgPossession = standings.reduce((sum, s) => sum + s.possession, 0) / standings.length;
  const leagueAvgCards = standings.reduce((sum, s) => sum + s.cards, 0) / standings.length;

  const clubStats = standing
    ? { goals: standing.goalsFor, possession: standing.possession, cards: standing.cards }
    : { goals: 0, possession: 0, cards: 0 };

  const statements = newsItems
    .filter(n => n.type === 'statement')
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 2);

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-8">
      <a
        href={`/liga-master/club/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:opacity-90"
      >
        <div className="flex items-center">
          <img src={club.logo} alt={club.name} className="w-14 h-14 mr-3" />
          <h1 className="text-2xl font-bold">{club.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-gray-400">DT: {club.manager}</p>
          <p className="text-gray-400">Presupuesto: {formatCurrency(club.budget)}</p>
        </div>
      </a>

      {morale !== undefined ? (
        <div className="h-2 bg-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${morale}%` }}
          ></div>
        </div>
      ) : (
        <span className="badge bg-gray-700 text-gray-300">Sin datos</span>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to={`/liga-master/club/${slug}/plantilla`}
          className="card card-hover p-6 text-center hover:shadow-[0_0_10px_var(--accent)] transition-shadow focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <Users className="text-accent mb-3 w-8 h-8 max-[359px]:w-5 max-[359px]:h-5" />
          <p className="text-gray-400 text-sm font-medium mb-1">Plantilla</p>
          <p className="text-lg font-medium mb-2">{clubPlayers.length} jugadores</p>
          {captain && (
            <img src={captain.image} alt={captain.name} className="w-12 h-12 rounded-full mx-auto" />
          )}
        </Link>
        <Link
          to={`/liga-master/club/${slug}/tacticas`}
          className="card card-hover p-6 text-center hover:shadow-[0_0_10px_var(--accent)] transition-shadow focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <Layout className="text-accent mb-3 w-8 h-8 max-[359px]:w-5 max-[359px]:h-5" />
          <p className="text-gray-400 text-sm font-medium mb-1">Táctica</p>
          <p className="text-lg font-medium">{formation}</p>
        </Link>
        <Link
          to={`/liga-master/club/${slug}/finanzas`}
          className="card card-hover p-6 text-center hover:shadow-[0_0_10px_var(--accent)] transition-shadow focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <DollarSign className="text-accent mb-3 w-8 h-8 max-[359px]:w-5 max-[359px]:h-5" />
          <p className="text-gray-400 text-sm font-medium mb-1">Finanzas</p>
          <p className="text-lg font-medium">{formatCurrency(club.budget)}</p>
        </Link>
        <Link
          to="/liga-master/mercado"
          className="card card-hover p-6 text-center hover:shadow-[0_0_10px_var(--accent)] transition-shadow focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <TrendingUp className="text-accent mb-3 w-8 h-8 max-[359px]:w-5 max-[359px]:h-5" />
          <p className="text-gray-400 text-sm font-medium mb-1">Mercado</p>
          <p className="text-lg font-medium">{marketStatus ? 'Abierto' : 'Cerrado'}</p>
        </Link>
      </div>

      {nextMatch && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Próximo Partido</h2>
            <Link to="/liga-master/fixture" className="text-accent text-sm hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent">
              Calendario
            </Link>
          </div>
          <div className="flex items-center justify-between text-center">
            <div className="w-1/3 flex flex-col items-center">
              <img
                src={clubs.find(c => c.name === nextMatch.homeTeam)?.logo}
                className="w-10 h-10 mb-2"
              />
              <span>{nextMatch.homeTeam}</span>
            </div>
            <div className="w-1/3">
              <p className="text-sm text-gray-400">{formatDate(nextMatch.date)}</p>
              {countdown && (
                <p className="text-xs text-gray-500">{countdown}</p>
              )}
              <div className="flex items-center justify-center mt-1">
                {nextMatch.homeTeam === club.name ? (
                  <Home size={16} className="text-accent mr-1" />
                ) : (
                  <Plane size={16} className="text-accent mr-1" />
                )}
                <span>{nextMatch.homeTeam === club.name ? 'Local' : 'Visitante'}</span>
              </div>
            </div>
            <div className="w-1/3 flex flex-col items-center">
              <img
                src={clubs.find(c => c.name === nextMatch.awayTeam)?.logo}
                className="w-10 h-10 mb-2"
              />
              <span>{nextMatch.awayTeam}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-[359px]:grid-cols-1">
        <div className="lg:col-span-2 space-y-6">
          {standing && (
            <div className="card p-4 overflow-x-auto">
              <h2 className="font-bold mb-3">Posiciones</h2>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-800 text-gray-400">
                    <th className="p-2">Pos</th>
                    <th className="p-2">Club</th>
                    <th className="p-2 text-center">PJ</th>
                    <th className="p-2 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {miniRanking.map(team => {
                    const clubRow = clubs.find(c => c.id === team.clubId);
                    const pos = standings.indexOf(team) + 1;
                    return (
                      <tr
                        key={team.clubId}
                        className={`border-b border-gray-800 last:border-0 ${team.clubId === club.id ? 'bg-accent/20' : ''}`}
                      >
                        <td className="p-2">{pos}</td>
                        <td className="p-2 flex items-center space-x-2">
                          <img src={clubRow?.logo} className="w-5 h-5" />
                          <span>{clubRow?.name}</span>
                        </td>
                        <td className="p-2 text-center">{team.played}</td>
                        <td className="p-2 text-center font-bold">{team.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {standing && (
            <div className="card p-6 lg:mt-6">
              <h2 className="text-lg font-bold mb-4">Comparativa con la liga</h2>
              <div className="space-y-4">
                {[
                  { label: 'Goles anotados', club: clubStats.goals, league: leagueAvgGoals },
                  { label: 'Posesión %', club: clubStats.possession, league: leagueAvgPossession },
                  { label: 'Tarjetas', club: clubStats.cards, league: leagueAvgCards }
                ].map(stat => {
                  const maxVal = Math.max(stat.club, stat.league);
                  return (
                    <div key={stat.label}>
                      <p className="text-sm mb-1">{stat.label}</p>
                      <div className="relative h-3 bg-gray-700 rounded">
                        <div
                          className="absolute top-0 left-0 h-3 bg-accent rounded"
                          style={{ width: `${(stat.club / maxVal) * 100}%` }}
                        ></div>
                        <div
                          className="absolute top-0 left-0 h-3 bg-gray-500/40 rounded"
                          style={{ width: `${(stat.league / maxVal) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Club: {Math.round(stat.club)}</span>
                        <span>Media liga: {Math.round(stat.league)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {statements.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4">Voces de la jornada</h2>
              <ul className="space-y-2">
                {statements.map(s => (
                  <li key={s.id} className="flex justify-between items-center">
                    <span className="font-medium">{s.title}</span>
                    <Link to={`/blog/${s.id}`} className="text-accent text-sm">Leer</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Fichajes destacados</h2>
            <ul className="space-y-2 text-sm">
              {topTransfers.map(t => (
                <li key={t.id} className="flex justify-between">
                  <span>{t.playerName} {t.fromClub} → {t.toClub}</span>
                  <span>{formatCurrency(t.fee)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4 flex flex-col text-sm">
            <div className={`font-bold ${marketStatus ? 'text-neon-green' : 'text-neon-red'}`}>
              {marketStatus ? 'Mercado abierto' : 'Mercado cerrado'}
            </div>
            {!marketStatus && (
              <span className="text-gray-400">Reabre {formatDate(marketReopenDate)}</span>
            )}
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>Límite de sueldos vigente</li>
              <li>Cupo máximo de traspasos</li>
            </ul>
          </div>

          {announcements.length > 0 && (
            <div className="card card-hover p-6 hover:shadow-[0_0_10px_var(--accent)] transition-shadow">
              <h2 className="text-lg font-bold mb-4">Anuncios</h2>
              <ul className="space-y-2 text-sm">
                {announcements.map(a => (
                  <li key={a.id} className="flex justify-between">
                    <span>{a.title}</span>
                    <span className="text-gray-400">{formatDate(a.publishDate)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card card-hover p-6 hover:shadow-[0_0_10px_var(--accent)] transition-shadow">
            <h2 className="text-lg font-bold mb-4">Recordatorios</h2>
            {reminders.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {reminders.map((r, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{r}</span>
                    <button
                      onClick={() => handleComplete(i)}
                      className="text-accent hover:text-white"
                    >
                      <Check size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">Todo al día ✔️</p>
            )}
          </div>

          <div className="card p-6">
            <div className="flex flex-wrap gap-3">
              <Link to="/liga-master/mercado" className="btn-primary flex-1">Enviar oferta inmediata</Link>
              <Link to={`/liga-master/club/${slug}/plantilla#medical`} className="btn-primary flex-1">Abrir informe médico</Link>
              <Link to="/liga-master/mercado" className="btn-primary flex-1">Firmar juvenil</Link>
              <Link to="/blog" className="btn-primary flex-1">Publicar declaración</Link>
            </div>
          </div>
        </div>
      </div>

      {latestNews.length > 0 && (
        <div className="card p-6 mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Últimas Noticias</h2>
            <Link to="/liga-master/feed" className="text-accent text-sm hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent">
              Ver todo
            </Link>
          </div>
          <ul className="space-y-3">
            {latestNews.map(item => (
              <li key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Newspaper size={16} className="text-accent mr-2" />
                  <span>{item.title}</span>
                </div>
                <span className="text-xs text-gray-400">{formatDate(item.publishDate)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    <footer className="text-gray-400 text-sm mt-8">
      <div className="card p-4 mx-auto max-w-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <Link
              to="/reglamento"
              className="hover:underline hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Reglamento
            </Link>
            <Link
              to="/pretemporada"
              className="hover:underline hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Pretemporada
            </Link>
          </div>
          <div className="space-y-1">
            <Link
              to="/liga-master/hall-of-fame"
              className="hover:underline hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Salón de la Fama
            </Link>
            <Link
              to="/ayuda"
              className="hover:underline hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Ayuda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  </>
  );
};

export default DtDashboard;
