import { useParams, Link, useLocation } from 'react-router-dom';
import { CreditCard, ChevronLeft, ArrowUp, ArrowDown, DollarSign, ShoppingBag, Clipboard } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate } from '../../utils/format';

const ClubFinances = () => {
  const { clubName } = useParams<{ clubName: string }>();
  const location = useLocation();
  const { clubs, transfers, players } = useDataStore() as any;

  const club = clubs.find((c: any) => c.name.toLowerCase().replace(/\s+/g, '-') === clubName);
  const source = new URLSearchParams(location.search).get('from');
  const cameFromDtDashboard = source === 'dt-dashboard';
  const backPath = cameFromDtDashboard ? '/liga-master' : `/liga-master/club/${clubName}`;
  const backLabel = cameFromDtDashboard ? 'Volver al Dashboard del DT' : 'Volver al perfil del club';

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Club no encontrado</h2>
        <p className="text-gray-400 mb-8">El club que buscas no existe o fue eliminado.</p>
        <Link to="/liga-master" className="btn-primary">
          Volver a Liga Master
        </Link>
      </div>
    );
  }

  const clubPlayers = players.filter((p: any) => p.clubId === club.id);
  const clubTransfers = transfers.filter((t: any) => t.fromClub === club.name || t.toClub === club.name);

  const squadSize = clubPlayers.length;
  const averageOverall = squadSize > 0 ? Math.round(clubPlayers.reduce((sum: number, p: any) => sum + p.overall, 0) / squadSize) : 0;
  const totalPlayerSalaries = clubPlayers.reduce((sum: number, p: any) => sum + (p.contract?.salary ?? 0), 0);

  const income = clubTransfers
    .filter((t: any) => t.fromClub === club.name)
    .reduce((sum: number, t: any) => sum + (t.fee ?? t.value ?? 0), 0);

  const expenses = clubTransfers
    .filter((t: any) => t.toClub === club.name)
    .reduce((sum: number, t: any) => sum + (t.fee ?? t.value ?? 0), 0);

  const totalIncome = income;
  const totalExpenses = expenses + totalPlayerSalaries;
  const totalBalance = totalIncome - totalExpenses;
  const netWorth = club.budget + totalBalance;

  const salaryPlayers = clubPlayers
    .filter((p: any) => p.contract?.salary && p.contract.salary > 0)
    .sort((a: any, b: any) => (b.contract?.salary || 0) - (a.contract?.salary || 0))
    .slice(0, 10);

  const normalizeText = (value: string) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const getTransferPlayerImage = (transfer: any) => {
    if (transfer?.playerImage) return transfer.playerImage;

    const playerId = transfer?.playerId || transfer?.player_id;
    if (playerId) {
      const playerById = players.find((p: any) => p.id === playerId);
      if (playerById?.image) return playerById.image;
    }

    const playerName = (transfer?.playerName || transfer?.player || '').trim();
    if (playerName) {
      const playerByName =
        players.find((p: any) => String(p.name || '').trim() === playerName) ||
        players.find((p: any) => normalizeText(p.name) === normalizeText(playerName));
      if (playerByName?.image) return playerByName.image;
    }

    return '/default.png';
  };

  return (
    <div>
      <PageHeader
        title={`Finanzas de ${club.name}`}
        subtitle="Traspasos, salarios y balance economico del club."
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to={backPath}
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>{backLabel}</span>
          </Link>
        </div>

        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4 border-2 border-primary/30 shadow-xl bg-slate-800/30 p-2">
              <img src={club.logo || club.shield} alt={club.name} className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{club.name}</h2>
              <p className="text-gray-400 text-lg">
                Temporada 2025 • {squadSize} jugadores • Media: {averageOverall} • Presupuesto: {formatCurrency(club.budget)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 border border-slate-700/50 transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CreditCard size={28} className="text-primary mb-3" />
              <p className="text-gray-400 text-sm font-medium">Salarios totales</p>
              <p className="text-2xl font-bold text-white text-center">{formatCurrency(totalPlayerSalaries)}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 border border-slate-700/50 transition-all duration-200 hover:shadow-lg hover:scale-105">
              <DollarSign size={28} className="text-green-400 mb-3" />
              <p className="text-gray-400 text-sm font-medium">Ingresos</p>
              <p className="text-2xl font-bold text-green-400">+{formatCurrency(totalIncome)}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 border border-slate-700/50 transition-all duration-200 hover:shadow-lg hover:scale-105">
              <ShoppingBag size={28} className="text-red-400 mb-3" />
              <p className="text-gray-400 text-sm font-medium">Gastos</p>
              <p className="text-2xl font-bold text-red-400">-{formatCurrency(totalExpenses)}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 border border-slate-700/50 transition-all duration-200 hover:shadow-lg hover:scale-105">
              <Clipboard size={28} className="text-primary mb-3" />
              <p className="text-gray-400 text-sm font-medium">Balance neto</p>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalBalance >= 0 ? '+' : ''}{formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl mb-10 overflow-hidden">
          <div className="p-6 bg-slate-800/30 border-b border-slate-700/50">
            <h3 className="font-bold text-2xl flex items-center text-white">
              <ShoppingBag size={24} className="mr-3 text-primary" />
              Historial de traspasos
            </h3>
            <p className="text-sm text-slate-400 mt-2">Temporada 2025</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50 text-xs uppercase text-slate-300 border-b border-slate-600/50 font-semibold">
                  <th className="px-6 py-4 text-left">Jugador</th>
                  <th className="px-6 py-4 text-center">Tipo</th>
                  <th className="px-6 py-4 text-center">Origen</th>
                  <th className="px-6 py-4 text-center">Destino</th>
                  <th className="px-6 py-4 text-center">Valor</th>
                  <th className="px-6 py-4 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {clubTransfers.map((transfer: any) => {
                  const isIncoming = transfer.toClub === club.name;
                  const playerName = (transfer.playerName || transfer.player || '').trim();
                  const playerImage = getTransferPlayerImage(transfer);

                  return (
                    <tr key={transfer.id} className="border-b border-slate-600/50 hover:bg-slate-700/30 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-4 bg-dark-lighter border border-slate-600">
                            <img
                              src={playerImage}
                              alt={playerName || 'Jugador'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/default.png';
                              }}
                            />
                          </div>
                          <span className="font-medium text-white">{playerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isIncoming ? (
                          <span className="inline-flex items-center text-green-400 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">
                            <ArrowDown size={14} className="mr-2" /> Entrada
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-400 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
                            <ArrowUp size={14} className="mr-2" /> Salida
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-white font-medium">{transfer.fromClub}</td>
                      <td className="px-6 py-4 text-center text-white font-medium">{transfer.toClub}</td>
                      <td className="px-6 py-4 text-center font-bold">
                        <span className={`${isIncoming ? 'text-red-400' : 'text-green-400'}`}>
                          {isIncoming ? '-' : '+'}{formatCurrency(transfer.fee ?? transfer.value ?? 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-300 font-medium">{formatDate(transfer.date)}</td>
                    </tr>
                  );
                })}

                {clubTransfers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No hay traspasos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {clubPlayers.length > 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl mb-10 overflow-hidden">
            <div className="p-6 bg-slate-800/30 border-b border-slate-700/50">
              <h3 className="font-bold text-2xl flex items-center text-white">
                <CreditCard size={24} className="mr-3 text-primary" />
                Costos salariales por jugador
              </h3>
              <p className="text-sm text-slate-400 mt-2">Top 10 jugadores por salario</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50 text-xs uppercase text-slate-300 border-b border-slate-600/50 font-semibold">
                    <th className="px-6 py-4 text-left">Jugador</th>
                    <th className="px-6 py-4 text-center">Pos</th>
                    <th className="px-6 py-4 text-center">Media</th>
                    <th className="px-6 py-4 text-center">Salario</th>
                    <th className="px-6 py-4 text-center">% Presupuesto</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryPlayers.map((player: any) => {
                    const salary = player.contract?.salary || 0;
                    const salaryPercentage = Math.round((salary / club.budget) * 100);

                    return (
                      <tr key={player.id} className="border-b border-slate-600/50 hover:bg-slate-700/30 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden mr-4 bg-dark-lighter border border-slate-600">
                              <img
                                src={player.image || '/default.png'}
                                alt={player.name}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/default.png';
                                }}
                              />
                            </div>
                            <span className="font-medium text-white">{player.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-300">{player.position}</td>
                        <td className="px-6 py-4 text-center text-gray-300">{player.overall}</td>
                        <td className="px-6 py-4 text-center font-bold text-white">{formatCurrency(salary)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-bold px-2 py-1 rounded ${
                            salaryPercentage > 10 ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                            salaryPercentage > 5 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                            'bg-green-500/20 text-green-400 border border-green-500/20'
                          }`}>
                            {salaryPercentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {salaryPlayers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No hay jugadores con salarios registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl p-6 md:p-8">
          <h3 className="font-bold text-2xl text-white mb-2">Proyeccion financiera</h3>
          <p className="text-sm text-slate-400 mb-6">Proyeccion temporada 2025-2026</p>

          <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 mb-3">
            <div
              className={`h-full transition-all duration-700 ${
                netWorth > club.budget * 1.2 ? 'bg-green-500' :
                netWorth > club.budget * 0.8 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (netWorth / (club.budget * 1.5)) * 100)}%` }}
            />
          </div>

          <div className="mb-6 text-sm text-gray-300">
            Salud financiera:{' '}
            <span className={`font-semibold ${
              netWorth > club.budget * 1.2 ? 'text-green-400' :
              netWorth > club.budget * 0.8 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {netWorth > club.budget * 1.2 ? 'Excelente' : netWorth > club.budget * 0.8 ? 'Estable' : 'Requiere atencion'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-white mb-3">Estrategias recomendadas</h4>
              <div className="space-y-2 text-sm">
                {averageOverall < 75 && <p className="text-gray-300">- Prioridad: reforzar la plantilla con mayor calidad.</p>}
                {totalPlayerSalaries > club.budget * 0.8 && <p className="text-gray-300">- Costo salarial alto: considera ventas selectivas.</p>}
                {totalBalance < 0 && <p className="text-gray-300">- Deficit financiero: reduce gastos o aumenta ingresos.</p>}
                <p className="text-gray-300">- Monitorea el mercado para detectar oportunidades.</p>
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
              <h4 className="font-bold text-white mb-2">Valor neto del club</h4>
              <div className={`text-3xl font-bold mb-3 ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netWorth)}
              </div>
              <p className="text-gray-300 text-sm mb-4">Presupuesto + balance acumulado</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-gray-400 block mb-1">Presupuesto:</span>
                  <div className="font-bold text-white">{formatCurrency(club.budget)}</div>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-gray-400 block mb-1">Balance:</span>
                  <div className={`font-bold ${totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalBalance >= 0 ? '+' : ''}{formatCurrency(totalBalance)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubFinances;



