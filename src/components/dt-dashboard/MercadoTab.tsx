import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { Player } from '../../types/shared';
import toast from 'react-hot-toast';
import OffersPanel from '../market/OffersPanel';
import OfferModal from '../market/OfferModal';

export default function MercadoTab() {
  const { user } = useAuthStore();
  const { players, club, clubs, offers, marketStatus } = useDataStore();
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'value' | 'overall' | 'age'>('value');
  const [showOffers, setShowOffers] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const userClub =
    user?.role === 'dt'
      ? clubs.find(c => c.id === user.clubId || c.name === user.club)
      : null;

  // Debugging logs
  console.log('User object:', user);
  console.log('Clubs array:', clubs);

  // Debugging logs
  console.log('Todas las ofertas:', offers);
  console.log('Club del usuario:', userClub?.name);
  console.log(
    'Ofertas filtradas:',
    userClub ? offers.filter(o => o.toClub === userClub.name) : []
  );

  const sentOffers = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return offers;
    if (user.role === 'dt') {
      return userClub ? offers.filter(o => o.toClub === userClub.name) : [];
    }
    return offers.filter(o => o.userId === user.id);
  }, [offers, user, userClub]);

  const receivedOffers = useMemo(() => {
    if (!user || user.role !== 'dt') return [];
    // Offers for players from my club
    return userClub ? offers.filter(o => o.fromClub === userClub.name) : [];
  }, [offers, userClub, user]);

  console.log('MercadoTab receivedOffers:', receivedOffers);


  const availablePlayers = useMemo(() => {
    return players
      .filter(p => p.transferListed)
      .filter(p => p.clubId !== club?.id)
      .filter(p => positionFilter === 'all' || p.position === positionFilter)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        switch (sortBy) {
          case 'value': return b.marketValue - a.marketValue;
          case 'overall': return b.overall - a.overall;
          case 'age': return a.age - b.age;
          default: return 0;
        }
      });
  }, [players, club?.id, positionFilter, search, sortBy]);

  const getClubName = (clubId: string) => {
    const found = clubs.find(c => c.id === clubId);
    return found ? found.name : 'Desconocido';
  };

  const handleMakeOffer = (player: Player) => {
    if (!marketStatus) {
      toast.error('El mercado está cerrado');
      return;
    }
    if (!player.transferListed) {
      toast.error('El jugador no está en la lista de transferibles');
      return;
    }
    setSelectedPlayer(player);
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar jugadores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
            >
              <option value="all">Todas las posiciones</option>
              <option value="GK">Portero</option>
              <option value="DEF">Defensa</option>
              <option value="MID">Mediocampo</option>
              <option value="ATT">Delantero</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'value' | 'overall' | 'age')}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
            >
              <option value="value">Por valor</option>
              <option value="overall">Por media</option>
              <option value="age">Por edad</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowOffers(false)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              !showOffers
                ? 'bg-primary text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Jugadores Disponibles
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => userClub && setShowOffers(true)}
            disabled={!userClub}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              showOffers
                ? 'bg-primary text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            } ${!userClub ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Mis Ofertas ({sentOffers.length + receivedOffers.length})
          </motion.button>
        </div>
      </motion.div>

      {!userClub && user?.role === 'dt' && (
        <p className="text-center text-red-400">
          No tienes un club asignado. Contacta a un administrador.
        </p>
      )}

      <AnimatePresence mode="wait">
        {!showOffers ? (
          <motion.div
            key="market"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {availablePlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-black/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="relative">
                  <img 
                    src={player.image} 
                    alt={player.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 px-2 py-1 rounded-lg text-xs font-medium">
                    {player.position}
                  </div>
                  <div className="absolute top-3 right-3 bg-primary/90 px-2 py-1 rounded-lg text-xs font-bold text-black">
                    {player.overall}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{player.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{getClubName(player.clubId)} • {player.age} años</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-bold">
                      {formatCurrency(player.marketValue)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" />
                      <span className="text-sm">{player.potential}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMakeOffer(player)}
                    className="w-full bg-primary text-black font-medium py-2 rounded-xl hover:bg-primary-light transition-colors"
                  >
                    Hacer Oferta
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="offers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <OffersPanel
              initialView="sent"
              sentOffers={sentOffers}
              receivedOffers={receivedOffers}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {selectedPlayer && (
        <OfferModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onOfferSent={() => setShowOffers(true)}
        />
      )}
    </div>
  );
}
 