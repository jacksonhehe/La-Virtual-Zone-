import { motion } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Star,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Player } from '../../types/shared';

interface Props {
  players: Player[];
  onQuickAction?: (action: string, data?: any) => void;
}

export default function SquadQuickActions({ players, onQuickAction }: Props) {
  const quickActions = [
    {
      id: 'expiring-contracts',
      label: 'Contratos por Vencer',
      icon: Calendar,
      color: 'text-orange-500 bg-orange-500/20',
      count: players.filter(p => (p.contract?.years || 0) <= 1).length,
      description: 'Jugadores con contratos próximos a vencer'
    },
    {
      id: 'high-potential',
      label: 'Jugadores Promesa',
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-500/20',
      count: players.filter(p => p.potential - p.overall > 10).length,
      description: 'Jugadores jóvenes con alto potencial'
    },
    {
      id: 'star-players',
      label: 'Jugadores Estrella',
      icon: Star,
      color: 'text-yellow-500 bg-yellow-500/20',
      count: players.filter(p => p.overall >= 80).length,
      description: 'Jugadores con overall 80+'
    },
    {
      id: 'salary-budget',
      label: 'Presupuesto Salarial',
      icon: DollarSign,
      color: 'text-green-500 bg-green-500/20',
      count: Math.round((players.reduce((sum, p) => sum + (p.contract?.salary || 0), 0) / 1000000) * 10) / 10,
      description: 'Total de salarios en millones'
    },
    {
      id: 'squad-depth',
      label: 'Profundidad de Plantilla',
      icon: Users,
      color: 'text-purple-500 bg-purple-500/20',
      count: players.length,
      description: 'Total de jugadores en plantilla'
    },
    {
      id: 'position-balance',
      label: 'Balance por Posición',
      icon: Target,
      color: 'text-cyan-500 bg-cyan-500/20',
      count: ['GK', 'DEF', 'MID', 'ATT'].filter(pos => 
        players.filter(p => p.position === pos).length >= 3
      ).length,
      description: 'Posiciones con buena cobertura'
    }
  ];

  const handleActionClick = (actionId: string) => {
    if (onQuickAction) {
      onQuickAction(actionId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <BarChart3 size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Acciones Rápidas</h3>
          <p className="text-white/60">Acceso rápido a funciones de gestión</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleActionClick(action.id)}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon size={20} />
              </div>
              <div className="text-2xl font-bold text-white">
                {action.id === 'salary-budget' ? `${action.count}M` : action.count}
              </div>
            </div>
            
            <h4 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">
              {action.label}
            </h4>
            <p className="text-sm text-white/60">
              {action.description}
            </p>

            {/* Action indicators */}
            <div className="mt-3 flex items-center gap-2">
              {action.id === 'expiring-contracts' && action.count > 0 && (
                <div className="flex items-center gap-1 text-orange-500 text-xs">
                  <AlertTriangle size={12} />
                  <span>Requiere atención</span>
                </div>
              )}
              {action.id === 'high-potential' && action.count > 0 && (
                <div className="flex items-center gap-1 text-blue-500 text-xs">
                  <TrendingUp size={12} />
                  <span>Desarrollo activo</span>
                </div>
              )}
              {action.id === 'star-players' && action.count > 0 && (
                <div className="flex items-center gap-1 text-yellow-500 text-xs">
                  <Star size={12} />
                  <span>Activos</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6"
      >
        <h4 className="text-lg font-bold text-white mb-4">Resumen Rápido</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(players.reduce((sum, p) => sum + p.overall, 0) / players.length)}
            </div>
            <div className="text-sm text-white/60">OVR Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(players.reduce((sum, p) => sum + p.age, 0) / players.length)}
            </div>
            <div className="text-sm text-white/60">Edad Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {players.filter(p => p.age <= 23).length}
            </div>
            <div className="text-sm text-white/60">Jóvenes (≤23)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {players.filter(p => p.age >= 30).length}
            </div>
            <div className="text-sm text-white/60">Veteranos (≥30)</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 