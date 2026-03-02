import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, DollarSign } from 'lucide-react';

const valuationRows = [
  { rating: 72, price: '€ 20 M', salary: '€ 1 M', release: '€ 8 M' },
  { rating: 73, price: '€ 20 M', salary: '€ 1 M', release: '€ 8 M' },
  { rating: 74, price: '€ 20 M', salary: '€ 2 M', release: '€ 8 M' },
  { rating: 75, price: '€ 20 M', salary: '€ 2 M', release: '€ 8 M' },
  { rating: 76, price: '€ 32 M', salary: '€ 4 M', release: '€ 12 M' },
  { rating: 77, price: '€ 36 M', salary: '€ 4 M', release: '€ 14 M' },
  { rating: 78, price: '€ 50 M', salary: '€ 4 M', release: '€ 18 M' },
  { rating: 79, price: '€ 50 M', salary: '€ 4 M', release: '€ 21 M' },
  { rating: 80, price: '€ 59 M', salary: '€ 5 M', release: '€ 22 M' },
  { rating: 81, price: '€ 83 M', salary: '€ 10 M', release: '€ 26 M' },
  { rating: 82, price: '€ 92 M', salary: '€ 16 M', release: '€ 30 M' },
  { rating: 83, price: '€ 116 M', salary: '€ 20 M', release: '€ 38 M' },
  { rating: 84, price: '€ 140 M', salary: '€ 24 M', release: '€ 42 M' },
  { rating: 85, price: '€ 164 M', salary: '€ 26 M', release: '€ 52 M' },
  { rating: 86, price: '€ 210 M', salary: '€ 30 M', release: '€ 63 M' },
  { rating: 87, price: '€ 270 M', salary: '€ 35 M', release: '€ 84 M' },
  { rating: 88, price: '€ 300 M', salary: '€ 40 M', release: '€ 112 M' },
  { rating: 89, price: '€ 350 M', salary: '€ 42 M', release: '€ 146 M' },
  { rating: 90, price: '€ 500 M', salary: '€ 45 M', release: '€ 178 M' },
  { rating: 91, price: '€ 600 M', salary: '€ 46 M', release: '€ 207 M' },
  { rating: 92, price: '€ 800 M', salary: '€ 46 M', release: '€ 276 M' },
  { rating: 93, price: '€ 1000 M', salary: '€ 48 M', release: '€ 341 M' },
  { rating: 94, price: '€ 1200 M', salary: '€ 50 M', release: '€ 434 M' },
  { rating: 95, price: '€ 1356 M', salary: '€ 67 M', release: '€ 878 M' },
  { rating: 96, price: '€ 1600 M', salary: '€ 74 M', release: '€ 897 M' },
  { rating: 97, price: '€ 1818 M', salary: '€ 81 M', release: '€ 987 M' },
  { rating: 98, price: '€ 2018 M', salary: '€ 84 M', release: '€ 1048 M' },
  { rating: 99, price: '€ 2648 M', salary: '€ 132 M', release: '€ 1323 M' },
  { rating: 100, price: '€ 3248 M', salary: '€ 165 M', release: '€ 1564 M' },
  { rating: 101, price: '€ 4136 M', salary: '€ 206 M', release: '€ 2086 M' }
];

const bonusRows = [
  { competition: 'Liga Master', won: '€ 15 M', draw: '€ 12 M', lost: '€ 10 M', wonWo: '€ 15 M', lostWo: '€ 0' },
  { competition: 'Copa LVZ', won: '€ 15 M', draw: '€ 12 M', lost: '€ 15 M', wonWo: '€ 15 M', lostWo: '€ 0' }
];

const phasePrizeRows = [
  { phase: '8vos de final', prize: '€ 10 M', note: '' },
  { phase: '4tos de final', prize: '€ 15 M', note: '' },
  { phase: 'Semifinal', prize: '€ 20 M', note: '' },
  { phase: '3er puesto', prize: '€ 25 M', note: '(Bronce)' },
  { phase: 'Final', prize: '€ 30 M', note: '(Camp vs Sub)' },
  { phase: 'Ganar la final', prize: '€ 40 M', note: '(Campeon)' }
];

