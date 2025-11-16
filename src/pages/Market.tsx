import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Briefcase, Users, TrendingUp, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import PageHeader from '../components/common/PageHeader';
import OfferModal from '../components/market/OfferModal';
import OffersPanel from '../components/market/OffersPanel';
import { config } from '../lib/config';
import PlayerStatsModal from '../components/common/PlayerStatsModal';
import { getTransferListedPlayersCount, findDuplicatePlayers, removeDuplicatePlayers } from '../utils/playerService';
import FutPlayerCard from '../components/market/FutPlayerCard';
import { applyWeeklyVictoryBonusesIfNeeded } from '../utils/marketRules';
import { usePagination } from '../hooks/usePagination';
import { getTranslatedPosition, getClubDisplayName, getClubDisplayLogo } from '../utils/helpers';

const Market = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [ratingSort, setRatingSort] = useState<'asc' | 'desc' | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [clubFilter, setClubFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'players' | 'offers'>('players');

  const { players, clubs, marketStatus, offers, transfers, refreshPlayers } = useDataStore() as any;

  // Get club name by ID (using helper function)
  const getClubName = (clubId: string) => getClubDisplayName(clubId, clubs);

  // Get club logo by ID (using helper function)
  const getClubLogo = (clubId: string) => getClubDisplayLogo(clubId, clubs);
  const { user } = useAuthStore();

  // Get transfer listed players count
  const [transferListedCount, setTransferListedCount] = useState(0);

  // Check for duplicate players on component mount
  React.useEffect(() => {
    const checkDuplicates = async () => {
      try {
        const { duplicates } = await findDuplicatePlayers();
        if (duplicates.length > 0) {
          console.warn('WARNING: Duplicate players detected in the system. Applying automatic cleanup...');
          await removeDuplicatePlayers();
          if (typeof refreshPlayers === 'function') {
            await refreshPlayers();
          }
          console.warn('Duplicate players removed automatically.');
        }
      } catch (error) {
        console.error('Error checking for duplicates:', error);
      }
    };

    const updateCount = async () => {
      try {
        const count = await getTransferListedPlayersCount();
        setTransferListedCount(count);
      } catch (error) {
        console.error('Error getting transfer listed count:', error);
      }
    };

    checkDuplicates();
    updateCount();
  }, [refreshPlayers]);

  // Aplicar bonos semanales por victorias una vez por semana
  React.useEffect(() => {
    try { applyWeeklyVictoryBonusesIfNeeded(); } catch { /* noop */ }
  }, []);
  
  // Filter players
  const transferListedPlayers = players.filter(p => p.transferListed);


  const filteredPlayers = transferListedPlayers.filter(player => {
    // Search filter (name, position, or club)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = player.name.toLowerCase().includes(query);
      const matchesPosition = getTranslatedPosition(player.position).toLowerCase().includes(query);
      const matchesClub = getClubName(player.clubId).toLowerCase().includes(query);

      if (!matchesName && !matchesPosition && !matchesClub) return false;
    }

    // Position filter
    if (positionFilter !== 'all') {
      let shouldInclude = false;
      switch (positionFilter) {
        case 'gk':
          shouldInclude = player.position === 'PT';
          break;
        case 'def':
          shouldInclude = ['DEC', 'LI', 'LD'].includes(player.position);
          break;
        case 'mid':
          shouldInclude = ['MCD', 'MC', 'MO', 'MDI', 'MDD'].includes(player.position);
          break;
        case 'att':
          shouldInclude = ['CD', 'EXI', 'EXD', 'SD'].includes(player.position);
          break;
      }

      if (!shouldInclude) return false;
    }

    // Club filter
    if (clubFilter !== 'all' && player.clubId !== clubFilter) return false;

    return true;
  });


  // Sort players
  let sortedPlayers = [...filteredPlayers];
  
  if (priceSort) {
    sortedPlayers.sort((a, b) => {
      return priceSort === 'asc' 
        ? a.transferValue - b.transferValue 
        : b.transferValue - a.transferValue;
    });
  } else if (ratingSort) {
    sortedPlayers.sort((a, b) => {
      return ratingSort === 'asc' 
        ? a.overall - b.overall 
        : b.overall - a.overall;
    });
  }

  // Create a unique key for filters to force pagination reset
  const filterKey = `${searchQuery}-${positionFilter}-${priceSort}-${ratingSort}-${clubFilter}`;

  // Apply pagination to sorted players
  const pagination = usePagination({
    items: sortedPlayers,
    perPage: 20, // 20 players per page (4 columns max)
    initialPage: 1
  });

  // Reset pagination when filters change using useRef to avoid infinite loops
  const lastFilterKey = React.useRef(filterKey);
  React.useEffect(() => {
    if (lastFilterKey.current !== filterKey) {
      pagination.set(1);
      lastFilterKey.current = filterKey;
    }
  }, [filterKey]); // Remove pagination dependency



  // Handler para mostrar las stats del jugador
  const handleShowPlayerStats = (player: any) => {
    setSelectedPlayerForStats(player);
  };
  
  return (
    <div>
      <PageHeader
        title="Mercado de Fichajes"
        subtitle={`Compra y vende jugadores para mejorar tu equipo. ${transferListedCount} jugadores disponibles.`}
        image="https://images.unsplash.com/photo-1494178270175-e96de2971df9?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Weekly summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {(() => {
            const now = new Date();
            const from = new Date();
            from.setDate(now.getDate() - 7);
            const weeklyTransfers = (transfers || []).filter((t: any) => t.date && new Date(t.date).getTime() >= from.getTime());
            const activeOffers = (offers || []).filter((o: any) => o.status === 'pending' || o.status === 'counter-offer');
            const spendByClub: Record<string, number> = {};
            const earnByClub: Record<string, number> = {};
            weeklyTransfers.forEach((t: any) => {
              spendByClub[t.toClub] = (spendByClub[t.toClub] || 0) + (t.fee || 0);
              earnByClub[t.fromClub] = (earnByClub[t.fromClub] || 0) + (t.fee || 0);
            });
            const topSpender = Object.entries(spendByClub).sort((a, b) => b[1] - a[1])[0];
            const topSeller = Object.entries(earnByClub).sort((a, b) => b[1] - a[1])[0];
            return (
              <>
                <div className="group p-6 bg-gradient-to-br from-gray-800/80 to-gray-850/80 rounded-xl border border-gray-700/50 shadow-lg hover:shadow-xl hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400 font-medium">Ofertas activas</div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-3xl font-bold text-white group-hover:text-primary transition-colors duration-300">{activeOffers.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Pendientes de respuesta</div>
                </div>
                <div className="group p-6 bg-gradient-to-br from-gray-800/80 to-gray-850/80 rounded-xl border border-gray-700/50 shadow-lg hover:shadow-xl hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400 font-medium">Transferidos (7 días)</div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">{weeklyTransfers.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Movimientos recientes</div>
                </div>
                <div className="group p-6 bg-gradient-to-br from-gray-800/80 to-gray-850/80 rounded-xl border border-gray-700/50 shadow-lg hover:shadow-xl hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400 font-medium">Top mercado (7 días)</div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-300 mt-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} className="text-green-400" />
                      <span className="text-xs">{topSpender ? topSpender[0] : '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={12} className="text-red-400" />
                      <span className="text-xs">{topSeller ? topSeller[0] : '—'}</span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
        {/* Market status */}
        <div className="mb-8">
          {marketStatus ? (
            <div className="relative overflow-hidden p-6 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-50"></div>
              <div className="relative flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-4 animate-pulse shadow-lg shadow-green-500/30"></div>
                <div>
                  <h3 className="text-lg font-bold text-green-400 mb-1 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-400" />
                    Mercado Abierto
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Realiza ofertas por jugadores disponibles y mejora tu plantilla
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden p-6 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-50"></div>
              <div className="relative flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-4 shadow-lg shadow-red-500/30"></div>
                <div>
                  <h3 className="text-lg font-bold text-red-400 mb-1 flex items-center gap-2">
                    <XCircle size={20} className="text-red-400" />
                    Mercado Cerrado
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    El mercado de fichajes está cerrado actualmente. Vuelve pronto.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/30 p-1 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('players')}
              className={`flex-1 px-6 py-3 font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'players'
                  ? 'bg-primary text-dark shadow-lg shadow-primary/25 transform scale-[1.02]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center justify-center">
                <Users size={16} className="mr-2" />
                Jugadores
              </span>
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`flex-1 px-6 py-3 font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'offers'
                  ? 'bg-primary text-dark shadow-lg shadow-primary/25 transform scale-[1.02]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center justify-center">
                <Briefcase size={16} className="mr-2" />
                Gestión de Ofertas
              </span>
            </button>
          </div>
        </div>
        
        {activeTab === 'players' ? (
          <>
            {/* Search and filters */}
            <div className="mb-8 bg-gradient-to-r from-gray-800/30 to-gray-850/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, posición o club..."
                    className="input pl-12 w-full h-12 text-base bg-gray-800/50 border-gray-600/50 focus:border-primary/50 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn-secondary flex items-center px-6 py-3 h-12 transition-all duration-300 ${
                      showFilters ? 'bg-primary/20 border-primary/30' : ''
                    }`}
                  >
                    <Filter size={18} className="mr-2" />
                    <span>Filtros</span>
                    {showFilters ? (
                      <ChevronUp size={18} className="ml-2" />
                    ) : (
                      <ChevronDown size={18} className="ml-2" />
                    )}
                  </button>
                </div>
              </div>
              
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Posición</label>
                      <select
                        className="input w-full"
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                      >
                        <option value="all">Todas las posiciones</option>
                        <option value="gk">Porteros (POR)</option>
                        <option value="def">Defensas (CT, LI, LD)</option>
                        <option value="mid">Centrocampistas (MCD, MC, MO, MDI, MDD)</option>
                        <option value="att">Delanteros (DC, EXI, EXD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Club</label>
                      <select
                        className="input w-full"
                        value={clubFilter}
                        onChange={(e) => setClubFilter(e.target.value)}
                      >
                        <option value="all">Todos los clubes</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Ordenar por precio</label>
                      <select
                        className="input w-full"
                        value={priceSort || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPriceSort(value ? value as 'asc' | 'desc' : null);
                          if (value) setRatingSort(null);
                        }}
                      >
                        <option value="">Sin ordenar</option>
                        <option value="asc">Precio: Menor a Mayor</option>
                        <option value="desc">Precio: Mayor a Menor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Ordenar por media</label>
                      <select
                        className="input w-full"
                        value={ratingSort || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRatingSort(value ? value as 'asc' | 'desc' : null);
                          if (value) setPriceSort(null);
                        }}
                      >
                        <option value="">Sin ordenar</option>
                        <option value="asc">Media: Menor a Mayor</option>
                        <option value="desc">Media: Mayor a Menor</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Players grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {pagination.items.map(player => {
                // Check if user is DT and player belongs to their club
                const isDT = user?.role === 'dt' || (Array.isArray(user?.roles) && user.roles.includes('dt'));
                const userClubId = isDT ? (user as any)?.clubId : null;
                const isOwnPlayer = isDT && userClubId && player.clubId === userClubId;

                return (
                  <FutPlayerCard
                    key={player.id}
                    player={player as any}
                    club={{ name: getClubName(player.clubId), logo: getClubLogo(player.clubId) }}
                    value={player.transferValue}
                    disabled={!marketStatus || isOwnPlayer}
                    isOwnPlayer={isOwnPlayer}
                    onOffer={() => setSelectedPlayer(player)}
                    onStatsClick={() => handleShowPlayerStats(player)}
                  />
                );
              })}

              {pagination.items.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">No se encontraron jugadores</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Intenta ajustar los filtros de búsqueda o revisa si el mercado está abierto.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 bg-gradient-to-r from-gray-800/30 to-gray-850/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      Mostrando <span className="font-semibold text-white">{pagination.items.length}</span> de <span className="font-semibold text-white">{sortedPlayers.length}</span> jugadores
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={pagination.prev}
                      disabled={pagination.page === 1}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-600 hover:to-gray-700 hover:border-gray-500 transition-all duration-300 shadow-md hover:shadow-lg disabled:hover:shadow-md"
                    >
                      ← Anterior
                    </button>

                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <span className="text-primary font-semibold">{pagination.page}</span>
                      <span className="text-gray-500">de</span>
                      <span className="text-gray-400">{pagination.totalPages}</span>
                    </div>

                    <button
                      onClick={pagination.next}
                      disabled={pagination.page === pagination.totalPages}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-600 hover:to-gray-700 hover:border-gray-500 transition-all duration-300 shadow-md hover:shadow-lg disabled:hover:shadow-md"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Page number buttons for better navigation */}
            {pagination.totalPages > 1 && pagination.totalPages <= 10 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => pagination.set(pageNum)}
                    className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                      pagination.page === pageNum
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          // Offers tab
          <div>
            <OffersPanel />
          </div>
        )}
      </div>
      
      {/* Player Stats Modal */}
      {selectedPlayerForStats && (
        <PlayerStatsModal
          player={selectedPlayerForStats}
          isOpen={!!selectedPlayerForStats}
          onClose={() => setSelectedPlayerForStats(null)}
        />
      )}

      {/* Offer modal */}
      {selectedPlayer && (
        <OfferModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};

export default Market;
 
