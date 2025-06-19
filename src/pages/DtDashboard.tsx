import { Link, Navigate } from 'react-router-dom';
import {
  Users,
  Layout,
  DollarSign,
  TrendingUp,
  Home,
  Plane,
  Newspaper
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { formatCurrency, formatDate, slugify } from '../utils/helpers';

const DtDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { clubs, players, standings, tournaments, newsItems, marketStatus } = useDataStore();

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
  const morale = standing
    ? Math.round(
        (standing.form.reduce((sum, r) => sum + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0) /
          (standing.form.length * 3 || 1)) * 100
      )
    : 50;

  const ligaMaster = tournaments.find(t => t.id === 'tournament1');
  const nextMatch = ligaMaster
    ? ligaMaster.matches
        .filter(
          m => (m.homeTeam === club.name || m.awayTeam === club.name) && m.status === 'scheduled'
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : null;

  const latestNews = newsItems
    .filter(n => n.clubId === club.id)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 3);

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <img src={club.logo} alt={club.name} className="w-14 h-14 mr-3" />
          <h1 className="text-2xl font-bold">{club.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-gray-400">DT: {club.manager}</p>
          <p className="text-gray-400">Presupuesto: {formatCurrency(club.budget)}</p>
        </div>
      </div>

      <div className="h-2 bg-dark rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${morale}%` }}></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to={`/liga-master/club/${slug}/plantilla`}
          className="card card-hover p-6 text-center hover:scale-105 hover:shadow-xl transition-transform"
        >
          <Users size={32} className="text-primary mb-3" />
          <p className="text-gray-400 mb-2">Plantilla</p>
          <p className="text-xl font-bold mb-2">{clubPlayers.length} jugadores</p>
          {captain && (
            <img src={captain.image} alt={captain.name} className="w-12 h-12 rounded-full mx-auto" />
          )}
        </Link>
        <Link
          to={`/liga-master/club/${slug}/tacticas`}
          className="card card-hover p-6 text-center hover:scale-105 hover:shadow-xl transition-transform"
        >
          <Layout size={32} className="text-neon-blue mb-3" />
          <p className="text-gray-400 mb-1">Táctica</p>
          <p className="text-xl font-bold">{formation}</p>
        </Link>
        <Link
          to={`/liga-master/club/${slug}/finanzas`}
          className="card card-hover p-6 text-center hover:scale-105 hover:shadow-xl transition-transform"
        >
          <DollarSign size={32} className="text-neon-green mb-3" />
          <p className="text-gray-400 mb-1">Finanzas</p>
          <p className="text-xl font-bold">{formatCurrency(club.budget)}</p>
        </Link>
        <Link
          to="/liga-master/mercado"
          className="card card-hover p-6 text-center hover:scale-105 hover:shadow-xl transition-transform"
        >
          <TrendingUp size={32} className="text-neon-yellow mb-3" />
          <p className="text-gray-400 mb-1">Mercado</p>
          <p className="text-xl font-bold">{marketStatus ? 'Abierto' : 'Cerrado'}</p>
        </Link>
      </div>

      {nextMatch && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Próximo Partido</h2>
            <Link to="/liga-master/fixture" className="text-primary text-sm hover:text-primary-light">
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
              <div className="flex items-center justify-center mt-1">
                {nextMatch.homeTeam === club.name ? (
                  <Home size={16} className="text-primary mr-1" />
                ) : (
                  <Plane size={16} className="text-primary mr-1" />
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

      {standing && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-gray-400 text-sm">Posición</p>
            <p className="text-xl font-bold">{standings.indexOf(standing) + 1}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-gray-400 text-sm">GF</p>
            <p className="text-xl font-bold">{standing.goalsFor}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-gray-400 text-sm">GC</p>
            <p className="text-xl font-bold">{standing.goalsAgainst}</p>
          </div>
        </div>
      )}

      {latestNews.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Últimas Noticias</h2>
            <Link to="/liga-master/feed" className="text-primary text-sm hover:text-primary-light">
              Ver todo
            </Link>
          </div>
          <ul className="space-y-3">
            {latestNews.map(item => (
              <li key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Newspaper size={16} className="text-primary mr-2" />
                  <span>{item.title}</span>
                </div>
                <span className="text-xs text-gray-400">{formatDate(item.publishDate)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    <footer className="text-gray-400 text-sm flex justify-center gap-4 mt-8">
      <Link to="/reglamento">Reglamento</Link>
      <Link to="/liga-master/hall-of-fame">Salón de la Fama</Link>
      <Link to="/pretemporada">Pretemporada</Link>
      <Link to="/ayuda">Ayuda</Link>
    </footer>
  </>
  );
};

export default DtDashboard;
