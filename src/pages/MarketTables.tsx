import  { Link } from 'react-router-dom';
import { TrendingUp, Trophy, DollarSign, ArrowLeft } from 'lucide-react';

const MarketTables = () => {
  const getRatingColor = (rating: number) => {
    if (rating <= 75) return 'text-red-400';
    if (rating <= 85) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-6 py-10 max-w-6xl">
        {/* Header mejorado */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <TrendingUp className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Tablas de Mercado
            </h1>
          </div>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Referencias oficiales de valoración, precio, sueldo y liberación
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-16"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-blue-400 via-blue-400 to-transparent w-16"></div>
          </div>
        </div>

        {/* Tabla principal mejorada */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl mb-10">
          {/* Header de tabla mejorado */}
          <div className="bg-slate-700/50 px-8 py-5 border-b border-slate-600/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Tabla de Valoraciones</h2>
                <p className="text-slate-300 text-sm">Valores de mercado actualizados para la temporada 2025</p>
              </div>
              <span className="px-3 py-1.5 bg-emerald-600/90 text-white text-xs font-semibold rounded-lg shadow-sm">
                OFICIAL
              </span>
            </div>
          </div>

          {/* Contenido de tabla mejorado */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr className="text-slate-300 text-sm font-semibold uppercase tracking-wide">
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Valoración</th>
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Precio</th>
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Sueldo</th>
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Liberar</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['72', '€20 M', '€1 M', '€8 M'],
                  ['73', '€20 M', '€1 M', '€8 M'],
                  ['74', '€20 M', '€2 M', '€8 M'],
                  ['75', '€20 M', '€2 M', '€8 M'],
                  ['76', '€32 M', '€4 M', '€12 M'],
                  ['77', '€36 M', '€4 M', '€14 M'],
                  ['78', '€50 M', '€4 M', '€18 M'],
                  ['79', '€50 M', '€4 M', '€21 M'],
                  ['80', '€59 M', '€5 M', '€22 M'],
                  ['81', '€83 M', '€10 M', '€26 M'],
                  ['82', '€92 M', '€16 M', '€30 M'],
                  ['83', '€116 M', '€20 M', '€38 M'],
                  ['84', '€140 M', '€24 M', '€42 M'],
                  ['85', '€164 M', '€26 M', '€52 M'],
                  ['86', '€210 M', '€30 M', '€63 M'],
                  ['87', '€270 M', '€35 M', '€84 M'],
                  ['88', '€300 M', '€40 M', '€112 M'],
                  ['89', '€350 M', '€42 M', '€146 M'],
                  ['90', '€500 M', '€45 M', '€178 M'],
                  ['91', '€600 M', '€46 M', '€207 M'],
                  ['92', '€800 M', '€46 M', '€276 M'],
                  ['93', '€1000 M', '€48 M', '€341 M'],
                  ['94', '€1200 M', '€50 M', '€434 M'],
                  ['95', '€1356 M', '€67 M', '€878 M'],
                  ['96', '€1600 M', '€74 M', '€897 M'],
                  ['97', '€1818 M', '€81 M', '€987 M'],
                  ['98', '€2018 M', '€84 M', '€1048 M'],
                  ['99', '€2648 M', '€132 M', '€1323 M'],
                  ['100', '€3248 M', '€165 M', '€1564 M'],
                  ['101', '€4136 M', '€206 M', '€2086 M']
                ].map((row, idx) => {
                  const rating = parseInt(row[0], 10);
                  const colorClass = getRatingColor(rating);

                  return (
                    <tr key={idx} className="hover:bg-slate-700/20 transition-colors duration-200 border-b border-slate-700/30">
                      <td className="px-8 py-4 text-center">
                        <span className={`font-bold text-lg ${colorClass}`}>{row[0]}</span>
                      </td>
                      <td className="px-8 py-4 text-center font-sans font-black text-emerald-400">{row[1]}</td>
                      <td className="px-8 py-4 text-center font-sans font-black text-sky-400">{row[2]}</td>
                      <td className="px-8 py-4 text-center font-sans font-black text-amber-400">{row[3]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer mejorado */}
          <div className="bg-slate-700/30 px-8 py-4 border-t border-slate-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-slate-300 text-sm">72-75: Nivel Inicial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-slate-300 text-sm">76-85: Nivel Profesional</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-slate-300 text-sm">86-101: Nivel Élite</span>
                </div>
              </div>
              <span className="text-slate-400 text-xs font-medium">
                Temporada 2025
              </span>
            </div>
          </div>
        </div>

        {/* Bonos por Partido mejorados */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl mb-10">
          <div className="bg-slate-700/50 px-8 py-5 border-b border-slate-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Trophy className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Bonos por Partido</h2>
                  <p className="text-slate-300 text-sm">Liga Master y Copa LVZ - Temporada 2025</p>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-emerald-600/90 text-white text-xs font-semibold rounded-lg shadow-sm">
                ACTIVOS
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr className="text-slate-300 text-sm font-semibold uppercase tracking-wide">
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Competición</th>
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Ganado</th>
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Empatado</th>
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Perdido</th>
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Ganado (WO)</th>
                  <th className="px-8 py-4 text-center border-b border-slate-600/30">Perdido (WO)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Liga Master', '€15 M', '€12 M', '€10 M', '€15 M', '€0'],
                  ['Copa LVZ', '€15 M', '€12 M', '€15 M', '€15 M', '€0']
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/20 transition-colors duration-200 border-b border-slate-700/30">
                    <td className="px-8 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-green-400">{row[0]}</span>
                        {row[0] === 'Liga Master' && <Trophy className="w-4 h-4 text-yellow-400" />}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center font-sans font-black text-emerald-400">{row[1]}</td>
                    <td className="px-8 py-4 text-center font-sans font-black text-sky-400">{row[2]}</td>
                    <td className="px-8 py-4 text-center font-sans font-black text-red-400">{row[3]}</td>
                    <td className="px-8 py-4 text-center font-sans font-black text-emerald-400">{row[4]}</td>
                    <td className="px-8 py-4 text-center font-sans font-black text-slate-500">{row[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-700/30 px-8 py-4 border-t border-slate-600/30">
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-slate-400">WO = Walk Over (Victoria por incomparecencia)</span>
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
              <span className="text-slate-400">Bonos aplican desde la fecha de publicación</span>
            </div>
          </div>
        </div>

        {/* Información adicional mejorada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-white">Valoración Dinámica</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Los valores se actualizan semanalmente según rendimiento y mercado de transferencias.
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-white">Bonos Activos</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Los bonos se acreditan automáticamente al finalizar cada jornada de competición.
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-white">Competiciones</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sistema de puntos actualizado para Liga Master y Copa LVZ 2025.
            </p>
          </div>
        </div>

        {/* Botón volver mejorado */}
        <div className="flex justify-center">
          <Link
            to="/liga-master"
            className="group inline-flex items-center gap-4 px-8 py-4 rounded-xl bg-slate-800/60 backdrop-blur-sm hover:bg-slate-700/80 border border-slate-600/50 hover:border-slate-500/70 text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold">Volver al Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MarketTables;


