import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Layout as LayoutIcon,
  DollarSign,
  TrendingUp,
  Home,
  Plane,
  Check,
  Trophy,
  Calendar,
  Inbox,
  Sun,
  Moon,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ReactGA from "react-ga4";

import Card from "../components/common/Card";
import DtMenuTabs from "../components/DtMenuTabs";
import CountdownBar from "../components/common/CountdownBar";
import SeasonObjectives from "./dt-dashboard/SeasonObjectives";
import LatestNews from "./dt-dashboard/LatestNews";
import QuickActions from "./dt-dashboard/QuickActions";
import PageHeader from "../components/common/PageHeader";
import DashboardSkeleton from "../components/common/DashboardSkeleton";

import { useAuthStore } from "../store/authStore";
import { useDataStore } from "../store/dataStore";
import {
  getMiniTable,
  formatCurrency,
  formatDate,
  calcStreak,
  getTopPerformer,
  goalsDiff,
  yellowDiff,
  possessionDiff,
} from "../utils/helpers";

// Initialise Google Analytics (replace with your GA ID)
ReactGA.initialize("G-XXXXXXX");

const DtDashboard = () => {
  /* ───────── data & stores ───────── */
  const { user } = useAuthStore();
  const { club, positions, fixtures, market, tasks, events, toggleTask } =
    useDataStore();

  const [theme, setTheme] = useState<"dark" | "light">(
    localStorage.getItem("vz_theme") === "light" ? "light" : "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("vz_theme", theme);
  }, [theme]);

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/dt-dashboard" });
  }, []);

  if (!user || !club) return <DashboardSkeleton />;

  const marketOpen = market.open;
  const nextMatch = fixtures.find((f) => !f.played);
  const miniTable = getMiniTable(club.id, positions);
  const streak = calcStreak(club.id, fixtures);
  const performer = getTopPerformer(club.id);
  const bullets = [goalsDiff(club.id), possessionDiff(club.id), yellowDiff(club.id)];

  /* ───────── helpers ───────── */
  const handleTaskToggle = (id: string) => {
    toggleTask(id);
    toast.success("¡Tarea actualizada!");
  };

  /* ───────── UI ───────── */
  return (
    <div className="relative">
      {/* Decorative beam */}
      <div className="pointer-events-none absolute -top-14 left-1/2 h-[340px] w-[120%] -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-700/40 to-transparent blur-3xl" />

      {/* Header */}
      <PageHeader
        title="Tablero del DT"
        subtitle="Vista general del club y próximas actividades."
        image="https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&auto=format&fit=crop&fm=webp"
      >
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Cambiar tema"
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-white/20"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        <DtMenuTabs />

        {/* KPI Grid */}
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Plantilla" icon={<Users size={20} />} value={`${club.players.length} jugadores`} />
            <KPICard title="Táctica" icon={<LayoutIcon size={20} />} value={club.formation} />
            <KPICard title="Finanzas" icon={<DollarSign size={20} />} value={formatCurrency(club.budget)} />
            <KPICard title="Mercado" icon={<TrendingUp size={20} />} value={marketOpen ? "Abierto" : "Cerrado"} />
          </div>
        </section>

        {/* Main layout */}
        <main className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-8 lg:col-span-2">
            {nextMatch && (
              <Card className="p-4" aria-label="Próximo partido">
                <div className="flex items-center gap-2">
                  {nextMatch.homeTeam === club.name ? (
                    <Home size={16} className="text-accent" aria-hidden="true" />
                  ) : (
                    <Plane size={16} className="text-accent" aria-hidden="true" />
                  )}
                  <h2 className="font-semibold">Próximo partido</h2>
                </div>
                <p className="mt-2">
                  {nextMatch.homeTeam === club.name ? nextMatch.awayTeam : nextMatch.homeTeam} – {" "}
                  <span className="text-gray-400">{formatDate(nextMatch.date)}</span>
                </p>
                <CountdownBar date={nextMatch.date} />
                <Link to="/liga-master/fixture" className="mt-3 inline-flex items-center gap-1 text-accent hover:underline">
                  <Calendar size={14} /> Calendario completo
                </Link>
              </Card>
            )}

            {/* Mini table and comparison */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="p-4" aria-label="Mini tabla">
                <h3 className="mb-3 font-semibold">Posiciones</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {miniTable.map((row) => (
                      <tr key={row.club} className={row.club === club.id ? "text-accent font-semibold" : ""}>
                        <td>{row.pos}</td>
                        <td>{row.name}</td>
                        <td className="text-right">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 flex gap-1" aria-label="Racha de resultados">
                  {streak.map((w, i) => (
                    <Check key={i} size={14} className={w ? "text-green-500" : "text-red-500"} />
                  ))}
                </div>
              </Card>

              <Card className="p-4" aria-label="Comparativa de métricas">
                <h3 className="mb-3 font-semibold">Comparativa con la liga</h3>
                <ul className="space-y-2 text-sm">
                  {bullets.map((b) => (
                    <li key={b.label} className="flex items-center justify-between">
                      <span>{b.label}</span>
                      <span className={b.diff > 0 ? "text-green-400" : b.diff < 0 ? "text-red-400" : "text-gray-400"}>
                        {b.diff > 0 && "+"}
                        {b.diff}
                      </span>
                    </li>
                  ))}
                </ul>
                {performer && (
                  <div className="mt-4 flex items-center gap-2 rounded bg-zinc-800 p-2">
                    <img src={performer.avatar} alt={performer.name} className="h-8 w-8 rounded-full" />
                    <div>
                      <p className="text-sm">{performer.name}</p>
                      <p className="text-xs text-gray-400">
                        {performer.g} g – {performer.a} a
                      </p>
                    </div>
                    <Trophy size={14} className="ml-auto text-yellow-400" aria-hidden="true" />
                  </div>
                )}
              </Card>
            </div>

            <SeasonObjectives />
            <LatestNews />
          </div>

          {/* Right column */}
          <div className="space-y-8">
            {/* Announcements */}
            <Card className="p-4" aria-live="polite" aria-label="Anuncios recientes">
              <h3 className="mb-3 font-semibold">Anuncios</h3>
              {events.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-gray-400">
                  <Inbox size={16} className="text-gray-400" aria-hidden="true" /> No hay anuncios
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {events.slice(0, 3).map((ev) => (
                    <li key={ev.id} className="flex items-center justify-between">
                      <span>{ev.message}</span>
                      <span className="text-xs text-gray-400">{formatDate(ev.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Market status */}
            <Card className="p-4" aria-label="Estado de mercado">
              <h3 className="mb-3 font-semibold">Mercado</h3>
              <div className="flex items-center gap-2">
                <span className={marketOpen ? "h-3 w-3 rounded-full bg-green-500" : "h-3 w-3 rounded-full bg-red-500"} />
                <span>{marketOpen ? "Abierto" : "Cerrado"}</span>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-primary">
                <li>Máx. 3 traspasos salientes</li>
                <li>Límite salarial activo</li>
              </ul>
            </Card>

            {/* Tasks */}
            <Card className="p-4" aria-label="Tareas y recordatorios">
              <h3 className="mb-3 font-semibold">Recordatorios</h3>
              {tasks.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-gray-400">
                  <Inbox size={16} className="text-gray-400" aria-hidden="true" /> No hay recordatorios
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-accent"
                        checked={t.done}
                        onChange={() => handleTaskToggle(t.id)}
                        aria-label={t.text}
                      />
                      <span className={t.done ? "line-through opacity-60" : ""}>{t.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <QuickActions marketOpen={marketOpen} />
          </div>
        </main>

        <div className="mb-8" />
      </div>
    </div>
  );
};

export default DtDashboard;

/* ───────── sub‑components ───────── */
const KPICard = ({ title, icon, value }: { title: string; icon: React.ReactNode; value: string }) => (
  <motion.div
    whileHover={{ scale: 1.04 }}
    className="flex flex-col justify-between rounded-2xl bg-white/5 p-6 shadow-inner backdrop-blur-md"
  >
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400" aria-label={title}>
      {icon}
      {title}
    </div>
    <p className="text-xl font-bold text-white" aria-live="polite">{value}</p>
  </motion.div>
);
