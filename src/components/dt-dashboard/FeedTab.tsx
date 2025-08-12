import React, { useState, useMemo } from 'react';
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
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  MessageSquare,
  Star,
  TrendingDown,
  UserPlus,
  UserMinus,
  Target,
  Award,
  Shield,
  Zap,
  Heart,
  Activity,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

interface FeedItem {
  id: string;
  type: 'transfer' | 'achievement' | 'message' | 'injury' | 'finance' | 'match' | 'training' | 'news' | 'system';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  icon?: string;
  actionRequired?: boolean;
  actionType?: 'approve' | 'reject' | 'view' | 'respond' | 'schedule';
  metadata?: any;
  read?: boolean;
}

const typeConfig = {
  transfer: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Transferencia' },
  achievement: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Logro' },
  message: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Mensaje' },
  injury: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Lesión' },
  finance: { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Finanzas' },
  match: { icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Partido' },
  training: { icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Entrenamiento' },
  news: { icon: Bell, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Noticia' },
  system: { icon: Settings, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Sistema' }
};

const priorityConfig = {
  critical: { border: 'border-l-red-600', bg: 'bg-red-500/5', label: 'Crítica', color: 'text-red-400' },
  high: { border: 'border-l-red-500', bg: 'bg-red-500/5', label: 'Alta', color: 'text-red-400' },
  medium: { border: 'border-l-yellow-500', bg: 'bg-yellow-500/5', label: 'Media', color: 'text-yellow-400' },
  low: { border: 'border-l-gray-500', bg: 'bg-gray-500/5', label: 'Baja', color: 'text-gray-400' }
};

export default function FeedTab() {
  const { club, fixtures, players, offers, transfers } = useDataStore();
  
  const [filter, setFilter] = useState<'all' | FeedItem['type']>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'unread'>('newest');
  const [showRead, setShowRead] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Generate real-time feed from store data
  const realTimeFeed = useMemo(() => {
    const feed: FeedItem[] = [];

    // Transfer offers
    offers.forEach(offer => {
      if (offer.clubId === club?.id) {
        feed.push({
          id: `offer-${offer.id}`,
          type: 'transfer',
          title: 'Oferta de Transferencia Recibida',
          description: `${offer.buyingClub} ha ofrecido €${offer.amount.toLocaleString()} por ${offer.playerName}`,
          timestamp: offer.createdAt || new Date().toISOString(),
          priority: offer.amount > 50000000 ? 'high' : 'medium',
          actionRequired: true,
          actionType: 'approve',
          metadata: { offerId: offer.id, playerId: offer.playerId }
        });
      }
    });

    // Recent matches
    const recentMatches = fixtures
      .filter(match => 
        (match.homeTeam === club?.name || match.awayTeam === club?.name) && 
        match.played
      )
      .slice(0, 3);

    recentMatches.forEach(match => {
      const isWin = (match.homeTeam === club?.name && match.homeScore > match.awayScore) ||
                   (match.awayTeam === club?.name && match.awayScore > match.homeScore);
      
      feed.push({
        id: `match-${match.id}`,
        type: 'match',
        title: `Partido ${isWin ? 'Ganado' : 'Perdido'}`,
        description: `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`,
        timestamp: match.date,
        priority: isWin ? 'medium' : 'high',
        actionType: 'view',
        metadata: { matchId: match.id, result: isWin ? 'win' : 'loss' }
      });
    });

    // Player achievements
    players
      .filter(p => p.clubId === club?.id)
      .slice(0, 2)
      .forEach(player => {
        if (player.goals > 10 || player.assists > 8) {
          feed.push({
            id: `achievement-${player.id}`,
            type: 'achievement',
            title: 'Jugador Destacado',
            description: `${player.name} ha marcado ${player.goals} goles y ${player.assists} asistencias`,
            timestamp: new Date().toISOString(),
            priority: 'medium',
            actionType: 'view',
            metadata: { playerId: player.id, playerName: player.name }
          });
        }
      });

    // Financial updates
    if (club) {
      const totalValue = players
        .filter(p => p.clubId === club.id)
        .reduce((sum, p) => sum + (p.precio_compra_libre || 0), 0);
      
      if (totalValue > 100000000) {
        feed.push({
          id: 'finance-high-value',
          type: 'finance',
          title: 'Valor de Plantilla Alto',
          description: `El valor total de la plantilla es €${(totalValue / 1000000).toFixed(1)}M`,
          timestamp: new Date().toISOString(),
          priority: 'low',
          actionType: 'view',
          metadata: { totalValue }
        });
      }
    }

    // System notifications
    feed.push({
      id: 'system-welcome',
      type: 'system',
      title: 'Bienvenido al Dashboard',
      description: 'Tu feed se actualiza en tiempo real con las últimas novedades del club',
      timestamp: new Date().toISOString(),
      priority: 'low',
      actionType: 'view'
    });

    return feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [club, offers, fixtures, players]);

  const filteredAndSortedFeed = useMemo(() => {
    let filtered = realTimeFeed;
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.type === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply read filter
    if (!showRead) {
      filtered = filtered.filter(item => !item.read);
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      filtered = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      filtered = filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else if (sortBy === 'unread') {
      filtered = filtered.sort((a, b) => (a.read ? 1 : 0) - (b.read ? 0 : 1));
    }
    
    return filtered;
  }, [realTimeFeed, filter, searchQuery, showRead, sortBy]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `hace ${diffDays}d`;
    if (diffHours > 0) return `hace ${diffHours}h`;
    if (diffMinutes > 0) return `hace ${diffMinutes}m`;
    return 'ahora';
  };

  const handleAction = (item: FeedItem, action: string) => {
    // Mark as read
    item.read = true;
    
    // Handle specific actions
    switch (action) {
      case 'approve':
        // Handle transfer approval
        console.log('Approving transfer:', item.metadata);
        break;
      case 'reject':
        // Handle transfer rejection
        console.log('Rejecting transfer:', item.metadata);
        break;
      case 'view':
        // Show details
        setSelectedItem(item);
        setShowDetailsModal(true);
        break;
    }
  };

  const markAllAsRead = () => {
    realTimeFeed.forEach(item => item.read = true);
  };

  const getUnreadCount = () => realTimeFeed.filter(item => !item.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell size={24} />
            Feed de Actividad
            {getUnreadCount() > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {getUnreadCount()}
              </span>
            )}
          </h2>
          <p className="text-gray-400">Mantente al día con las últimas novedades del club</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            <CheckCircle size={16} />
            Marcar como leído
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar en el feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              {Object.entries(typeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Más reciente</option>
              <option value="priority">Por prioridad</option>
              <option value="unread">No leídos primero</option>
            </select>
            
            <button
              onClick={() => setShowRead(!showRead)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showRead 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {showRead ? <Eye size={16} /> : <EyeOff size={16} />}
              {showRead ? 'Mostrar leídos' : 'Ocultar leídos'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Feed Items */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAndSortedFeed.map((item, index) => {
            const config = typeConfig[item.type];
            const priority = priorityConfig[item.priority];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white/5 backdrop-blur-sm border border-white/10 ${priority.border} border-l-4 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 ${
                  !item.read ? 'ring-2 ring-primary/30' : ''
                }`}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleAction(item, 'view')}
              >
                <div className="flex items-start gap-4">
                  <div className={`${config.bg} ${config.color} p-3 rounded-xl flex-shrink-0`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                          {!item.read && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${priority.bg} ${priority.color}`}>
                            {priority.label}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                        <Clock size={12} />
                        <span>{formatTimeAgo(item.timestamp)}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {item.actionRequired && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(item, 'approve');
                          }}
                          className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(item, 'reject');
                          }}
                          className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    {item.actionType && !item.actionRequired && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(item, item.actionType!);
                          }}
                          className="px-3 py-1 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20 transition-colors"
                        >
                          Ver detalles
                        </button>
                      </div>
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

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`${typeConfig[selectedItem.type].bg} ${typeConfig[selectedItem.type].color} p-3 rounded-xl`}>
                    {React.createElement(typeConfig[selectedItem.type].icon, { size: 24 })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedItem.title}</h3>
                    <p className="text-gray-400 text-sm">{typeConfig[selectedItem.type].label}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-white/70 mb-2">Descripción</h4>
                  <p className="text-white">{selectedItem.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">Prioridad</h4>
                    <span className={`px-3 py-1 rounded-lg text-xs ${priorityConfig[selectedItem.priority].bg} ${priorityConfig[selectedItem.priority].color}`}>
                      {priorityConfig[selectedItem.priority].label}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">Fecha</h4>
                    <p className="text-white text-sm">
                      {new Date(selectedItem.timestamp).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {selectedItem.metadata && (
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">Información Adicional</h4>
                    <pre className="bg-white/5 p-3 rounded-lg text-xs text-white/70 overflow-x-auto">
                      {JSON.stringify(selectedItem.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                {selectedItem.actionType && (
                  <button
                    onClick={() => {
                      handleAction(selectedItem, selectedItem.actionType!);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary-light transition-colors"
                  >
                    {selectedItem.actionType === 'approve' ? 'Aprobar' : 
                     selectedItem.actionType === 'reject' ? 'Rechazar' : 'Ver'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