const MarketTables = () => {
  const getRatingBadgeClass = (rating: number) => {
    if (rating <= 84) return 'bg-yellow-400/90 text-slate-900 shadow-yellow-400/20';
    if (rating <= 95) return 'bg-emerald-400/90 text-slate-900 shadow-emerald-400/20';
    return 'bg-cyan-300/90 text-slate-900 shadow-cyan-300/20';
  };

  return (
    <div className="relative min-h-screen bg-dark overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_35%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.15),transparent_40%)]" />

      <div className="container relative mx-auto px-4 lg:px-6 py-8 max-w-6xl space-y-8">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs uppercase tracking-widest">
            Referencia oficial 2025
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wide text-lime-300">Tablas de Mercado</h1>
          <p className="text-slate-300 text-sm md:text-base">
            Valores base, bonos por partido y premios por fase para operar con reglas claras.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/55 backdrop-blur-sm overflow-hidden shadow-2xl shadow-slate-900/40">
          <div className="px-6 py-4 border-b border-lime-400/40 bg-slate-900/40 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-white font-bold uppercase tracking-wide">Valoracion - Precio - Sueldo - Liberar</h2>
            <span className="text-xs text-slate-400">Actualizado para temporada 2025</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-lime-300 border-b border-slate-700/80">
                  <th className="px-4 py-3 text-center">Valoracion</th>
                  <th className="px-4 py-3 text-center">Precio</th>
                  <th className="px-4 py-3 text-center">Sueldo</th>
                  <th className="px-4 py-3 text-center">Liberar</th>
                </tr>
              </thead>
              <tbody>
                {valuationRows.map((row) => (
                  <tr key={row.rating} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex min-w-[34px] justify-center px-2 py-1 rounded-md text-xs font-black shadow ${getRatingBadgeClass(row.rating)}`}>
                        {row.rating}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-emerald-300 font-semibold">{row.price}</td>
                    <td className="px-4 py-2.5 text-center text-lime-300 font-semibold">{row.salary}</td>
                    <td className="px-4 py-2.5 text-center text-rose-400 font-semibold">{row.release}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-center text-2xl md:text-3xl font-black uppercase tracking-wide text-lime-300">Bonos por Partido</h3>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/55 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-lime-300 border-b border-slate-700/80">
                    <th className="px-4 py-3 text-center">Competicion</th>
                    <th className="px-4 py-3 text-center">Ganado</th>
                    <th className="px-4 py-3 text-center">Empatado</th>
                    <th className="px-4 py-3 text-center">Perdido</th>
                    <th className="px-4 py-3 text-center">Ganado (WO)</th>
                    <th className="px-4 py-3 text-center">Perdido (WO)</th>
                  </tr>
                </thead>
                <tbody>
                  {bonusRows.map((row) => (
                    <tr key={row.competition} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-center text-white font-semibold">
                        <span className="inline-flex items-center gap-2">
                          {row.competition}
                          {row.competition === 'Liga Master' && <Trophy className="w-4 h-4 text-yellow-400" />}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-300 font-semibold">{row.won}</td>
                      <td className="px-4 py-3 text-center text-cyan-300 font-semibold">{row.draw}</td>
                      <td className="px-4 py-3 text-center text-rose-300 font-semibold">{row.lost}</td>
                      <td className="px-4 py-3 text-center text-emerald-300 font-semibold">{row.wonWo}</td>
                      <td className="px-4 py-3 text-center text-slate-400 font-semibold">{row.lostWo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-center text-2xl md:text-3xl font-black uppercase tracking-wide text-lime-300">Premios por Fase - Copa LVZ</h3>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/55 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-lime-300 border-b border-slate-700/80">
                    <th className="px-4 py-3 text-center">Fase</th>
                    <th className="px-4 py-3 text-center">Ganado</th>
                  </tr>
                </thead>
                <tbody>
                  {phasePrizeRows.map((row) => (
                    <tr key={row.phase} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <p className="text-cyan-300 font-semibold uppercase">{row.phase}</p>
                        {row.note && <p className="text-[11px] text-slate-400 uppercase">{row.note}</p>}
                      </td>
                      <td className="px-4 py-3 text-center text-lime-300 font-bold">{row.prize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="rounded-xl border border-slate-700/60 bg-slate-800/45 p-5">
            <div className="flex items-center gap-3 mb-3 text-slate-200">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              <h4 className="font-bold">Valoracion dinamica</h4>
            </div>
            <p className="text-sm text-slate-300">Los valores cambian con rendimiento y contexto de mercado.</p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-slate-800/45 p-5">
            <div className="flex items-center gap-3 mb-3 text-slate-200">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold">Bonos activos</h4>
            </div>
            <p className="text-sm text-slate-300">Los pagos se acreditan al cierre de jornada, incluyendo escenario WO.</p>
          </article>
          <article className="rounded-xl border border-slate-700/60 bg-slate-800/45 p-5">
            <div className="flex items-center gap-3 mb-3 text-slate-200">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h4 className="font-bold">Copa LVZ</h4>
            </div>
            <p className="text-sm text-slate-300">Premios por fase para reforzar estrategia en cada eliminatoria.</p>
          </article>
        </section>

        <div className="flex justify-center">
          <Link
            to="/liga-master"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-lime-400/40 bg-lime-400/10 text-lime-300 hover:bg-lime-400/20 transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MarketTables;

