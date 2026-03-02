import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  BarChart4,
  Star,
  Medal,
  AlertTriangle,
  PieChart,
  Shield,
  Target,
  Clock3
} from 'lucide-react';
import { getZonesData, getPositionColor, getZoneName, type ZoneStanding, calculateZoneStandings } from '../data/zonesData';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { createFallbackStandings } from '../utils/standingsHelpers';

type ZoneStandingWithPosition = ZoneStanding & { position: number };

interface ZonesProps {
  className?: string;
}

const Zones = ({ className = '' }: ZonesProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clubs, standings, tournaments } = useDataStore();
  const { user } = useAuthStore();

  const activeZone = searchParams.get('zona') || 'A';

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

  const zonesData = useMemo(() => {
    return getZonesData(clubs, currentStandings);
  }, [clubs, currentStandings]);

  const allStandings = useMemo(() => {
    const result: Record<string, (ZoneStanding & { position: number })[]> = {};

    Object.keys(zonesData).forEach((zoneKey) => {
      result[zoneKey] = calculateZoneStandings(zonesData[zoneKey]);
    });

    return result;
  }, [zonesData]);

  const activeZoneStandings: ZoneStandingWithPosition[] = allStandings[activeZone] || [];

  const zoneTheme: Record<string, { active: string; inactive: string; soft: string; text: string }> = {
    A: {
      active: 'border-emerald-400/50 bg-emerald-500/10',
      inactive: 'border-slate-700/60 bg-slate-900/40 hover:border-emerald-500/30',
      soft: 'bg-emerald-500/10',
      text: 'text-emerald-300'
    },
    B: {
      active: 'border-cyan-400/50 bg-cyan-500/10',
      inactive: 'border-slate-700/60 bg-slate-900/40 hover:border-cyan-500/30',
      soft: 'bg-cyan-500/10',
      text: 'text-cyan-300'
    },
    C: {
      active: 'border-orange-400/50 bg-orange-500/10',
      inactive: 'border-slate-700/60 bg-slate-900/40 hover:border-orange-500/30',
      soft: 'bg-orange-500/10',
      text: 'text-orange-300'
    },
    D: {
      active: 'border-fuchsia-400/50 bg-fuchsia-500/10',
      inactive: 'border-slate-700/60 bg-slate-900/40 hover:border-fuchsia-500/30',
      soft: 'bg-fuchsia-500/10',
      text: 'text-fuchsia-300'
    }
  };

  const userZoneKey = useMemo(() => {
    if (!user?.clubId) return '';

    const normalize = (value: string) => String(value || '').trim().toLowerCase();
    const club = clubs.find((entry) => entry.id === user.clubId);
    if (!club) return '';

    return (
      Object.keys(zonesData).find((zoneKey) =>
        (zonesData[zoneKey] || []).some(
          (team) => normalize(team.id) === normalize(club.id) || normalize(team.nombre) === normalize(club.name)
        )
      ) || ''
    );
  }, [clubs, user?.clubId, zonesData]);

  const bestAttackTeam = useMemo(() => {
    if (activeZoneStandings.length === 0) return null;
    return activeZoneStandings.reduce((best, team) => (team.gf > best.gf ? team : best));
  }, [activeZoneStandings]);

  const bestDefenseTeam = useMemo(() => {
    if (activeZoneStandings.length === 0) return null;
    return activeZoneStandings.reduce((best, team) => (team.gc < best.gc ? team : best));
  }, [activeZoneStandings]);

  const zonesCount = Object.keys(allStandings).length;
  const totalTeams = Object.values(allStandings).reduce((total, zone) => total + zone.length, 0);
  const maxTeamsPerZone = Math.max(0, ...Object.values(allStandings).map((zone) => zone.length));
  const leadersPoints = Object.values(allStandings).reduce((total, zone) => total + (zone[0]?.pts || 0), 0);

  const getPositionBadgeColor = (position: number) => {
    const colorType = getPositionColor(position);
    switch (colorType) {
      case 'green':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'light-blue':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'orange':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'red':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`min-h-screen bg-dark ${className}`}>
      <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl tight-safe space-y-8">
        <section className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 md:p-8 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.16),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_45%)]" />
          <div className="relative flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700/70 bg-slate-900/40 text-xs text-slate-300 uppercase tracking-wide">
                  <Shield size={14} className="text-primary" />
                  Liga Master 2025
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Zonas de Competicion</h1>
                <p className="text-slate-300 max-w-2xl text-sm md:text-base">
                  Visualiza las 4 ligas con su clasificacion actual, lideres y rendimiento en tiempo real.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  EN VIVO
                </span>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <button
                onClick={() => navigate('/liga-master')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700/70 bg-slate-900/40 text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft size={16} />
                Volver al dashboard
              </button>
              {userZoneKey && (
                <button
                  onClick={() => setActiveZone(userZoneKey)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Target size={16} />
                  Ver mi liga ({getZoneName(userZoneKey)})
                </button>
              )}
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700/70 bg-slate-900/40 text-xs text-slate-300">
                <Clock3 size={14} className="text-slate-400" />
                Actualizado con la ultima carga de resultados
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Zonas</p>
            <p className="text-2xl font-bold text-white">{zonesCount}</p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Equipos</p>
            <p className="text-2xl font-bold text-white">{totalTeams}</p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Por liga</p>
            <p className="text-2xl font-bold text-white">{maxTeamsPerZone}</p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Pts lideres</p>
            <p className="text-2xl font-bold text-white">{leadersPoints}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-3 md:p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {['A', 'B', 'C', 'D'].map((zone) => {
              const zoneStandings = allStandings[zone] || [];
              const leader = zoneStandings[0];
              const isActive = activeZone === zone;
              const theme = zoneTheme[zone] || zoneTheme.A;

              return (
                <button
                  key={zone}
                  onClick={() => setActiveZone(zone)}
                  className={`rounded-xl border px-3 py-3 text-left transition-colors ${isActive ? theme.active : theme.inactive}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${isActive ? theme.text : 'text-slate-200'}`}>Liga {zone}</span>
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-500'}`} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{leader?.nombre || 'Sin datos'}</p>
                  <p className="text-sm text-white font-semibold">{leader?.pts || 0} pts</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4 space-y-2">
            <div className="inline-flex items-center gap-2 text-slate-300 text-xs uppercase tracking-wide">
              <Trophy size={14} className="text-yellow-400" />
              Lider actual
            </div>
            <p className="text-lg font-semibold text-white">{activeZoneStandings[0]?.nombre || 'N/A'}</p>
            <p className="text-sm text-slate-400">{activeZoneStandings[0]?.pts || 0} puntos</p>
          </article>

          <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4 space-y-2">
            <div className="inline-flex items-center gap-2 text-slate-300 text-xs uppercase tracking-wide">
              <TrendingUp size={14} className="text-green-400" />
              Mejor ataque
            </div>
            <p className="text-lg font-semibold text-white">{bestAttackTeam?.nombre || 'N/A'}</p>
            <p className="text-sm text-slate-400">{bestAttackTeam?.gf || 0} goles a favor</p>
          </article>

          <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4 space-y-2">
            <div className="inline-flex items-center gap-2 text-slate-300 text-xs uppercase tracking-wide">
              <BarChart4 size={14} className="text-cyan-400" />
              Mejor defensa
            </div>
            <p className="text-lg font-semibold text-white">{bestDefenseTeam?.nombre || 'N/A'}</p>
            <p className="text-sm text-slate-400">{bestDefenseTeam?.gc || 0} goles en contra</p>
          </article>
        </section>

        <section className="bg-slate-800/50 rounded-2xl border border-slate-700/60 p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${zoneTheme[activeZone]?.active || 'border-slate-700/60'} ${zoneTheme[activeZone]?.soft || 'bg-slate-800/50'}`}>
                <span className={`text-2xl font-bold ${zoneTheme[activeZone]?.text || 'text-white'}`}>{activeZone}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{getZoneName(activeZone)}</h2>
                <p className="text-slate-400 text-sm md:text-base">Clasificacion al dia - {activeZoneStandings.length} equipos</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-medium rounded-lg">
              EN VIVO
            </span>
          </div>

          <div className="grid gap-4 sm:hidden">
            {activeZoneStandings.map((team) => (
              <article
                key={team.id}
                className="p-4 rounded-xl border border-gray-700 bg-gray-900/60 shadow-sm"
                aria-label={`Tarjeta de ${team.nombre}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getPositionBadgeColor(team.position)}`}>
                      {team.position}
                    </span>
                    <div className="flex items-center gap-2">
                      <img
                        src={team.escudoUrl}
                        alt={`Escudo de ${team.nombre}`}
                        className="w-10 h-10 rounded object-cover"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-white font-semibold leading-tight">{team.nombre}</p>
                        <p className="text-xs text-slate-300">PTS: {team.pts} | DG {team.dg > 0 ? '+' : ''}{team.dg}</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-slate-200 font-medium">{team.porcentaje.toFixed(0)}% rendimiento</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-semibold text-sm">PJ</span>
                    <span>{team.pj}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-semibold text-sm">PG / PE</span>
                    <span className="text-green-300 font-semibold">{team.pg}</span>
                    <span className="text-yellow-300 font-semibold">{team.pe}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-semibold text-sm">PP</span>
                    <span className="text-red-300 font-semibold">{team.pp}</span>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-200">GF {team.gf}</span>
                      <span className="text-slate-200">GC {team.gc}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min(team.porcentaje, 100)}%` }}
                        aria-label={`Rendimiento ${team.porcentaje.toFixed(1)}%`}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="table-scroll overflow-x-auto hidden sm:block scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" role="region" aria-label="Tabla de posiciones por zona">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr className="text-sm font-semibold text-slate-300">
                  <th className="p-4 text-center min-w-[60px]">POS</th>
                  <th className="p-4 text-left min-w-[180px]">EQUIPO</th>
                  <th className="p-4 text-center min-w-[60px]">PTS</th>
                  <th className="p-4 text-center min-w-[50px] hidden sm:table-cell">PJ</th>
                  <th className="p-4 text-center min-w-[50px] hidden md:table-cell">PG</th>
                  <th className="p-4 text-center min-w-[50px] hidden md:table-cell">PE</th>
                  <th className="p-4 text-center min-w-[50px] hidden md:table-cell">PP</th>
                  <th className="p-4 text-center min-w-[50px] hidden lg:table-cell">GF</th>
                  <th className="p-4 text-center min-w-[50px] hidden lg:table-cell">GC</th>
                  <th className="p-4 text-center min-w-[60px]">DG</th>
                  <th className="p-4 text-center min-w-[70px]">%</th>
                </tr>
              </thead>
              <tbody>
                {activeZoneStandings.map((team) => (
                  <tr key={team.id} className="border-b border-gray-600 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getPositionBadgeColor(team.position)}`}>
                        {team.position}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={team.escudoUrl}
                          alt={`Escudo de ${team.nombre}`}
                          className="w-8 h-8 rounded object-cover"
                          loading="lazy"
                        />
                        <span className="font-medium text-white">{team.nombre}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xl font-bold text-white">{team.pts}</span>
                    </td>
                    <td className="p-4 text-center text-slate-300 hidden sm:table-cell">{team.pj}</td>
                    <td className="p-4 text-center text-green-400 hidden md:table-cell font-medium">{team.pg}</td>
                    <td className="p-4 text-center text-yellow-400 hidden md:table-cell font-medium">{team.pe}</td>
                    <td className="p-4 text-center text-red-400 hidden md:table-cell font-medium">{team.pp}</td>
                    <td className="p-4 text-center text-slate-300 hidden lg:table-cell">{team.gf}</td>
                    <td className="p-4 text-center text-slate-400 hidden lg:table-cell">{team.gc}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`font-medium px-2 py-1 rounded ${
                          team.dg > 0
                            ? 'text-green-400 bg-green-500/10'
                            : team.dg < 0
                            ? 'text-red-400 bg-red-500/10'
                            : 'text-slate-400 bg-slate-500/10'
                        }`}
                      >
                        {team.dg > 0 ? '+' : ''}
                        {team.dg}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-white font-medium">{team.porcentaje.toFixed(1)}%</span>
                        <div className="w-12 h-1 bg-slate-600 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(team.porcentaje, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-slate-800/50 rounded-2xl border border-slate-700/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-slate-700/70 bg-slate-900/40 flex items-center justify-center">
                <BarChart4 size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Sistema de Ascensos y Descensos</h3>
                <p className="text-sm text-slate-400">Criterio oficial de posiciones por liga</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-semibold">
              OFICIAL
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-200">Ascensos</div>
              <article className="flex items-center gap-4 p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center">
                  <Trophy size={18} className="text-green-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-200">Posiciones 1-3</p>
                  <p className="text-sm text-slate-300">Ascenso directo a Primera Division</p>
                </div>
              </article>
              <article className="flex items-center gap-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                  <Star size={18} className="text-cyan-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-cyan-200">Posiciones 4-6</p>
                  <p className="text-sm text-slate-300">Ascenso a Segunda Division</p>
                </div>
              </article>
              <article className="flex items-center gap-4 p-4 rounded-xl border border-orange-500/30 bg-orange-500/10">
                <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-400/40 flex items-center justify-center">
                  <Medal size={18} className="text-orange-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-200">Posiciones 7-9</p>
                  <p className="text-sm text-slate-300">Ascenso a Tercera Division</p>
                </div>
              </article>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-200">Descensos y permanencia</div>
              <article className="flex items-center gap-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-200">Posiciones 10-12</p>
                  <p className="text-sm text-slate-300">Descenso a Cuarta Division</p>
                </div>
              </article>
              <article className="flex items-center gap-4 p-4 rounded-xl border border-slate-600/60 bg-slate-900/40">
                <div className="w-9 h-9 rounded-full bg-slate-700/60 border border-slate-500/40 flex items-center justify-center">
                  <PieChart size={18} className="text-slate-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">Fuera de zona</p>
                  <p className="text-sm text-slate-400">Sin ascenso ni descenso</p>
                </div>
              </article>
              <article className="flex items-start gap-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mt-1">
                  <TrendingUp size={18} className="text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-200">Desempate</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Orden por puntos, diferencia de gol, goles a favor y luego orden base de la zona.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Zones;
