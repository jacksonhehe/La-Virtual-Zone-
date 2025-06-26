/* =========================================================================
   DT DASHBOARD – LIGA MASTER
   Pulido · Gráfica · Logros · Noticias · Personalización
   + Funciones sociales (Ranking DT)
   ========================================================================= */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Layout as LayoutIcon,
  DollarSign,
  TrendingUp,
  Home,
  Plane,
  Trophy,
  Calendar,
  Inbox,
  Sun,
  Moon,
  Award,
  MessagesSquare,
  Wrench,
  Eye,
  EyeOff,
  GripVertical,
  Heart,
  Smile,
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { Toaster } from "react-hot-toast";
import ReactGA from "react-ga4";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import Card from "../components/common/Card";
import DtMenuTabs from "../components/DtMenuTabs";
import CountdownBar from "../components/common/CountdownBar";
import SeasonObjectives from "./dt-dashboard/SeasonObjectives";
import LatestNews from "./dt-dashboard/LatestNews";
import QuickActions from "./dt-dashboard/QuickActions";
import PageHeader from "../components/common/PageHeader";
import DashboardSkeleton from "../components/common/DashboardSkeleton";
import FilterChip from "../components/common/FilterChip";
import RankingRow from "../components/common/RankingRow";
import { DtRanking, Club, DtClub } from "../types";

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

/* ▸ Google Analytics 4 */
const gaId = import.meta.env.VITE_GA_ID;
if (gaId) {
  ReactGA.initialize(gaId);
}

/* ---------- Tipos ---------- */
interface LayoutItem {
  id: RightModuleId;
  visible: boolean;
}

type RightModuleId =
  | "anuncios"
  | "mercado"
  | "logros"
  | "ranking"
  | "noticias"
  | "recordatorios"
  | "acciones";

