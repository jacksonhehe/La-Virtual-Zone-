/* =========================================================================
   DT DASHBOARD – LIGA MASTER
   Pulido · Gráfica · PDF · Logros · Noticias · Personalización
   + Funciones sociales (Ranking DT + Chat)
   ========================================================================= */

import { useEffect, useMemo, useState, useRef } from "react";
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
  FileText,
  Award,
  MessagesSquare,
  MessageCircle,
  Wrench,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
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
import jsPDF from "jspdf";
import "jspdf-autotable";

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

import StatsCard from "../components/common/StatsCard";
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

/* ▸ Google Analytics 4 */
ReactGA.initialize("G-XXXXXXX");

/* ---------- Tipos ---------- */
interface LayoutItem {
  id: string;
  visible: boolean;
}
interface ChatMsg {
  id: string;
  user: string;
  text: string;
  ts: number;
}

/* ---------- componente principal ---------- */
const DtDashboard: React.FC = () => {
  /* stores */
  const { user } = useAuthStore();
  const {
    club,
    positions,
    fixtures,
    market,
    tasks,
    events,
    toggleTask,
    news,          // noticias
    dtRankings,    // [{ id, username, elo, clubName, clubLogo }]
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

  /* ===== loading ===== */
  if (!user || !club) return <DashboardSkeleton />;

  /* ===== datos derivados ===== */
  const marketOpen = market.open;
  const nextMatch = fixtures.find((m) => !m.played);

  const miniTable = useMemo(
    () => getMiniTable(club.id, positions),
    [club.id, positions]
  );
  const streak = useMemo(
    () => calcStreak(club.id, fixtures),
    [club.id, fixtures]
  );
  const performer = useMemo(
    () => getTopPerformer(club.id),
    [club.id, fixtures]
  );
  const bullets = useMemo(
    () => [goalsDiff(club.id), possessionDiff(club.id), yellowDiff(club.id)],
    [club.id, positions]
  );

  /* ===== gráfica ===== */
  const recent = fixtures
    .filter((m) => m.played)
    .slice(-5)
    .map((m) => ({
      name: `J${m.round}`,
      GF: m.homeTeam === club.name ? m.homeGoals : m.awayGoals,
      GC: m.homeTeam === club.name ? m.awayGoals : m.homeGoals,
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
        unlocked: club.budget > 1_000_000,
      },
    ],
    [streak, performer, club.budget]
  );

  /* ===== noticias ===== */
  const categories = ["Todas", "Fichajes", "Lesiones", "Declaraciones"] as const;
  const [cat, setCat] = useState<(typeof categories)[number]>("Todas");
  const [newsCount, setNewsCount] = useState(5);

  const filteredNews = useMemo(
    () =>
      (news ?? []).filter(
        (n) => cat === "Todas" || n.category.toLowerCase() === cat.toLowerCase()
      ),
    [news, cat]
  );
  const visibleNews = filteredNews.slice(0, newsCount);
  const loadMoreNews = () => setNewsCount((c) => c + 5);

  /* ===== chat (local demo) ===== */
  const [chat, setChat] = useState<ChatMsg[]>(() => {
    const raw = localStorage.getItem("vz_chat_history");
    try {
      return raw ? (JSON.parse(raw) as ChatMsg[]) : [];
    } catch {
      return [];
    }
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("vz_chat_history", JSON.stringify(chat));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendChat = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMsg = {
      id: crypto.randomUUID(),
      user: user.username,
      text: text.trim(),
      ts: Date.now(),
    };
    setChat((old) => [...old.slice(-49), msg]); // máx 50
  };

  /* ===== PDF mensual ===== */
  const generateMonthlyReport = () => {
    const doc = new jsPDF();
    const monthStr = new Date().toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
    });

    doc.setFontSize(18);
    doc.text(`${club.name} – Informe ${monthStr}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Presupuesto: ${formatCurrency(club.budget)}`, 14, 32);
    doc.text(`Plantilla: ${club.players.length} jugadores`, 14, 40);
    doc.text(`Táctica base: ${club.formation}`, 14, 48);
    // @ts-ignore
    doc.autoTable({
      head: [["J", "GF", "GC"]],
      body: recent.map((r) => [r.name, r.GF, r.GC]),
      startY: 60,
    });
    doc.save(`Informe_${club.slug}_${monthStr}.pdf`);
    toast.success("Informe descargado");
  };

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
          <h3 className="mb-3 font-semibold">Anuncios</h3>
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
          <h3 className="mb-3 font-semibold">Mercado</h3>
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
          <h3 className="mb-3 font-semibold">Logros</h3>
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
          <h3 className="mb-3 font-semibold">Ranking de Entrenadores</h3>
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
                {dtRankings.slice(0, 10).map((d, idx) => (
                  <tr key={d.id} className="border-t border-white/10">
                    <td>{idx + 1}</td>
                    <td>{d.username}</td>
                    <td className="flex items-center justify-center gap-1">
                      <img
                        src={d.clubLogo}
                        alt={d.clubName}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="text-right">{d.elo}</td>
                  </tr>
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
              <button
                key={c}
                onClick={() => {
                  setCat(c);
                  setNewsCount(5);
                }}
                className={`rounded-full px-3 py-1 text-xs ${
                  cat === c
                    ? "bg-accent text-black"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                } focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-accent`}
              >
                {c}
              </button>
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
                    {formatDate(n.date)} • {n.category}
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
    /* --- Chat --- */
    {
      id: "chat",
      title: "Chat",
      render: () => <ChatModule chat={chat} sendChat={sendChat} endRef={chatEndRef} />,
    },
    /* --- Recordatorios --- */
    {
      id: "recordatorios",
      title: "Recordatorios",
      render: () => (
        <Card className="p-4" aria-label="Recordatorios">
          <h3 className="mb-3 font-semibold">Recordatorios</h3>
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

  type RightModuleId = (typeof RIGHT_MODULES)[number]["id"];

  /* layout */
  const DEFAULT_LAYOUT: LayoutItem[] = RIGHT_MODULES.map((m) => ({
    id: m.id,
    visible: true,
  }));
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    const raw = localStorage.getItem("vz_dashboard_layout");
    try {
      return raw ? (JSON.parse(raw) as LayoutItem[]) : DEFAULT_LAYOUT;
    } catch {
      return DEFAULT_LAYOUT;
    }
  });
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    localStorage.setItem("vz_dashboard_layout", JSON.stringify(layout));
  }, [layout]);

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
    RIGHT_MODULES.find((m) => m.id === id)!;

  /* ═════════════════════════════════════════════════════════════ */
  /* ------------------------------ UI --------------------------- */
  /* ═════════════════════════════════════════════════════════════ */
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

        {/* PDF */}
        <button
          onClick={generateMonthlyReport}
          aria-label="Descargar informe mensual"
          className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-accent px-3 py-2 text-black backdrop-blur transition hover:brightness-110 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2"
        >
          <FileText size={16} />
          <span className="hidden sm:inline">Informe</span>
        </button>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        <DtMenuTabs />

        {/* KPI + gráfica */}
        <section className="mb-8 space-y-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Plantilla"
              icon={<Users size={20} />}
              value={`${club.players.length} jugadores`}
            />
            <KPICard
              title="Táctica"
              icon={<LayoutIcon size={20} />}
              value={club.formation}
            />
            <KPICard
              title="Finanzas"
              icon={<DollarSign size={20} />}
              value={formatCurrency(club.budget)}
            />
            <KPICard
              title="Mercado"
              icon={<TrendingUp size={20} />}
              value={marketOpen ? "Abierto" : "Cerrado"}
            />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recent}>
                <XAxis dataKey="name" stroke="#AAA" />
                <YAxis stroke="#AAA" />
                <Tooltip />
                <Legend />
                <Bar dataKey="GF" stackId="a" />
                <Bar dataKey="GC" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* cuerpo principal */}
        <main className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* izquierda */}
          <div className="space-y-8 lg:col-span-2">
            {/* Próximo partido */}
            {nextMatch && (
              <Card className="p-4" aria-label="Próximo partido">
                <div className="flex items-center gap-2">
                  {nextMatch.homeTeam === club.name ? (
                    <Home size={16} className="text-accent" aria-hidden />
                  ) : (
                    <Plane size={16} className="text-accent" aria-hidden />
                  )}
                  <h2 className="font-semibold">Próximo partido</h2>
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
                <h3 className="mb-3 font-semibold">Posiciones</h3>
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
                <h3 className="mb-3 font-semibold">Comparativa con la liga</h3>
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
          </div>

          {/* derecha */}
          <RightColumn
            customizing={customizing}
            layout={layout}
            setLayout={setLayout}
            sensors={sensors}
            handleDragEnd={handleDragEnd}
            findModule={(id) => RIGHT_MODULES.find((m) => m.id === id)!}
          />
        </main>

        <div className="mb-8" />
      </div>
    </div>
  );
};

