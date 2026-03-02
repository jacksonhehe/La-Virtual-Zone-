import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Rocket } from 'lucide-react';
import { getZonesData, type ZoneStanding, calculateZoneStandings } from '../data/zonesData';
import { useDataStore } from '../store/dataStore';
import { createFallbackStandings } from '../utils/standingsHelpers';

type ZoneStandingWithPosition = ZoneStanding & { position: number };
type FormResult = 'G' | 'E' | 'P' | 'N';

interface ZonesProps {
  className?: string;
}

const VALID_ZONES = ['A', 'B', 'C', 'D'];

const getRowTierClass = (position: number) => {
  if (position <= 3) return 'bg-emerald-500/10';
  if (position <= 6) return 'bg-cyan-500/10';
  if (position <= 9) return 'bg-orange-500/10';
  return 'bg-red-500/10';
};

const getFormChipClass = (value: FormResult) => {
  if (value === 'N') return 'bg-slate-600 text-slate-200';
  if (value === 'G') return 'bg-green-500 text-white';
  if (value === 'E') return 'bg-amber-500 text-white';
  return 'bg-red-500 text-white';
};

const buildDeterministicForm = (team: ZoneStandingWithPosition, zone: string): FormResult[] => {
  if (team.pj <= 0) return ['N', 'N', 'N', 'N', 'N'];

  const total = team.pg + team.pe + team.pp;
  if (total <= 0) return ['N', 'N', 'N', 'N', 'N'];

  let seed = `${team.id}-${zone}`.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 1;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Confidence model: with few played matches, keep unknown slots as "N".
  const filledSlots = Math.min(5, total);
  const neutralSlots = 5 - filledSlots;

  // Distribute played slots proportionally among G/E/P using largest remainder.
  const rawG = (team.pg / total) * filledSlots;
  const rawE = (team.pe / total) * filledSlots;
  const rawP = (team.pp / total) * filledSlots;

  let gCount = Math.floor(rawG);
  let eCount = Math.floor(rawE);
  let pCount = Math.floor(rawP);
  let assigned = gCount + eCount + pCount;

  const remainders: Array<{ key: 'G' | 'E' | 'P'; value: number }> = [
    { key: 'G', value: rawG - gCount },
    { key: 'E', value: rawE - eCount },
    { key: 'P', value: rawP - pCount }
  ].sort((a, b) => b.value - a.value);

  let idx = 0;
  while (assigned < filledSlots) {
    const pick = remainders[idx % remainders.length].key;
    if (pick === 'G') gCount += 1;
    if (pick === 'E') eCount += 1;
    if (pick === 'P') pCount += 1;
    assigned += 1;
    idx += 1;
  }

  const resultPool: FormResult[] = [
    ...Array.from({ length: gCount }, () => 'G' as const),
    ...Array.from({ length: eCount }, () => 'E' as const),
    ...Array.from({ length: pCount }, () => 'P' as const)
  ];

  // Deterministic shuffle for actual results only.
  for (let i = resultPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    const temp = resultPool[i];
    resultPool[i] = resultPool[j];
    resultPool[j] = temp;
  }

  // Anchor streak to the right: unknown slots remain on the left.
  return [...Array.from({ length: neutralSlots }, () => 'N' as const), ...resultPool];
};

