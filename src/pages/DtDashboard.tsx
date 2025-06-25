/* =========================================================================
   DT DASHBOARD – Estilo “gradient neo-blue” (sección Liga Master)
   Mantiene lógica previa + nuevo layout de la maqueta 24/11/2024
   ========================================================================= */

import { useMemo, useState } from "react";
import {
  Calendar,
  DollarSign,
  LayoutGrid,
  PieChart,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Toaster } from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";
import Card from "@/components/common/Card";
import Spinner from "@/components/Spinner";
import CountdownBar from "@/components/common/CountdownBar";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { formatCurrency, formatDate, getMiniTable } from "@/utils/helpers";

interface LayoutItem {
  id: string;
  visible: boolean;
}

/* ——— componente principal ——— */
export default function DtDashboard() {
  const { user } = useAuthStore();
  const {
    club,
    fixtures,
    positions,
    players,
  } = useDataStore();

  /* datos derivados */
  const nextMatch = fixtures.find((m) => !m.played);
  const miniTable = useMemo(
    () => (club ? getMiniTable(club.id, positions) : []),
    [club, positions]
  );

  const barData = fixtures
    .filter((m) => m.played)
    .slice(-8)
    .map((m, i) => ({
      idx: i + 1,
      gf: m.homeTeam === club?.name ? m.homeGoals : m.awayGoals,
    }));

  /* ———  layout personalizable (solo side-column) ——— */
  const DEFAULT_LAYOUT: LayoutItem[] = [
    { id: "table", visible: true },
    { id: "next", visible: true },
    { id: "top", visible: true },
    { id: "actions", visible: true },
  ];
  const [layout, setLayout] = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDrag = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const oldI = layout.findIndex((l) => l.id === active.id);
    const newI = layout.findIndex((l) => l.id === over.id);
    if (oldI !== newI) setLayout(arrayMove(layout, oldI, newI));
  };

  if (!user || !club) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  /* ——— render helpers ——— */
  const RightCard: React.FC<{ id: string; children: React.ReactNode }> = ({
    id,
    children,
  }) => {
    const { setNodeRef, transform } = useSortable({ id });
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform) }}
        className="space-y-6"
      >
        {children}
      </div>
    );
  };

  /* =========================================================================
     UI
     ========================================================================= */
  return (
    <div className="bg-gradient-to-br from-[var(--bg-gradient-from)] to-[var(--bg-gradient-to)] min-h-screen">
      <Toaster />
      {/* hero reutiliza tu componente global */}
      <PageHeader
        title="Tablero del DT"
        subtitle="Gestiona tu club en Liga Master"
        image="/hero-dt.jpg"
        full
      />

      <div className="mx-auto max-w-6xl px-4 pb-20">
        {/* KPI row ---------------------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-4 py-6 md:grid-cols-5">
          <KPICard icon={<Calendar size={18} />} label="Partidos" value="24" />
          <KPICard icon={<PieChart size={18} />} label="Puntos" value="67" />
          <KPICard
            icon={<DollarSign size={18} />}
            label="Presupuesto"
            value={formatCurrency(club.budget)}
          />
          <KPICard icon={<Trophy size={18} />} label="Posición" value="3°" />
          <KPICard
            icon={<LayoutGrid size={18} />}
            label="Formación"
            value={club.formation}
          />
        </div>

        {/* torso: grid 2 : 1 ------------------------------------------------------ */}
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* -------- columna izquierda -------- */}
          <div className="space-y-6">
            {/* gráfico rendimiento */}
            <Card title="Rendimiento de la Temporada">
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barCategoryGap={6}>
                    <XAxis dataKey="idx" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="gf" radius={[4, 4, 0, 0]} fill="#14b8a6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* plantilla */}
            <Card title="Plantilla">
              <div className="flex justify-between text-sm">
                <div>
                  <h4 className="mb-1 font-medium text-accent">Titulares</h4>
                  <p>Delanteros  3</p>
                  <p>Mediocampistas  4</p>
                  <p>Defensores  4</p>
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-yellow-400">Suplentes</h4>
                  <p>Disponibles  14</p>
                  <p>Lesionados  2</p>
                  <p>Suspendidos  1</p>
                </div>
              </div>
            </Card>

            {/* últimos partidos */}
            <Card title="Últimos Partidos">
              <ul className="text-sm">
                {fixtures
                  .filter((m) => m.played)
                  .slice(-4)
                  .map((m) => (
                    <li
                      key={m.id}
                      className="flex justify-between py-1 odd:bg-white/5 px-2 rounded"
                    >
                      <span>
                        {m.result === "W" ? "✅" : m.result === "D" ? "⚪" : "❌"}{" "}
                        vs {m.awayTeam}
                      </span>
                      <span className="tabular-nums">
                        {m.homeGoals}-{m.awayGoals}
                      </span>
                    </li>
                  ))}
              </ul>
            </Card>
          </div>

          {/* -------- columna derecha (sortable) -------- */}
          <DndContext sensors={sensors} onDragEnd={handleDrag}>
            <SortableContext
              strategy={verticalListSortingStrategy}
              items={layout.map((l) => l.id)}
            >
              {layout.map((l) =>
                l.id === "table" ? (
                  <RightCard id="table" key="table">
                    <Card title="Clasificación">
                      <table className="w-full text-sm">
                        <tbody>
                          {miniTable.slice(0, 5).map((r) => (
                            <tr
                              key={r.club}
                              className={`${
                                r.club === club.id
                                  ? "bg-primary/10 text-accent"
                                  : ""
                              }`}
                            >
                              <td className="w-4">{r.pos}</td>
                              <td>{r.name}</td>
                              <td className="text-right">{r.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  </RightCard>
                ) : l.id === "next" ? (
                  <RightCard id="next" key="next">
                    <Card title="Próximo Partido" center>
                      {nextMatch ? (
                        <>
                          <h4 className="mb-1 text-center font-bold text-accent">
                            vs {nextMatch.awayTeam}
                          </h4>
                          <p className="text-center text-xs">
                            {formatDate(nextMatch.date)} • {nextMatch.competition}
                          </p>
                          <CountdownBar date={nextMatch.date} compact />
                        </>
                      ) : (
                        <p className="text-center text-sm text-gray-400">
                          Sin partidos programados
                        </p>
                      )}
                    </Card>
                  </RightCard>
                ) : l.id === "top" ? (
                  <RightCard id="top" key="top">
                    <Card title="Mejores Jugadores">
                      <ul className="space-y-1 text-sm">
                        {players
                          .sort((a, b) => b.goals - a.goals)
                          .slice(0, 3)
                          .map((p, i) => (
                            <li
                              key={p.id}
                              className="flex justify-between rounded px-2 py-1 odd:bg-white/5"
                            >
                              <span>{i + 1}.  {p.name}</span>
                              <span className="text-accent">{p.goals}</span>
                            </li>
                          ))}
                      </ul>
                    </Card>
                  </RightCard>
                ) : (
                  <RightCard id="actions" key="actions">
                    <Card title="Acciones Rápidas">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button className="rounded bg-accent py-1">
                          Ver Plantilla
                        </button>
                        <button className="rounded bg-pink-500 py-1">
                          Mercado
                        </button>
                        <button className="rounded bg-green-500 py-1">
                          Entrenar
                        </button>
                        <button className="rounded bg-orange-500 py-1">
                          ⚙️
                        </button>
                      </div>
                    </Card>
                  </RightCard>
                )
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

/* —————————————— subcomponentes —————————————— */

const KPICard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-lg bg-white/5 p-4 text-center shadow-[0_0_0_1px_var(--card-border)]">
    <div className="mb-1 flex justify-center text-accent">{icon}</div>
    <p className="text-2xl font-semibold">{value}</p>
    <p className="text-xs text-gray-300">{label}</p>
  </div>
);

/* Card re-export minimal if you use your own  */