/* ---------- componente principal ---------- */
const DtDashboard: React.FC = () => {
  /* stores */
  const { user } = useAuthStore();
  const {
    club,
    clubs: allClubs,
    positions,
    fixtures,
    market,
    tasks,
    events,
    toggleTask,
    news, // noticias
    dtRankings, // [{ id, username, elo, clubName, clubLogo }]
    players,
  } = useDataStore();

  /* ===== Tema ===== */
  const [theme, setTheme] = useState<"dark" | "light">(
    localStorage.getItem("vz_theme") === "light" ? "light" : "dark"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("vz_theme", theme);
  }, [theme]);

  /* ===== GA4 ===== */
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/dt-dashboard" });
  }, []);

  /* ===== datos derivados ===== */
  const marketOpen = market.open;
  const nextMatch = fixtures.find((m) => !m.played);

  const miniTable = useMemo(
    () => (club ? getMiniTable(club.id, positions) : []),
    [club, positions]
  );
  const streak = useMemo(
    () => (club ? calcStreak(club.id, fixtures, positions) : []),
    [club, fixtures, positions]
  );
  const performer = useMemo(
    () => (club ? getTopPerformer(club.id, players) : null),
    [club, players]
  );
  const bullets = useMemo(
    () =>
      club
        ? [
            goalsDiff(club.id, positions),
            possessionDiff(club.id, positions),
            yellowDiff(club.id, positions),
          ]
        : [],
    [club, positions]
  );

  const fullClub = useMemo(
    () => allClubs.find((c) => c.id === club.id),
    [allClubs, club.id]
  );

  /* ===== gráfica ===== */
  const recent = fixtures
    .filter((m) => m.played)
    .slice(-5)
    .map((m) => ({
      name: `J${m.round}`,
      GF: m.homeTeam === club.name ? m.homeScore ?? 0 : m.awayScore ?? 0,
      GC: m.homeTeam === club.name ? m.awayScore ?? 0 : m.homeScore ?? 0,
    }));

  /* ===== logros ===== */
  const achievements = useMemo(
    () => [
      {
        id: "invicto5",
        name: "Invicto – 5 partidos",
        unlocked: streak.slice(-5).every((w) => w),
      },
      {
        id: "goleador10",
        name: "Goleador +10",
        unlocked: performer ? performer.g >= 10 : false,
      },
      {
        id: "million",
        name: "Presupuesto > 1 M €",
        unlocked: club ? club.budget > 1_000_000 : false,
      },
    ],
    [streak, performer, club]
  );

  /* ===== noticias ===== */
  const categories = ["Todas", "Fichajes", "Lesiones", "Declaraciones"] as const;
  const [cat, setCat] = useState<(typeof categories)[number]>("Todas");
  const [newsCount, setNewsCount] = useState(5);

  const filteredNews = useMemo(
    () =>
      (news ?? []).filter((n) => {
        const category = n.category ?? n.type;
        return cat === "Todas" || category.toLowerCase() === cat.toLowerCase();
      }),
    [news, cat]
  );
  const visibleNews = filteredNews.slice(0, newsCount);
  const loadMoreNews = () => setNewsCount((c) => c + 5);



  /* =======================================================================
     PERSONALIZACIÓN (drag-and-drop + visibilidad)
     ======================================================================= */

  /* registro de módulos del lado derecho */
  const RIGHT_MODULES = [
    /* --- Anuncios --- */
    {
      id: "anuncios",
      title: "Anuncios",
      render: () => (
        <Card className="p-4" aria-label="Anuncios" aria-live="polite">
          <h3 className="mb-4 text-xl font-semibold leading-tight">Anuncios</h3>
          {events.length === 0 ? (
            <EmptyState label="No hay anuncios" />
          ) : (
            <ul className="space-y-2 text-sm">
              {events.slice(0, 3).map((ev) => (
                <li key={ev.id} className="flex justify-between">
                  <span>{ev.message}</span>
                  <span className="text-xs text-gray-300">
                    {formatDate(ev.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ),
    },
    /* --- Mercado --- */
    {
      id: "mercado",
      title: "Mercado",
      render: () => (
        <Card className="p-4" aria-label="Mercado">
          <h3 className="mb-4 text-xl font-semibold leading-tight">Mercado</h3>
          <div className="flex items-center gap-2">
            <span
              className={
                marketOpen
                  ? "h-3 w-3 rounded-full bg-green-500"
                  : "h-3 w-3 rounded-full bg-red-500"
              }
            />
            <span>{marketOpen ? "Abierto" : "Cerrado"}</span>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-primary">
            <li>Máx. 3 traspasos salientes</li>
            <li>Límite salarial activo</li>
          </ul>
        </Card>
      ),
    },
    /* --- Logros --- */
    {
      id: "logros",
      title: "Logros",
      render: () => (
        <Card className="p-4" aria-label="Logros">
          <h3 className="mb-4 text-xl font-semibold leading-tight">Logros</h3>
          <ul className="space-y-2 text-sm">
            {achievements.map((a) => (
              <li
                key={a.id}
                className={`flex items-center gap-2 ${
                  a.unlocked ? "" : "opacity-40"
                }`}
              >
                <Award
                  size={18}
                  className={a.unlocked ? "text-accent" : "text-gray-400"}
                />
                <span>{a.name}</span>
              </li>
            ))}
          </ul>
        </Card>
      ),
    },
    /* --- Ranking DT --- */
    {
      id: "ranking",
      title: "Ranking DT",
      render: () => (
        <Card className="p-4" aria-label="Ranking DT">
          <h3 className="mb-4 text-xl font-semibold leading-tight">Ranking de Entrenadores</h3>
          {dtRankings.length === 0 ? (
            <EmptyState label="Sin datos de ranking" />
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left">#</th>
                  <th className="text-left">DT</th>
                  <th className="text-center">Club</th>
                  <th className="text-right">Elo</th>
                </tr>
              </thead>
              <tbody>
                {dtRankings.slice(0, 10).map((d: DtRanking, idx: number) => (
                  <RankingRow key={d.id} rank={idx + 1} data={d} />
                ))}
              </tbody>
            </table>
          )}
        </Card>
      ),
    },
    /* --- Noticias --- */
    {
      id: "noticias",
      title: "Noticias",
      render: () => (
        <Card className="p-4" aria-label="Noticias">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <MessagesSquare size={18} />
            Noticias
          </h3>
          {/* filtros */}
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={cat === c}
                onClick={() => {
                  setCat(c);
                  setNewsCount(5);
                }}
              />
            ))}
          </div>
          {/* lista */}
          {visibleNews.length === 0 ? (
            <EmptyState label="Sin noticias en esta categoría" />
          ) : (
            <ul className="space-y-3 text-sm">
              {visibleNews.map((n) => (
                <li key={n.id} className="rounded bg-white/5 p-2">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(n.date ?? n.publishDate)} • {n.category ?? n.type}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {/* cargar más */}
          {visibleNews.length < filteredNews.length && (
            <button
              onClick={loadMoreNews}
              className="mt-4 w-full rounded bg-white/10 py-2 text-xs hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-accent"
            >
              Cargar más
            </button>
          )}
        </Card>
      ),
    },
    /* --- Recordatorios --- */
    {
      id: "recordatorios",
      title: "Recordatorios",
      render: () => (
        <Card className="p-4" aria-label="Recordatorios">
          <h3 className="mb-4 text-xl font-semibold leading-tight">Recordatorios</h3>
          {tasks.length === 0 ? (
            <EmptyState label="No hay recordatorios" />
          ) : (
            <ul className="space-y-2 text-sm">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-accent focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2"
                    checked={t.done}
                    onChange={() => toggleTask(t.id)}
                    aria-label={t.text}
                  />
                  <span className={t.done ? "line-through opacity-60" : ""}>
                    {t.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ),
    },
    /* --- Acciones rápidas --- */
    {
      id: "acciones",
      title: "Acciones rápidas",
      render: () => <QuickActions marketOpen={marketOpen} />,
    },
  ] as const;

  /* layout */
  const DEFAULT_LAYOUT: LayoutItem[] = RIGHT_MODULES.map((m) => ({
    id: m.id,
    visible: true,
  }));
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    const raw = localStorage.getItem("vz_dashboard_layout");
    try {
      const parsed = raw ? (JSON.parse(raw) as LayoutItem[]) : DEFAULT_LAYOUT;
      const validIds = new Set(RIGHT_MODULES.map((m) => m.id));
      const filtered = parsed.filter((l) => validIds.has(l.id));
      return filtered.length > 0 ? filtered : DEFAULT_LAYOUT;
    } catch {
      return DEFAULT_LAYOUT;
    }
  });
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    localStorage.setItem("vz_dashboard_layout", JSON.stringify(layout));
  }, [layout]);

  const loading = !user || !club;

  /* dnd sensors */
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;
    const oldIndex = layout.findIndex((l) => l.id === active.id);
    const newIndex = layout.findIndex((l) => l.id === over.id);
    setLayout(arrayMove(layout, oldIndex, newIndex));
  };
  const findModule = (id: RightModuleId) =>
    RIGHT_MODULES.find((m) => m.id === id);

  /* ═════════════════════════════════════════════════════════════ */
  /* ------------------------------ UI --------------------------- */
  /* ═════════════════════════════════════════════════════════════ */
  if (loading) return <DashboardSkeleton />;
  return (
    <div className="relative transition-colors duration-300">
      {/* Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{ ariaProps: { role: "status", "aria-live": "polite" } }}
      />

      {/* Rayo */}
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
          className="absolute right-20 top-4 rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Customizer toggle */}
        <button
          onClick={() => setCustomizing(!customizing)}
          aria-label={customizing ? "Salir de personalización" : "Personalizar tablero"}
          className="absolute right-14 top-4 rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2"
        >
          <Wrench size={16} />
        </button>

      </PageHeader>

      {customizing && (
        <div className="bg-accent py-2 text-center text-sm font-semibold text-black">
          Modo personalización activo
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <DtMenuTabs />

        <ClubInfoCard club={club} manager={user.username} details={fullClub} />

        {/* KPI + gráfica */}
        <section className="mb-8 space-y-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <div className="flex gap-4 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-6 sm:overflow-visible snap-x">
            <KPICard
              title="Plantilla"
              icon={<Users size={24} />}
              value={`${club.players.length} jugadores`}
              className="min-w-[90%] sm:min-w-0 snap-start"
            />
            <KPICard
              title="Táctica"
              icon={<LayoutIcon size={24} />}
              value={club.formation}
              className="min-w-[90%] sm:min-w-0 snap-start"
            />
            <KPICard
              title="Finanzas"
              icon={<DollarSign size={24} />}
              value={formatCurrency(club.budget)}
              className="min-w-[90%] sm:min-w-0 snap-start"
            />
            <KPICard
              title="Mercado"
              icon={<TrendingUp size={24} />}
              value={marketOpen ? "Abierto" : "Cerrado"}
              className="min-w-[90%] sm:min-w-0 snap-start"
            />
            {fullClub && (
              <KPICard
                title="Afición"
                icon={<Heart size={24} />}
                value={`${fullClub.fanBase.toLocaleString()} hinchas`}
                className="min-w-[90%] sm:min-w-0 snap-start"
              />
            )}
            {fullClub && (
              <KPICard
                title="Moral"
                icon={<Smile size={24} />}
                value={`${fullClub.morale}/100`}
                className="min-w-[90%] sm:min-w-0 snap-start"
              />
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recent}>
                <XAxis dataKey="name" stroke="#AAA" />
                <YAxis stroke="#AAA" />
                <Tooltip />
                <Legend />
                <Bar dataKey="GF" stackId="a" fill="var(--neon-green)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="GC" stackId="a" fill="var(--neon-red)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* cuerpo principal */}
        <main className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* izquierda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 lg:col-span-2"
          >
            {/* Próximo partido */}
            {nextMatch && (
              <Card className="p-4" aria-label="Próximo partido">
                <div className="flex items-center gap-2">
                  {nextMatch.homeTeam === club.name ? (
                    <Home size={16} className="text-accent" aria-hidden />
                  ) : (
                    <Plane size={16} className="text-accent" aria-hidden />
                  )}
                  <h2 className="text-xl font-semibold leading-tight">Próximo partido</h2>
                </div>
                <p className="mt-2">
                  {nextMatch.homeTeam === club.name
                    ? nextMatch.awayTeam
                    : nextMatch.homeTeam}{" "}
                  – <span className="text-gray-300">{formatDate(nextMatch.date)}</span>
                </p>
                <CountdownBar date={nextMatch.date} />
                <Link
                  to="/liga-master/fixture"
                  className="mt-3 inline-flex items-center gap-1 text-accent hover:underline focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2"
                >
                  <Calendar size={14} /> Calendario completo
                </Link>
              </Card>
            )}

            {/* mini tabla + comparativa */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="p-4" aria-label="Mini tabla">
                <h3 className="mb-4 text-xl font-semibold leading-tight">Posiciones</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {miniTable.map((row) => (
                      <tr
                        key={row.club}
                        className={
                          row.club === club.id ? "text-accent font-semibold" : ""
                        }
                      >
                        <td>{row.pos}</td>
                        <td>{row.name}</td>
                        <td className="text-right">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 flex gap-1">
                  {streak.map((w, i) => (
                    <span
                      key={i}
                      className={w ? "text-green-500" : "text-red-500"}
                      aria-label={w ? "Victoria" : "Derrota"}
                    >
                      {w ? "✔" : "✖"}
                    </span>
                  ))}
                </div>
              </Card>

              <Card className="p-4" aria-label="Comparativa liga">
                <h3 className="mb-4 text-xl font-semibold leading-tight">Comparativa con la liga</h3>
                <ul className="space-y-2 text-sm">
                  {bullets.map((b) => (
                    <li key={b.label} className="flex justify-between">
                      <span>{b.label}</span>
                      <span
                        className={
                          b.diff > 0
                            ? "text-green-400"
                            : b.diff < 0
                            ? "text-red-400"
                            : "text-gray-300"
                        }
                        aria-label={
                          b.diff > 0 ? `+${b.diff}` : b.diff.toString()
                        }
                      >
                        {b.diff > 0 && "+"}
                        {b.diff}
                      </span>
                    </li>
                  ))}
                </ul>
                {performer && (
                  <div className="mt-4 flex items-center gap-2 rounded bg-zinc-800 p-2">
                    <img
                      src={performer.avatar}
                      alt={performer.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm">{performer.name}</p>
                      <p className="text-xs text-gray-300">
                        {performer.g} g – {performer.a} a
                      </p>
                    </div>
                    <Trophy size={14} className="ml-auto text-yellow-400" aria-hidden />
                  </div>
                )}
              </Card>
            </div>

            <SeasonObjectives />
            <LatestNews />
          </motion.div>

          {/* derecha */}
          <RightColumn
            customizing={customizing}
            layout={layout}
            setLayout={setLayout}
            sensors={sensors}
            handleDragEnd={handleDragEnd}
            findModule={findModule}
          />
        </main>

        <div className="mb-8" />
      </div>
    </div>
  );
};

export default DtDashboard;

/* ═════════ sub-componentes ═════════ */

interface ClubInfoProps {
  club: DtClub;
  manager: string;
  details?: Club;
}

const ClubInfoCard: React.FC<ClubInfoProps> = ({ club, manager, details }) => (
  <div
    className="relative mb-8 flex items-center gap-4 overflow-hidden rounded-3xl border bg-white/5 p-6 shadow-inner backdrop-blur-md"
    style={
      details
        ? {
            borderColor: details.primaryColor,
            backgroundImage: `linear-gradient(135deg, ${details.primaryColor}33, ${details.secondaryColor}33)`,
          }
        : undefined
    }
    aria-label="Información del club"
  >
    <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-radial from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <img
      src={club.logo}
      alt={club.name}
      className="h-16 w-16 rounded-2xl object-contain"
    />
    <div>
      <h2 className="text-2xl font-bold" aria-live="polite">
        {club.name}
      </h2>
      <p className="text-sm text-gray-300">DT: {manager}</p>
      {details && (
        <>
          <p className="text-sm text-gray-400">
            {details.stadium} • Fundado {details.foundedYear}
          </p>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <span className="badge bg-white/20">{details.playStyle}</span>
            <span className="badge bg-white/20">
              {details.titles.length} títulos
            </span>
            <span className="badge bg-white/20">
              Afición {details.fanBase.toLocaleString()}
            </span>
            <span className="badge bg-white/20">Moral {details.morale}</span>
          </div>
        </>
      )}
    </div>
  </div>
);

const KPICard: React.FC<{ title: string; icon: React.ReactNode; value: string; className?: string }> = ({
  title,
  icon,
  value,
  className = '',
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-inner backdrop-blur-md hover:border-accent transition-all ${className}`.trim()}
  >
    <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
      <span className="rounded-full bg-white/10 p-1 ring-1 ring-inset ring-white/20">{icon}</span>
      {title}
    </div>
    <p className="text-xl font-bold text-white" aria-live="polite">
      {value}
    </p>
  </motion.div>
);

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <p className="flex items-center gap-2 text-sm text-gray-400">
    <Inbox size={16} className="text-gray-400" /> {label}
  </p>
);

/* ═════════ PERSONALIZABLE RIGHT COLUMN ═════════ */

interface RightColumnProps {
  customizing: boolean;
  layout: LayoutItem[];
  setLayout: (l: LayoutItem[]) => void;
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (e: DragEndEvent) => void;
  findModule: (
    id: RightModuleId
  ) => { id: string; title: string; render: () => JSX.Element } | undefined;
}

const RightColumn: React.FC<RightColumnProps> = ({
  customizing,
  layout,
  setLayout,
  sensors,
  handleDragEnd,
  findModule,
}) => {
  const SortableItem: React.FC<{ id: RightModuleId; children: React.ReactNode }> = ({
    id,
    children,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const item = layout.find((l) => l.id === id)!;
    const controls = useAnimation();
    useEffect(() => {
      if (!transform) {
        controls.start({
          opacity: [0.9, 1],
          scale: [0.98, 1],
          transition: { type: 'spring', stiffness: 150, damping: 12 },
        });
      }
    }, [transform, controls]);
    return (
      <motion.div ref={setNodeRef} style={style} animate={controls}>
        <div className="relative">
          {customizing && (
            <>
              <button
                {...attributes}
                {...listeners}
                className="absolute -left-2 top-2 cursor-grab text-gray-400"
                aria-label="Mover módulo"
              >
                <GripVertical size={16} />
              </button>
              <button
                onClick={() =>
                  setLayout(
                    layout.map((l) =>
                      l.id === id ? { ...l, visible: !l.visible } : l
                    )
                  )
                }
                className="absolute -right-2 top-2 text-gray-400"
                aria-label="Mostrar/ocultar"
              >
                {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </>
          )}
          {item.visible ? children : <div className="opacity-40">{children}</div>}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      {customizing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={layout.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            {layout.map((l) => {
              const mod = findModule(l.id);
              return mod ? (
                <SortableItem key={l.id} id={l.id}>
                  {mod.render()}
                </SortableItem>
              ) : null;
            })}
          </SortableContext>
        </DndContext>
      ) : (
        layout
          .filter((l) => l.visible)
          .map((l) => {
            const mod = findModule(l.id);
            return mod ? <div key={l.id}>{mod.render()}</div> : null;
          })
      )}
    </motion.div>
  );
};
