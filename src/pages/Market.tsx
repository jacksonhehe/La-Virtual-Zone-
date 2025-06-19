import  { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { Player } from '../types';
import PageHeader from '../components/common/PageHeader';
import OfferModal from '../components/market/OfferModal';
import OffersPanel from '../components/market/OffersPanel';
import { formatCurrency, getPositionColor, getFormIcon } from '../utils/helpers';

const Market = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [ratingSort, setRatingSort] = useState<'asc' | 'desc' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<'players' | 'offers'>('players');
  
  const { players, clubs, marketStatus } = useDataStore();
  
  // Filter players
  const transferListedPlayers = players.filter(p => p.transferListed);
  
  const filteredPlayers = transferListedPlayers.filter(player => {
    // Apply search filter
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply position filter
    if (positionFilter !== 'all') {
      switch (positionFilter) {
        case 'gk':
          if (player.position !== 'GK') return false;
          break;
        case 'def':
          if (!['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position)) return false;
          break;
        case 'mid':
          if (!['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(player.position)) return false;
          break;
        case 'att':
          if (!['ST', 'CF', 'LW', 'RW'].includes(player.position)) return false;
          break;
      }
    }
    
    return true;
  });
  
  // Sort players
  const sortedPlayers = [...filteredPlayers];
  
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
  
  // Get club name by ID
  const getClubName = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Desconocido';
  };
  
  // Get club logo by ID
  const getClubLogo = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.logo : '';
  };
  
  return (
    <div>
      <PageHeader 
        title="Mercado de Fichajes" 
        subtitle="Compra y vende jugadores para mejorar tu equipo."
        image="https://images.unsplash.com/photo-1494178270175-e96de2971df9?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Market status */}
        <div className="mb-6">
          {marketStatus ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <h3 className="font-bold text-green-400">Mercado Abierto</h3>
                <p className="text-sm text-gray-300">
                  Puedes realizar ofertas por jugadores disponibles.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <div>
                <h3 className="font-bold text-red-400">Mercado Cerrado</h3>
                <p className="text-sm text-gray-300">
                  El mercado de fichajes está cerrado actualmente.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-800">
            <button 
              onClick={() => setActiveTab('players')}
              className={`px-4 py-3 font-medium ${activeTab === 'players' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
            >
              Jugadores
            </button>
            <button 
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-3 font-medium ${activeTab === 'offers' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
            >
              Mis Ofertas
            </button>
          </div>
        </div>
        
        {activeTab === 'players' ? (
          <>
            {/* Search and filters */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar jugadores..."
                    className="input pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center"
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
              
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Posición</label>
                      <select
                        className="input w-full"
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                      >
                        <option value="all">Todas las posiciones</option>
                        <option value="gk">Porteros</option>
                        <option value="def">Defensas</option>
                        <option value="mid">Centrocampistas</option>
                        <option value="att">Delanteros</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPlayers.map(player => (
                <div key={player.id} className="card card-hover">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center">
                      <img 
                        src={player.image} 
                        alt={player.name}
                        className="w-14 h-14 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-bold">{player.name}</h3>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className={`px-2 py-0.5 rounded ${getPositionColor(player.position)}`}>
                            {player.position}
                          </span>
                          <span className="text-gray-400">{player.age} años</span>
                          <span className="flex items-center">
                            {player.overall} OVR {getFormIcon(player.form)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center">
                        <img 
                          src={getClubLogo(player.clubId)} 
                          alt={getClubName(player.clubId)}
                          className="w-6 h-6 mr-2"
                        />
                        <span className="text-sm text-gray-300">
                          {getClubName(player.clubId)}
                        </span>
                      </div>
                      <div className="font-bold text-lg">
                        {formatCurrency(player.transferValue)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ritmo</span>
                        <span>{player.attributes.pace}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tiro</span>
                        <span>{player.attributes.shooting}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pase</span>
                        <span>{player.attributes.passing}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Regate</span>
                        <span>{player.attributes.dribbling}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Defensa</span>
                        <span>{player.attributes.defending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Físico</span>
                        <span>{player.attributes.physical}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className="btn-primary text-sm w-full"
                      disabled={!marketStatus}
                    >
                      Hacer Oferta
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredPlayers.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No se encontraron jugadores que coincidan con los filtros.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          // Offers tab
          <OffersPanel />
        )}
      </div>
      
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
 