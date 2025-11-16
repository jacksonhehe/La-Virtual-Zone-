import  { useParams, Link } from 'react-router-dom';
import { CreditCard, ChevronLeft, ArrowUp, ArrowDown, DollarSign, ShoppingBag, Clipboard } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDataStore } from '../store/dataStore';
import { formatCurrency, formatDate } from '../utils/format';
const ClubFinances = () => {
  const { clubName } = useParams<{ clubName: string }>();
  const { clubs, transfers, players } = useDataStore();
  
  // Find club by slug
  const club = clubs.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === clubName);

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Club no encontrado</h2>
        <p className="text-gray-400 mb-8">El club que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/liga-master" className="btn-primary">
          Volver a Liga Master
        </Link>
      </div>
    );
  }

  // Get club players and transfers
  const clubPlayers = players.filter(p => p.clubId === club.id);
  const clubTransfers = transfers.filter(t => t.fromClub === club.name || t.toClub === club.name);
  
  // Calculate squad statistics
  const squadSize = clubPlayers.length;
  const averageOverall = squadSize > 0 ? Math.round(clubPlayers.reduce((sum, p) => sum + p.overall, 0) / squadSize) : 0;
  const squadMarketValue = clubPlayers.reduce((sum, p) => sum + ((p as any).transferValue ?? (p as any).value ?? 0), 0);
  const totalPlayerSalaries = clubPlayers.reduce((sum, p) => sum + ((p as any).contract?.salary ?? 0), 0);

  // Calculate income, expenses and balance
  const income = clubTransfers
    .filter(t => t.fromClub === club.name)
    .reduce((sum, t) => sum + (((t as any).fee ?? (t as any).value ?? 0)), 0);

  const expenses = clubTransfers
    .filter(t => t.toClub === club.name)
    .reduce((sum, t) => sum + (((t as any).fee ?? (t as any).value ?? 0)), 0);

  // Updated financial calculations
  const totalIncome = income;
  const totalExpenses = expenses + totalPlayerSalaries;
  const totalBalance = totalIncome - totalExpenses;
  const netWorth = club.budget + totalBalance;
  
  return (
    <div>
      <PageHeader
        title={`Finanzas de ${club.name}`}
        subtitle="Traspasos, salarios y balance económico del club."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to={`/liga-master/club/${clubName}`}
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver al perfil del club</span>
          </Link>
        </div>
        
        <div className="mb-10">
          <div className="flex items-center mb-8">
            <div className="relative mr-6">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-30"></div>
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-700/50 p-2 border border-primary/20 shadow-lg">
                <img src={(club as any).logo || (club as any).shield} alt={club.name} className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{club.name}</h2>
              <p className="text-gray-300 text-lg">
                Temporada 2025 • {squadSize} jugadores • Media: {averageOverall} • Presupuesto: {formatCurrency(club.budget)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Squad Information */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center text-white group-hover:text-blue-100 transition-colors duration-300">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/30 transition-colors duration-300 mr-3">
                    <CreditCard size={20} className="text-blue-400" />
                  </div>
                  Plantilla
                </h3>
                <span className="text-sm text-blue-400 bg-gradient-to-r from-blue-500/20 to-blue-400/10 px-3 py-1 rounded-lg border border-blue-500/20">
                  {squadSize} jugadores
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Media general</span>
                  <span className="font-medium text-white">
                    {averageOverall}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Valor de mercado</span>
                  <span className="font-medium text-white">
                    {formatCurrency(squadMarketValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-600 pt-2 p-2 bg-gray-700/20 rounded-lg">
                  <span className="font-medium text-white">Salarios totales</span>
                  <span className="font-bold text-blue-400">
                    {formatCurrency(totalPlayerSalaries)}
                  </span>
                </div>
              </div>
            </div>

            {/* Income */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:scale-[1.02] backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center text-white group-hover:text-green-100 transition-colors duration-300">
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg border border-green-500/20 group-hover:bg-green-500/30 transition-colors duration-300 mr-3">
                    <DollarSign size={20} className="text-green-400" />
                  </div>
                  Ingresos
                </h3>
                <span className="text-sm text-green-400 bg-gradient-to-r from-green-500/20 to-green-400/10 px-3 py-1 rounded-lg border border-green-500/20">
                  +{formatCurrency(totalIncome)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Traspasos</span>
                  <span className="font-medium text-white">
                    {formatCurrency(income)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-600 pt-2 p-2 bg-gray-700/20 rounded-lg">
                  <span className="font-medium text-white">Total</span>
                  <span className="font-bold text-green-400">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 hover:scale-[1.02] backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center text-white group-hover:text-red-100 transition-colors duration-300">
                  <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-lg border border-red-500/20 group-hover:bg-red-500/30 transition-colors duration-300 mr-3">
                    <ShoppingBag size={20} className="text-red-400" />
                  </div>
                  Gastos
                </h3>
                <span className="text-sm text-red-400 bg-gradient-to-r from-red-500/20 to-red-400/10 px-3 py-1 rounded-lg border border-red-500/20">
                  -{formatCurrency(totalExpenses)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Fichajes</span>
                  <span className="font-medium text-white">
                    {formatCurrency(expenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Salarios plantilla</span>
                  <span className="font-medium text-white">
                    {formatCurrency(totalPlayerSalaries)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-600 pt-2 p-2 bg-gray-700/20 rounded-lg">
                  <span className="font-medium text-white">Total</span>
                  <span className="font-bold text-red-400">
                    -{formatCurrency(totalExpenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center text-white group-hover:text-primary/90 transition-colors duration-300">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/20 group-hover:bg-primary/30 transition-colors duration-300 mr-3">
                    <Clipboard size={20} className="text-primary" />
                  </div>
                  Balance
                </h3>
                <span className={`text-sm ${totalBalance >= 0 ? 'text-green-400 bg-gradient-to-r from-green-500/20 to-green-400/10 border-green-500/20' : 'text-red-400 bg-gradient-to-r from-red-500/20 to-red-400/10 border-red-500/20'} px-3 py-1 rounded-lg border`}>
                  {totalBalance >= 0 ? '+' : ''}{formatCurrency(totalBalance)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Total ingresos</span>
                  <span className="font-medium text-green-400">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Total gastos</span>
                  <span className="font-medium text-red-400">
                    -{formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-600 pt-2 p-2 bg-gray-700/20 rounded-lg">
                  <span className="font-medium text-white">Balance neto</span>
                  <span className={`font-bold ${totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalBalance >= 0 ? '+' : ''}{formatCurrency(totalBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">Valor neto</span>
                  <span className={`font-bold ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(netWorth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Historial de traspasos</h3>

          <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl border border-gray-700/50 shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-700 to-gray-750 border-b border-gray-600">
              <h4 className="font-bold text-white text-lg">Temporada 2025</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/50 text-xs uppercase text-gray-300 border-b border-gray-600">
                    <th className="px-6 py-4 text-left font-semibold">Jugador</th>
                    <th className="px-6 py-4 text-center font-semibold">Tipo</th>
                    <th className="px-6 py-4 text-center font-semibold">Origen</th>
                    <th className="px-6 py-4 text-center font-semibold">Destino</th>
                    <th className="px-6 py-4 text-center font-semibold">Valor</th>
                    <th className="px-6 py-4 text-center font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {clubTransfers.map(transfer => {
                    const isIncoming = transfer.toClub === club.name;
                    const playerName = ((transfer as any).playerName || (transfer as any).player || "").trim();
                    const nameParts = playerName.split(/\s+/).filter(Boolean);
                    const initials = nameParts
                      .slice(0, 2)
                      .map(part => part[0]?.toUpperCase() ?? '')
                      .join('') || '?';
                    return (
                      <tr key={transfer.id} className="border-b border-gray-600/50 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/30 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mr-4 border border-gray-500">
                              <span className="text-sm font-bold text-white">
                                {initials}
                              </span>
                            </div>
                            <span className="font-medium text-white">{playerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isIncoming ? (
                            <span className="inline-flex items-center text-green-400 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">
                              <ArrowDown size={14} className="mr-2" />
                              Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-400 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
                              <ArrowUp size={14} className="mr-2" />
                              Salida
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-white font-medium">{transfer.fromClub}</td>
                        <td className="px-6 py-4 text-center text-white font-medium">{transfer.toClub}</td>
                        <td className="px-6 py-4 text-center font-bold">
                          <span className={`text-lg ${isIncoming ? 'text-red-400' : 'text-green-400'}`}>
                            {isIncoming ? '-' : '+'}{formatCurrency(((transfer as any).fee ?? (transfer as any).value ?? 0))}
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
        </div>

        {clubPlayers.length > 0 && (
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Costos salariales por jugador</h3>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl border border-gray-700/50 shadow-xl backdrop-blur-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gray-700 to-gray-750 border-b border-gray-600">
                <h4 className="font-bold text-white text-lg">Top 10 jugadores por salario</h4>
                <p className="text-gray-300 text-sm">Costos salariales más altos de la plantilla</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700/50 text-xs uppercase text-gray-300 border-b border-gray-600 font-semibold">
                      <th className="px-6 py-4 text-left">Jugador</th>
                      <th className="px-6 py-4 text-center">Pos</th>
                      <th className="px-6 py-4 text-center">Media</th>
                      <th className="px-6 py-4 text-center">Salario</th>
                      <th className="px-6 py-4 text-center">% Presupuesto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubPlayers
                      .filter(p => (p as any).contract?.salary && (p as any).contract.salary > 0)
                      .sort((a, b) => ((b as any).contract?.salary || 0) - ((a as any).contract?.salary || 0))
                      .slice(0, 10)
                      .map((player: any) => {
                        const salary = player.contract?.salary || 0;
                        const salaryPercentage = Math.round((salary / club.budget) * 100);

                        return (
                          <tr key={player.id} className="border-b border-gray-600/50 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/30 transition-all duration-200">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full overflow-hidden mr-4 bg-gray-600 border border-gray-500">
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
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                                player.position === 'PT' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                                player.position === 'DEC' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                player.position === 'CD' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                player.position === 'SD' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                ['LI', 'LD'].includes(player.position) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                ['MCD', 'MC', 'MO'].includes(player.position) ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
                                'bg-red-500/20 text-red-400 border border-red-500/20'
                              }`}>
                                {player.position}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                                player.overall >= 85 ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
                                player.overall >= 80 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                player.overall >= 75 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                                'bg-gray-500/20 text-gray-400 border border-gray-500/20'
                              }`}>
                                {player.overall}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-white text-lg">
                              {formatCurrency(salary)}
                            </td>
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

                    {clubPlayers.filter(p => (p as any).contract?.salary && (p as any).contract.salary > 0).length === 0 && (
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
          </div>
        )}

        <div>
          <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Proyección financiera</h3>

          <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-8 border border-gray-700/50 shadow-xl backdrop-blur-sm">
            <div className="mb-8">
              <h4 className="font-bold mb-4 text-white text-lg">Proyección Temporada 2025-2026</h4>
              <div className="h-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full overflow-hidden border border-gray-600">
                <div
                  className={`h-full transition-all duration-700 ${
                    netWorth > club.budget * 1.2 ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-lg shadow-green-500/20' :
                    netWorth > club.budget * 0.8 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-500/20' :
                    'bg-gradient-to-r from-red-500 to-red-400 shadow-lg shadow-red-500/20'
                  }`}
                  style={{ width: `${Math.min(100, (netWorth / (club.budget * 1.5)) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3 text-sm font-medium">
                <span className="text-red-400 flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                  Crítico
                </span>
                <span className="text-yellow-400 flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  Estable
                </span>
                <span className="text-green-400 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Excelente
                </span>
              </div>
              <div className="mt-4 text-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <span className="text-gray-300 font-medium">
                  Salud financiera: <span className={`font-bold ${
                    netWorth > club.budget * 1.2 ? 'text-green-400' :
                    netWorth > club.budget * 0.8 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {netWorth > club.budget * 1.2 ? 'Excelente' : netWorth > club.budget * 0.8 ? 'Estable' : 'Requiere atención'}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-4 text-white text-lg">Estrategias recomendadas</h4>
                <div className="space-y-3">
                  {averageOverall < 75 && (
                    <div className="flex items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="w-3 h-3 bg-red-400 rounded-full mr-3 flex-shrink-0"></span>
                      <span className="text-gray-300 text-sm">Prioridad: Refuerza la plantilla con jugadores de calidad para mejorar el rendimiento.</span>
                    </div>
                  )}
                  {totalPlayerSalaries > club.budget * 0.8 && (
                    <div className="flex items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="w-3 h-3 bg-red-400 rounded-full mr-3 flex-shrink-0"></span>
                      <span className="text-gray-300 text-sm">Costo salarial alto ({Math.round((totalPlayerSalaries / club.budget) * 100)}%). Considera ventas selectivas.</span>
                    </div>
                  )}
                  {totalBalance < 0 && (
                    <div className="flex items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="w-3 h-3 bg-red-400 rounded-full mr-3 flex-shrink-0"></span>
                      <span className="text-gray-300 text-sm">Déficit financiero. Reduce gastos o aumenta ingresos por traspasos.</span>
                    </div>
                  )}
                  {squadMarketValue > club.budget * 1.5 && (
                    <div className="flex items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></span>
                      <span className="text-gray-300 text-sm">Plantilla sobrevalorada. Oportunidad para ventas rentables.</span>
                    </div>
                  )}
                  {averageOverall >= 85 && totalPlayerSalaries < club.budget * 0.7 && totalBalance > 0 && (
                    <div className="flex items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="w-3 h-3 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                      <span className="text-gray-300 text-sm">Excelente posición financiera y deportiva. Puedes invertir en refuerzos.</span>
                    </div>
                  )}
                  <div className="flex items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="w-3 h-3 bg-blue-400 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-gray-300 text-sm">Monitorea el mercado de fichajes para oportunidades de mejora.</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-white text-lg">Valor neto del club</h4>
                <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-6 rounded-xl border border-gray-500 shadow-lg">
                  <div className={`text-3xl font-bold mb-3 ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(netWorth)}
                  </div>
                  <p className="text-gray-300 text-sm mb-4 font-medium">
                    Presupuesto + Balance acumulado
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600">
                      <span className="text-gray-400 block mb-1">Presupuesto:</span>
                      <div className="font-bold text-white">{formatCurrency(club.budget)}</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600">
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
      </div>
    </div>
  );
};
export default ClubFinances;
 


