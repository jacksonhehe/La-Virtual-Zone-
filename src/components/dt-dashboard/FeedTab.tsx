import  { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertCircle, 
  Trophy, 
  Calendar,
  Filter,
  Clock
} from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'news' | 'transfer' | 'achievement' | 'message' | 'injury' | 'finance';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
}

const mockFeedData: FeedItem[] = [
  {
    id: '1',
    type: 'transfer',
    title: 'Oferta recibida',
    description: 'Real Madrid ha enviado una oferta de €45M por Martín Pérez',
    timestamp: '2024-01-15T14:30:00Z',
    priority: 'high'
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Jugador del mes',
    description: 'Carlos García ha sido elegido jugador del mes de la liga',
    timestamp: '2024-01-15T12:00:00Z',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'news',
    title: 'Lesión rival',
    description: 'El delantero estrella del Barcelona estará fuera 3 semanas',
    timestamp: '2024-01-15T10:15:00Z',
    priority: 'low'
  },
  {
    id: '4',
    type: 'message',
    title: 'Mensaje de la directiva',
    description: 'Reunión programada para revisar el presupuesto del próximo mercado',
    timestamp: '2024-01-15T09:00:00Z',
    priority: 'medium'
  },
  {
    id: '5',
    type: 'finance',
    title: 'Actualización presupuestaria',
    description: 'Se han liberado €15M adicionales para fichajes',
    timestamp: '2024-01-14T16:45:00Z',
    priority: 'high'
  },
  {
    id: '6',
    type: 'injury',
    title: 'Parte médico',
    description: 'Diego Ramírez se ha recuperado completamente de su lesión',
    timestamp: '2024-01-14T14:20:00Z',
    priority: 'medium'
  }
];

const typeConfig = {
  news: { icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  transfer: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
  achievement: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  message: { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  injury: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  finance: { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
};

const priorityConfig = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-gray-500'
};

export default function FeedTab() {
  const [filter, setFilter] = useState<'all' | FeedItem['type']>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priority'>('newest');

  const filteredAndSortedFeed = useMemo(() => {
    let filtered = filter === 'all' ? mockFeedData : mockFeedData.filter(item => item.type === filter);
    
    if (sortBy === 'newest') {
      filtered = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      filtered = filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }
    
    return filtered;
  }, [filter, sortBy]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `hace ${diffDays}d`;
    if (diffHours > 0) return `hace ${diffHours}h`;
    return 'hace poco';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Feed de Actividad</h2>
          <p className="text-gray-400">Mantente al día con las últimas novedades</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="transfer">Transferencias</option>
            <option value="achievement">Logros</option>
            <option value="news">Noticias</option>
            <option value="message">Mensajes</option>
            <option value="injury">Lesiones</option>
            <option value="finance">Finanzas</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="newest">Más reciente</option>
            <option value="priority">Prioridad</option>
          </select>
        </div>
      </motion.div>

      {/* Feed Items */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAndSortedFeed.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 ${priorityConfig[item.priority]} border-l-4 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`${config.bg} ${config.color} p-2 rounded-lg flex-shrink-0`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                        <Clock size={12} />
                        <span>{formatTimeAgo(item.timestamp)}</span>
                      </div>
                    </div>
                    
                    {item.priority === 'high' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full"
                      >
                        <AlertCircle size={10} />
                        Prioridad alta
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {filteredAndSortedFeed.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Bell size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No hay actividad</h3>
          <p className="text-gray-500">No se encontraron elementos con los filtros seleccionados</p>
        </motion.div>
      )}
    </div>
  );
}
 