const Zones = ({ className = '' }: ZonesProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clubs, standings, tournaments } = useDataStore();

  const activeZoneParam = searchParams.get('zona') || 'A';
  const activeZone = VALID_ZONES.includes(activeZoneParam) ? activeZoneParam : 'A';

  const ligaMasterTournamentId = useMemo(() => {
    const normalize = (value: string) => String(value || '').trim().toLowerCase();
    const byName = tournaments.find((t) => normalize(t.name).includes('liga master'));
    if (byName) return byName.id;

    const byId = tournaments.find((t) => t.id === 'tournament1');
    if (byId) return byId.id;

    const byLeagueType = tournaments.find((t) => t.type === 'league');
    return byLeagueType?.id || null;
  }, [tournaments]);

  useEffect(() => {
    let cancelled = false;

    const refreshStandings = async () => {
      if (!ligaMasterTournamentId) return;
      try {
        const { recalculateAndUpdateStandings } = await import('../utils/standingsHelpers');
        if (!cancelled) {
          await recalculateAndUpdateStandings(ligaMasterTournamentId);
        }
      } catch (error) {
        console.error('Zones: Error recalculating standings on mount:', error);
      }
    };

    refreshStandings();
    return () => {
      cancelled = true;
    };
  }, [ligaMasterTournamentId]);

  const setActiveZone = (zone: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('zona', zone);
    setSearchParams(newParams);
  };

  const currentStandings = useMemo(() => {
    return standings.length > 0 ? standings : createFallbackStandings(clubs);
  }, [standings, clubs]);

  const zonesData = useMemo(() => getZonesData(clubs, currentStandings), [clubs, currentStandings]);

  const allStandings = useMemo(() => {
    const result: Record<string, ZoneStandingWithPosition[]> = {};
    Object.keys(zonesData).forEach((zoneKey) => {
      result[zoneKey] = calculateZoneStandings(zonesData[zoneKey]);
    });
    return result;
  }, [zonesData]);

  const activeZoneStandings = allStandings[activeZone] || [];

  return (
    <div className={`min-h-screen bg-dark ${className}`}>
      <div className="w-full border-b border-slate-700/70 bg-slate-900/70 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center justify-center gap-3 tight-safe">
          {VALID_ZONES.map((zone) => {
            const isActive = zone === activeZone;
            return (
              <button
                key={zone}
                onClick={() => setActiveZone(zone)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                  isActive
                    ? 'bg-primary border-primary text-white'
                    : 'bg-slate-800/70 border-slate-700 text-slate-200 hover:bg-slate-700/70'
                }`}
              >
                LIGA {zone}
              </button>
            );
          })}

          <button
            onClick={() => navigate('/liga-master/rankings')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide border border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 inline-flex items-center gap-2 transition-colors"
          >
            <Rocket size={15} />
            PROYECCION
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8 tight-safe">
        <section className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/50 p-5 md:p-8 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_45%)]" />

          <h1 className="text-center text-4xl md:text-5xl font-bold uppercase tracking-wide text-white">
            Liga <span className="text-primary">{activeZone}</span>
          </h1>
          <p className="text-center text-sm text-slate-300 mt-2">
            Clasificacion de la zona y rendimiento reciente de los clubes
          </p>

          <div className="mt-8 overflow-x-auto rounded-xl border border-slate-700/60">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-900/80 text-slate-200 border-b border-slate-700/60">
                <tr className="uppercase tracking-wide text-[13px]">
                  <th className="p-4 text-center">#</th>
                  <th className="p-4 text-left">Equipo</th>
                  <th className="p-4 text-center">PTS</th>
                  <th className="p-4 text-center">PJ</th>
                  <th className="p-4 text-center">PG</th>
                  <th className="p-4 text-center">PE</th>
                  <th className="p-4 text-center">PP</th>
                  <th className="p-4 text-center">GF</th>
                  <th className="p-4 text-center">GC</th>
                  <th className="p-4 text-center">DG</th>
                  <th className="p-4 text-center bg-primary/80">Racha</th>
                </tr>
              </thead>
              <tbody>
                {activeZoneStandings.map((team) => {
                  const streak = buildDeterministicForm(team, activeZone);
                  return (
                    <tr
                      key={team.id}
                      className={`border-b border-slate-700/50 ${getRowTierClass(team.position)} hover:bg-slate-700/30 transition-colors`}
                    >
                      <td className="p-4 text-center text-slate-300 font-semibold">{team.position}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={team.escudoUrl}
                            alt={`Escudo de ${team.nombre}`}
                            className="w-8 h-8 rounded object-cover"
                            loading="lazy"
                          />
                          <span className="font-semibold text-white text-base">{team.nombre}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-primary text-2xl font-bold leading-none">{team.pts}</td>
                      <td className="p-4 text-center text-slate-200 text-base">{team.pj}</td>
                      <td className="p-4 text-center text-slate-200 text-base">{team.pg}</td>
                      <td className="p-4 text-center text-slate-200 text-base">{team.pe}</td>
                      <td className="p-4 text-center text-slate-200 text-base">{team.pp}</td>
                      <td className="p-4 text-center text-slate-200 text-base">{team.gf}</td>
                      <td className="p-4 text-center text-slate-200 text-base">{team.gc}</td>
                      <td className="p-4 text-center text-slate-100 text-xl font-semibold">
                        {team.dg > 0 ? '+' : ''}
                        {team.dg}
                      </td>
                      <td className="p-4 text-center bg-slate-900/45 border-l border-slate-700/50">
                        <div className="inline-flex items-center justify-end gap-1.5 w-full">
                          {streak.map((result, idx) => (
                            <span
                              key={`${team.id}-form-${idx}`}
                              className={`w-7 h-7 rounded-md text-[12px] font-extrabold tracking-wide inline-flex items-center justify-center shadow-sm border border-black/20 ${getFormChipClass(result)}`}
                            >
                              {result === 'N' ? '-' : result}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-700/60 bg-slate-800/50 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-200">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              PRIMERA (1-3)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              SEGUNDA (4-6)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-300 border border-yellow-100/70" />
              TERCERA (7-9)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              CUARTA (10-12)
            </span>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('/liga-master')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default Zones;
