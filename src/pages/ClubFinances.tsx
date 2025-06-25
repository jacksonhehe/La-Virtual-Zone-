import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ArrowUp, ArrowDown, DollarSign, ShoppingBag, Clipboard } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDataStore } from '../store/dataStore';
import { formatCurrency, formatDate } from '../utils/helpers';

const ClubFinances = () => {
  const { clubName } = useParams<{ clubName: string }>();

  const { clubs, transfers } = useDataStore();
  
  // Find club by slug
  const club = clubs.find(c => c.slug === clubName);
  
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
  
  // Get club transfers
  const clubTransfers = transfers.filter(t => t.fromClub === club.name || t.toClub === club.name);
  
  // Calculate income, expenses and balance
  const income = clubTransfers
    .filter(t => t.fromClub === club.name)
    .reduce((sum, t) => sum + t.fee, 0);
  
  const expenses = clubTransfers
    .filter(t => t.toClub === club.name)
    .reduce((sum, t) => sum + t.fee, 0);
  
  
  // Simulate other finances
  const salaries = Math.round(club.budget * 0.08);
  const infrastructure = Math.round(club.budget * 0.02);
  const merchandising = Math.round(club.budget * 0.05);
  const sponsorships = Math.round(club.budget * 0.15);
  
  const totalIncome = income + merchandising + sponsorships;
  const totalExpenses = expenses + salaries + infrastructure;
  const totalBalance = totalIncome - totalExpenses;
  
  return (
    <div>
      <PageHeader 
        title={`Finanzas de ${club.name}`} 
        subtitle="Presupuesto, transacciones y balance económico del club."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to={`/liga-master/club/${club.slug}`}
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver al perfil del club</span>
          </Link>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{club.name}</h2>
              <p className="text-gray-400">
                Temporada 2025 • Presupuesto: {formatCurrency(club.budget)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <DollarSign size={20} className="text-green-500 mr-2" />
                  Ingresos
                </h3>
                <span className="text-sm text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                  +{formatCurrency(totalIncome)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Traspasos</span>
                  <span className="font-medium">
                    {formatCurrency(income)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Patrocinadores</span>
                  <span className="font-medium">
                    {formatCurrency(sponsorships)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Merchandising</span>
                  <span className="font-medium">
                    {formatCurrency(merchandising)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-800 pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-green-500">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <ShoppingBag size={20} className="text-red-500 mr-2" />
                  Gastos
                </h3>
                <span className="text-sm text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                  -{formatCurrency(totalExpenses)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Fichajes</span>
                  <span className="font-medium">
                    {formatCurrency(expenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Salarios</span>
                  <span className="font-medium">
                    {formatCurrency(salaries)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Infraestructura</span>
                  <span className="font-medium">
                    {formatCurrency(infrastructure)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-800 pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-red-500">
                    -{formatCurrency(totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Clipboard size={20} className="text-primary mr-2" />
                  Balance
                </h3>
                <span className={`text-sm ${totalBalance >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} px-2 py-1 rounded-full`}>
                  {totalBalance >= 0 ? '+' : ''}{formatCurrency(totalBalance)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total ingresos</span>
                  <span className="font-medium text-green-500">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total gastos</span>
                  <span className="font-medium text-red-500">
                    -{formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-800 pt-2">
                  <span className="font-medium">Balance neto</span>
                  <span className={`font-bold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalBalance >= 0 ? '+' : ''}{formatCurrency(totalBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Presupuesto actual</span>
                  <span className="font-bold">
                    {formatCurrency(club.budget + totalBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Historial de traspasos</h3>
          
          <div className="card overflow-hidden">
            <div className="p-4 bg-dark-lighter border-b border-gray-800">
              <h4 className="font-bold">Temporada 2025</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                    <th className="px-4 py-3 text-left">Jugador</th>
                    <th className="px-4 py-3 text-center">Tipo</th>
                    <th className="px-4 py-3 text-center">Origen</th>
                    <th className="px-4 py-3 text-center">Destino</th>
                    <th className="px-4 py-3 text-center">Valor</th>
                    <th className="px-4 py-3 text-center">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {clubTransfers.map(transfer => {
                    const isIncoming = transfer.toClub === club.name;
                    return (
                      <tr key={transfer.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-bold">
                                {transfer.playerName.split(' ')[0][0]}{transfer.playerName.split(' ')[1][0]}
                              </span>
                            </div>
                            <span className="font-medium">{transfer.playerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isIncoming ? (
                            <span className="inline-flex items-center text-green-500">
                              <ArrowDown size={14} className="mr-1" />
                              Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-500">
                              <ArrowUp size={14} className="mr-1" />
                              Salida
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{transfer.fromClub}</td>
                        <td className="px-4 py-3 text-center">{transfer.toClub}</td>
                        <td className="px-4 py-3 text-center font-medium">
                          <span className={isIncoming ? 'text-red-500' : 'text-green-500'}>
                            {isIncoming ? '-' : '+'}{formatCurrency(transfer.fee)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{formatDate(transfer.date)}</td>
                      </tr>
                    );
                  })}
                  
                  {clubTransfers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                        No hay traspasos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-4">Proyección financiera</h3>
          
          <div className="card p-6">
            <div className="mb-6">
              <h4 className="font-bold mb-3">Temporada 2025-2026</h4>
              <div className="h-8 bg-dark-lighter rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{ width: '70%' }}></div>
              </div>
              <div className="flex justify-between mt-1 text-sm">
                <span className="text-red-500">Peligro</span>
                <span className="text-yellow-500">Cuidado</span>
                <span className="text-green-500">Sano</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-3">Recomendaciones</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-gray-300">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Situación financiera estable.
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Controlar gastos salariales.
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Posibilidad de inversión en cantera.
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-3">Presupuesto disponible</h4>
                <div className="bg-dark-lighter p-4 rounded-lg">
                  <div className="text-3xl font-bold mb-2">{formatCurrency(club.budget * 0.3)}</div>
                  <p className="text-sm text-gray-400">
                    Para fichajes en la próxima ventana de transferencias.
                  </p>
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
 