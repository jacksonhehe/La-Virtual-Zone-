import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Star
} from 'lucide-react';
import { Player } from '../../types/shared';
import Image from '../ui/Image';

interface Props {
  players: Player[];
  onRenewContract?: (playerId: string, years: number, salary: number) => void;
}

interface ContractStatus {
  player: Player;
  status: 'expiring' | 'expired' | 'recent' | 'stable';
  priority: 'high' | 'medium' | 'low';
  recommendedSalary: number;
  recommendedYears: number;
}

export default function ContractManagement({ players, onRenewContract }: Props) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);

  const contractAnalysis = useMemo(() => {
    const analysis: ContractStatus[] = [];

    players.forEach(player => {
      const contractYears = player.contract?.years || 0;
      const currentSalary = player.contract?.salary || 0;
      
      let status: ContractStatus['status'];
      let priority: ContractStatus['priority'];
      let recommendedSalary = currentSalary;
      let recommendedYears = contractYears;

      // Determine status
      if (contractYears <= 0) {
        status = 'expired';
        priority = 'high';
        recommendedSalary = Math.round(currentSalary * 1.1); // 10% increase
        recommendedYears = 3;
      } else if (contractYears <= 1) {
        status = 'expiring';
        priority = 'high';
        recommendedSalary = Math.round(currentSalary * 1.05); // 5% increase
        recommendedYears = 3;
      } else if (contractYears <= 2) {
        status = 'expiring';
        priority = 'medium';
        recommendedSalary = Math.round(currentSalary * 1.02); // 2% increase
        recommendedYears = 4;
      } else if (contractYears <= 3) {
        status = 'recent';
        priority = 'low';
        recommendedSalary = currentSalary;
        recommendedYears = contractYears;
      } else {
        status = 'stable';
        priority = 'low';
        recommendedSalary = currentSalary;
        recommendedYears = contractYears;
      }

      // Adjust recommendations based on player quality and age
      if (player.overall >= 80) {
        recommendedSalary = Math.round(recommendedSalary * 1.15);
        recommendedYears = Math.max(recommendedYears, 4);
      } else if (player.overall >= 75) {
        recommendedSalary = Math.round(recommendedSalary * 1.1);
        recommendedYears = Math.max(recommendedYears, 3);
      }

      if (player.age <= 23 && player.potential - player.overall > 10) {
        recommendedSalary = Math.round(recommendedSalary * 1.2);
        recommendedYears = Math.max(recommendedYears, 5);
      }

      analysis.push({
        player,
        status,
        priority,
        recommendedSalary,
        recommendedYears
      });
    });

    return analysis.sort((a, b) => {
      // Sort by priority first, then by status
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const statusOrder = { expired: 4, expiring: 3, recent: 2, stable: 1 };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return statusOrder[b.status] - statusOrder[a.status];
    });
  }, [players]);

  const filteredAnalysis = showExpiringOnly 
    ? contractAnalysis.filter(a => a.status === 'expired' || a.status === 'expiring')
    : contractAnalysis;

  const getStatusColor = (status: ContractStatus['status']) => {
    switch (status) {
      case 'expired': return 'text-red-500 bg-red-500/20';
      case 'expiring': return 'text-orange-500 bg-orange-500/20';
      case 'recent': return 'text-yellow-500 bg-yellow-500/20';
      case 'stable': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: ContractStatus['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: ContractStatus['status']) => {
    switch (status) {
      case 'expired': return <AlertTriangle size={16} />;
      case 'expiring': return <Clock size={16} />;
      case 'recent': return <CheckCircle size={16} />;
      case 'stable': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleRenewContract = (playerId: string, years: number, salary: number) => {
    if (onRenewContract) {
      onRenewContract(playerId, years, salary);
    }
    setSelectedPlayer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Gestión de Contratos</h3>
          <p className="text-white/60">Administra los contratos de tu plantilla</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpiringOnly(!showExpiringOnly)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              showExpiringOnly 
                ? 'bg-primary text-black' 
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <AlertTriangle size={16} />
            Solo Críticos
          </button>
        </div>
      </div>

      {/* Contract Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-500">
            {contractAnalysis.filter(a => a.status === 'expired').length}
          </div>
          <div className="text-sm text-white/60">Expirados</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">
            {contractAnalysis.filter(a => a.status === 'expiring').length}
          </div>
          <div className="text-sm text-white/60">Por Vencer</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-500">
            {contractAnalysis.filter(a => a.status === 'stable').length}
          </div>
          <div className="text-sm text-white/60">Estables</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {contractAnalysis.reduce((sum, a) => sum + a.recommendedSalary, 0).toLocaleString()}€
          </div>
          <div className="text-sm text-white/60">Salarios Totales</div>
        </div>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {filteredAnalysis.map((analysis, index) => (
          <motion.div
            key={analysis.player.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => setSelectedPlayer(analysis.player)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={analysis.player.image}
                  alt={analysis.player.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover ring-2 ring-white/20"
                />
                <div>
                  <h4 className="font-bold text-white">{analysis.player.name}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/60">{analysis.player.position}</span>
                    <span className="text-white/60">•</span>
                    <span className="text-white/60">{analysis.player.age} años</span>
                    <span className="text-white/60">•</span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500" />
                      <span className="text-white/60">{analysis.player.overall}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-white/60">Contrato Actual</div>
                  <div className="text-white font-medium">
                    {analysis.player.contract?.years || 0} años • {analysis.player.contract?.salary.toLocaleString()}€
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 ${getStatusColor(analysis.status)}`}>
                    {getStatusIcon(analysis.status)}
                    {analysis.status === 'expired' && 'Expirado'}
                    {analysis.status === 'expiring' && 'Por Vencer'}
                    {analysis.status === 'recent' && 'Reciente'}
                    {analysis.status === 'stable' && 'Estable'}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(analysis.priority)}`}>
                    {analysis.priority === 'high' && 'Alta'}
                    {analysis.priority === 'medium' && 'Media'}
                    {analysis.priority === 'low' && 'Baja'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contract Renewal Modal */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlayer(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <Image
                src={selectedPlayer.image}
                alt={selectedPlayer.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-xl ring-2 ring-primary/50"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedPlayer.name}</h3>
                <p className="text-primary">{selectedPlayer.position} • {selectedPlayer.age} años</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Contrato Actual</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Salario:</span>
                  <span className="text-white">{selectedPlayer.contract?.salary.toLocaleString()}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Años:</span>
                  <span className="text-white">{selectedPlayer.contract?.years || 0} años</span>
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-bold text-primary mb-2">Recomendación</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Nuevo Salario:</span>
                  <span className="text-white">
                    {Math.round((selectedPlayer.contract?.salary || 0) * 1.1).toLocaleString()}€
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Nuevos Años:</span>
                  <span className="text-white">3 años</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleRenewContract(
                  selectedPlayer.id,
                  3,
                  Math.round((selectedPlayer.contract?.salary || 0) * 1.1)
                )}
                className="flex-1 bg-primary hover:bg-primary/80 text-black font-medium py-3 rounded-xl transition-colors"
              >
                Renovar Contrato
              </button>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {filteredAnalysis.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <p className="text-white/60 text-lg">Todos los contratos están en orden</p>
        </motion.div>
      )}
    </div>
  );
} 