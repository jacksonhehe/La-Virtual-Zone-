import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, BarChart4, Star, Medal, AlertTriangle, PieChart } from 'lucide-react';
import { zonesData, getAllZoneStandings, getPositionColor, getZoneName, type ZoneStanding } from '../data/zonesData';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';

type ZoneStandingWithPosition = ZoneStanding & { position: number };

interface ZonesProps {
  className?: string;
}

const Zones = ({ className = '' }: ZonesProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasRole } = useAuthStore();
  const { clubs } = useDataStore();

  // Obtener zona activa desde query params, default a 'A'
  const activeZone = searchParams.get('zona') || 'A';

  // Cambiar zona activa
  const setActiveZone = (zone: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('zona', zone);
    setSearchParams(newParams);
  };


  // Obtener standings de todas las zonas y actualizarlos con datos actuales de clubes
  const allStandings = useMemo(() => {
    const standings = getAllZoneStandings();

    // Actualizar cada zona con datos actuales de clubes
    Object.keys(standings).forEach(zoneKey => {
      standings[zoneKey] = standings[zoneKey].map(team => {
        // Buscar el club actual por ID para obtener nombre y logo actualizados
        const currentClub = clubs.find(c => c.id === team.id);
        if (currentClub) {
          return {
            ...team,
            nombre: currentClub.name,
            escudoUrl: currentClub.logo
          };
        }
        return team;
      });
    });

    return standings;
  }, [clubs]);

  // Datos de la zona activa
  const activeZoneStandings: ZoneStandingWithPosition[] = allStandings[activeZone] || [];

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
    <div className={`min-h-screen bg-slate-950 ${className}`}>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header simplificado */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 shadow-lg">
              <Trophy className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                Zonas de Competición
              </h1>
            </div>
          </div>
          <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
            Clasificaciones y standings por zonas de la Liga Master
          </p>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => navigate('/liga-master')}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <ArrowLeft size={18} />
              Volver al Dashboard
            </button>
            <span className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold rounded-full shadow-lg">
              4 LIGAS ACTIVAS
            </span>
          </div>
        </div>

        {/* Estadísticas rápidas simplificadas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:scale-105">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {Object.keys(zonesData).length}
            </div>
            <div className="text-sm text-slate-400 font-medium">Zonas Totales</div>
          </div>
          <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:scale-105">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {Object.values(zonesData).reduce((total, zone) => total + zone.length, 0)}
            </div>
            <div className="text-sm text-slate-400 font-medium">Equipos en Zonas</div>
          </div>
          <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:scale-105">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {Math.max(...Object.values(allStandings).map(zone => zone.length))}
            </div>
            <div className="text-sm text-slate-400 font-medium">Equipos por Zona</div>
          </div>
          <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:scale-105">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {Object.values(allStandings).reduce((total, zone) => total + zone[0]?.pts || 0, 0)}
            </div>
            <div className="text-sm text-slate-400 font-medium">Puntos Máximos</div>
          </div>
        </div>

        {/* Tabs de zonas simplificadas */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-slate-800/50 rounded-xl border border-slate-700/50 p-2 backdrop-blur-sm">
            {['A', 'B', 'C', 'D'].map((zone) => {
              const zoneStandings = allStandings[zone] || [];
              const leader = zoneStandings[0];
              const isActive = activeZone === zone;

              return (
                <button
                  key={zone}
                  onClick={() => setActiveZone(zone)}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-105'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg">Liga {zone}</span>
                    {leader && (
                      <span className="text-xs opacity-80 font-normal">{leader.pts} pts</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estadísticas de zona simplificadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:scale-105">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <Trophy size={24} className="text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {activeZoneStandings[0]?.pts || 0}
            </div>
            <div className="text-sm text-slate-400 font-medium">Líder: {activeZoneStandings[0]?.nombre || 'N/A'}</div>
          </div>

          <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:scale-105">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <TrendingUp size={24} className="text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {activeZoneStandings.reduce((sum, team) => sum + team.gf, 0)}
            </div>
            <div className="text-sm text-slate-400 font-medium">Goles Totales</div>
          </div>

          <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:scale-105">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
              <BarChart4 size={24} className="text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {activeZoneStandings.length}
            </div>
            <div className="text-sm text-slate-400 font-medium">Equipos</div>
          </div>
        </div>

        {/* Tabla de clasificaciones simplificada */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 mb-10 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-2xl flex items-center justify-center border border-green-500/30 shadow-lg">
                <span className="text-3xl font-bold text-green-400">{activeZone}</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {getZoneName(activeZone)}
                </h2>
                <p className="text-slate-400 text-base">
                  Clasificación actualizada • {activeZoneStandings.length} equipos
                </p>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold rounded-full shadow-lg">
                EN VIVO
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-700 border-b border-slate-600">
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
                  <tr key={team.id} className="hover:bg-slate-700/50 border-b border-slate-600/50 transition-all duration-200 hover:shadow-md">
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getPositionBadgeColor(team.position)}`}>
                        {team.position}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={team.escudoUrl}
                          alt={team.nombre}
                          className="w-8 h-8 rounded object-cover"
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
                      <span className={`font-medium px-2 py-1 rounded ${
                        team.dg > 0
                          ? 'text-green-400 bg-green-500/10'
                          : team.dg < 0
                          ? 'text-red-400 bg-red-500/10'
                          : 'text-slate-400 bg-slate-500/10'
                      }`}>
                        {team.dg > 0 ? '+' : ''}{team.dg}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-white font-medium">
                          {team.porcentaje.toFixed(1)}%
                        </span>
                        <div className="w-12 h-1 bg-slate-600 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${Math.min(team.porcentaje, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sistema de ascensos y descensos simplificado */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 mt-10 shadow-xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 shadow-lg">
              <BarChart4 size={24} className="text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-3">Sistema de Ascensos y Descensos</h3>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold rounded-full shadow-lg">
                OFICIAL
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-green-400 flex items-center gap-3">
                <TrendingUp size={20} />
                Posiciones de Ascenso
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-6 bg-slate-700/50 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 hover:shadow-lg hover:scale-102">
                  <div className="w-8 h-8 rounded-full bg-green-500 shadow-lg"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-green-300 text-lg">Posiciones 1-3</div>
                    <div className="text-sm text-slate-400">Ascenso directo a Primera División</div>
                  </div>
                  <Trophy className="w-7 h-7 text-yellow-400" />
                </div>

                <div className="flex items-center gap-4 p-6 bg-slate-700/50 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 hover:shadow-lg hover:scale-102">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 shadow-lg"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-cyan-300 text-lg">Posiciones 4-6</div>
                    <div className="text-sm text-slate-400">Ascenso a Segunda División</div>
                  </div>
                  <Star className="w-7 h-7 text-cyan-400 fill-cyan-400" />
                </div>

                <div className="flex items-center gap-4 p-6 bg-slate-700/50 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 hover:shadow-lg hover:scale-102">
                  <div className="w-8 h-8 rounded-full bg-orange-500 shadow-lg"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-orange-300 text-lg">Posiciones 7-9</div>
                    <div className="text-sm text-slate-400">Ascenso a Tercera División</div>
                  </div>
                  <Medal className="w-7 h-7 text-orange-400" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-red-400 flex items-center gap-3">
                <TrendingUp size={20} className="rotate-180" />
                Posiciones de Descenso
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-6 bg-slate-700/50 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 hover:shadow-lg hover:scale-102">
                  <div className="w-8 h-8 rounded-full bg-red-500 shadow-lg"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-red-300 text-lg">Posiciones 10-12</div>
                    <div className="text-sm text-slate-400">Descenso a Cuarta División</div>
                  </div>
                  <AlertTriangle className="w-7 h-7 text-red-400" />
                </div>

                <div className="flex items-center gap-4 p-6 bg-slate-700/50 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 hover:shadow-lg hover:scale-102">
                  <div className="w-8 h-8 rounded-full bg-slate-500 shadow-lg"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-300 text-lg">Fuera de zona</div>
                    <div className="text-sm text-slate-400">Sin ascenso ni descenso</div>
                  </div>
                  <PieChart className="w-7 h-7 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-700/50 rounded-xl border border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-blue-400 rounded-full mt-3 shadow-lg"></div>
              <div>
                <div className="font-semibold text-blue-300 mb-2 text-lg">Información del Sistema</div>
                <div className="text-slate-400 leading-relaxed">
                  Los equipos se ordenan por puntos, diferencia de goles, goles a favor y nombre del club.
                  El porcentaje se calcula basado en el rendimiento total de puntos posibles.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Zones;
