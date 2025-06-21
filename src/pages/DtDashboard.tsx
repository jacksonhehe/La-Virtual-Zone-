/* =========================================
   LIGA MASTER · TABLERO DEL DT
   Último pulido: alineación vertical,
   sombras coherentes, contraste bullets,
   apilado XS y margen antes del footer
   ======================================= */

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Users,
  Layout,
  DollarSign,
  TrendingUp,
  Home,
  Plane,
  Newspaper,
  Check,
  Trophy,
  Calendar
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import {
  getMiniTable,
  formatCurrency,
  formatDate,
  calcStreak,
  getTopPerformer,
  goalsDiff,
  yellowDiff,
  possessionDiff
} from '../utils/helpers';

/* ---------- componentes pequeños reutilizados ---------- */

/* sombra y escala homogéneas para TODAS las tarjetas */
const Card = ({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className="hover-card cursor-pointer rounded-lg bg-zinc-900 p-4 shadow transition-transform hover:shadow-neon/40"
  >
    {children}
  </div>
);

/* Progress bar con transición suave */
const ProgressBar = ({
  value
}: {
  value: number | null;
}) => {
  if (value === null) {
    return (
      <div className="w-full rounded bg-zinc-800 py-1 text-center text-xs text-gray-400">
        Sin datos
      </div>
    );
  }
  return (
    <div className="h-3 w-full rounded bg-zinc-800">
      <div
        className="h-full rounded bg-accent transition-[width] duration-[400ms] ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

/* Cuenta regresiva utilitaria */
const useCountdown = (date: string) => {
  const [out, setOut] = useState('');
  useEffect(() => {
    const fn = () => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) {
        setOut('');
        return;
      }
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      setOut(`Faltan ${d} d ${h} h`);
    };
    fn();
    const id = setInterval(fn, 6e4);
    return () => clearInterval(id);
  }, [date]);
  return out;
};

/* ---------- componente principal ---------- */

const DtDashboard = () => {
  const { user } = useAuthStore();
  const {
    club,
    positions,
    fixtures,
    news,
    market,
    objectives,
    tasks,
    events
  } = useDataStore();

  const nextMatch = fixtures.find(f => !f.played);
  const countdown = useCountdown(nextMatch?.date || '');

  if (!user || !club) return <p>Cargando…</p>;

  /* ··· datos derivados ··· */
  const miniTable = getMiniTable(club.id, positions);
  const streak = calcStreak(club.id, fixtures);
  const performer = getTopPerformer(club.id);
  const bullets = [
    goalsDiff(club.id),
    possessionDiff(club.id),
    yellowDiff(club.id)
  ];
  const latestNews = news.slice(0, 3);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ---------- ENCABEZADO ---------- */}
      <header className="mb-6 flex flex-col items-center gap-4 md:flex-row">
        <Link
          to={`/liga-master/club/${club.slug}`}
          className="flex items-center gap-3 hover:underline"
        >
          <img
            src={club.logo}
            alt="Escudo"
            className="h-14 w-14 rounded-full"
          />
          <div>
              <h1 className="text-2xl font-semibold neon-text-blue drop-shadow-md">{club.name}</h1>
            <p className="text-sm text-gray-400">{user.username}</p>
          </div>
        </Link>
        <div className="mt-4 flex flex-col items-center md:ml-auto md:mt-0 md:items-end">
          <span className="text-xs text-gray-400">Presupuesto</span>
          <span className="text-lg font-semibold text-accent">
            {formatCurrency(club.budget)}
          </span>
        </div>
      </header>

      {/* ---------- TARJETAS RÁPIDAS ---------- */}
      <section className="mb-8 grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            <span className="font-semibold">Plantilla</span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-400">
            {club.players.length} jugadores
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Layout size={20} className="text-blue-400" />
            <span className="font-semibold">Táctica</span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-400">
            {club.formation}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-green-400" />
            <span className="font-semibold">Finanzas</span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-400">
            {formatCurrency(club.budget)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-yellow-400" />
            <span className="font-semibold">Mercado</span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-400">
            {market.open ? 'Abierto' : 'Cerrado'}
          </p>
        </Card>
      </section>

      {/* ---------- CUERPO PRINCIPAL ---------- */}
      <main className="grid gap-8 lg:grid-cols-3">
        {/* === COLUMNA IZQUIERDA (2/3) === */}
        <div className="space-y-8 lg:col-span-2">
          {/* Próximo partido */}
          {nextMatch && (
            <Card>
              <div className="flex items-center gap-2">
                {nextMatch.homeTeam === club.name ? (
                  <Home size={16} className="text-accent" />
                ) : (
                  <Plane size={16} className="text-accent" />
                )}
                <h2 className="font-semibold">Próximo partido</h2>
              </div>
              <p className="mt-2">
                {nextMatch.homeTeam === club.name ? nextMatch.awayTeam : nextMatch.homeTeam} –{' '}
                <span className="text-gray-400">{formatDate(nextMatch.date)}</span>
              </p>
              {countdown && (
                <p className="mt-1 text-xs text-gray-400">{countdown}</p>
              )}
              <Link
                to="/liga-master/fixture"
                className="mt-3 inline-flex items-center gap-1 text-accent hover:underline"
              >
                <Calendar size={14} />
                Calendario completo
              </Link>
            </Card>
          )}

          {/* Mini-tabla + Streak + Performer */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Mini tabla de posiciones */}
            <Card>
              <h3 className="mb-3 font-semibold">Posiciones</h3>
              <table className="w-full text-sm">
                <tbody>
                  {miniTable.map(row => (
                    <tr
                      key={row.club}
                      className={
                        row.club === club.id ? 'text-accent font-semibold' : ''
                      }
                    >
                      <td>{row.pos}</td>
                      <td>{row.name}</td>
                      <td className="text-right">{row.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Racha */}
              <div className="mt-3 flex gap-1">
                {streak.map((w, i) => (
                  <Check
                    key={i}
                    size={14}
                    className={w ? 'text-green-500' : 'text-red-500'}
                  />
                ))}
              </div>
            </Card>

            {/* Comparativa + Jugador en forma */}
            <Card>
              <h3 className="mb-3 font-semibold">Comparativa con la liga</h3>
              <ul className="space-y-2 text-sm">
                {bullets.map(b => (
                  <li key={b.label} className="flex items-center justify-between">
                    <span>{b.label}</span>
                    <span
                      className={
                        b.diff > 0
                          ? 'text-green-400'
                          : b.diff < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }
                    >
                      {b.diff > 0 && '+'}
                      {b.diff}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Jugador destacado */}
              {performer && (
                <div className="mt-4 flex items-center gap-2 rounded bg-zinc-800 p-2">
                  <img
                    src={performer.avatar}
                    alt={performer.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm">{performer.name}</p>
                    <p className="text-xs text-gray-400">
                      {performer.g} g – {performer.a} a
                    </p>
                  </div>
                  <Trophy size={14} className="ml-auto text-yellow-400" />
                </div>
              )}
            </Card>
          </div>

          {/* Objetivos de temporada */}
          <Card>
            <h3 className="mb-4 font-semibold">Objetivos de temporada</h3>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-gray-400">Clasificar top 5</p>
                <ProgressBar value={objectives.position} />
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-400">Juego limpio</p>
                <ProgressBar value={objectives.fairplay} />
              </div>
            </div>
          </Card>

          {/* Últimas noticias */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Últimas noticias</h3>
              <Link
                to="/liga-master/feed"
                className="text-accent text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Ver todo
              </Link>
            </div>
            <ul className="space-y-3">
              {latestNews.map(item => (
                <li key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Newspaper size={16} className="mr-2 text-accent" />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.publishDate)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* === COLUMNA DERECHA (1/3) === */}
        <div className="space-y-8">
          {/* Anuncios */}
          <Card>
            <h3 className="mb-3 font-semibold">Anuncios</h3>
            <ul className="space-y-2 text-sm">
              {events.slice(0, 3).map(ev => (
                <li key={ev.id} className="flex items-center justify-between">
                  <span>{ev.message}</span>
                  <span className="text-xs text-gray-400">{formatDate(ev.date)}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Semáforo de mercado */}
          <Card>
            <h3 className="mb-3 font-semibold">Mercado</h3>
            <div className="flex items-center gap-2">
              <span
                className={
                  market.open ? 'h-3 w-3 rounded-full bg-green-500' : 'h-3 w-3 rounded-full bg-red-500'
                }
              />
              <span>{market.open ? 'Abierto' : 'Cerrado'}</span>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-gray-300">
              <li>Máx. 3 traspasos salientes</li>
              <li>Límite salarial activo</li>
            </ul>
          </Card>

          {/* Recordatorios pendientes */}
          <Card>
            <h3 className="mb-3 font-semibold">Recordatorios</h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400">Todo al día ✔️</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {tasks.map(t => (
                  <li key={t.id} className="flex items-center gap-2">
                    <Check size={16} className="text-accent" />
                    <span>{t.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Botones de acción rápida */}
          <div className="grid gap-3 xs:grid-cols-2 sm:grid-cols-2">
            <button className="hover-card bg-accent px-4 py-2 font-semibold text-black">
              Enviar oferta
            </button>
            <button className="hover-card bg-accent px-4 py-2 font-semibold text-black">
              Informe médico
            </button>
            <button className="hover-card bg-accent px-4 py-2 font-semibold text-black">
              Firmar juvenil
            </button>
            <button className="hover-card bg-accent px-4 py-2 font-semibold text-black">
              Publicar declaración
            </button>
          </div>
        </div>
      </main>

      {/* margen extra antes del footer general */}
      <div className="mb-8" />
      </div>
    </>
  );
};

export default DtDashboard;