export default DtDashboard;

/* ═════════ sub-componentes ═════════ */

const KPICard: React.FC<{ title: string; icon: React.ReactNode; value: string }> = ({
  title,
  icon,
  value,
}) => (
  <motion.div
    whileHover={{ scale: 1.04 }}
    className="flex flex-col justify-between rounded-2xl bg-white/5 p-6 shadow-inner backdrop-blur-md"
  >
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-300">
      {icon}
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

/* Chat módulo */
const ChatModule: React.FC<{
  chat: ChatMsg[];
  sendChat: (t: string) => void;
  endRef: React.RefObject<HTMLDivElement>;
}> = ({ chat, sendChat, endRef }) => {
  const [input, setInput] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChat(input);
    setInput("");
  };
  return (
    <Card className="p-4" aria-label="Chat de comunidad">
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <MessageCircle size={18} /> Chat
      </h3>
      <div className="mb-3 h-48 overflow-y-auto rounded bg-white/5 p-2 text-xs">
        {chat.map((m) => (
          <p key={m.id} className="mb-1">
            <span className="font-semibold text-accent">{m.user}</span>: {m.text}
          </p>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded bg-white/10 px-2 py-1 text-xs focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-accent px-3 text-xs font-semibold text-black hover:brightness-110"
        >
          Enviar
        </button>
      </form>
    </Card>
  );
};

/* ═════════ PERSONALIZABLE RIGHT COLUMN ═════════ */

interface RightColumnProps {
  customizing: boolean;
  layout: LayoutItem[];
  setLayout: (l: LayoutItem[]) => void;
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (e: DragEndEvent) => void;
  findModule: (id: string) => { id: string; title: string; render: () => JSX.Element };
}

const RightColumn: React.FC<RightColumnProps> = ({
  customizing,
  layout,
  setLayout,
  sensors,
  handleDragEnd,
  findModule,
}) => {
  const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({
    id,
    children,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const item = layout.find((l) => l.id === id)!;
    return (
      <div ref={setNodeRef} style={style}>
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
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {customizing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={layout.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            {layout.map((l) => (
              <SortableItem key={l.id} id={l.id}>
                {findModule(l.id).render()}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        layout
          .filter((l) => l.visible)
          .map((l) => <div key={l.id}>{findModule(l.id).render()}</div>)
      )}
    </div>
  );
};
