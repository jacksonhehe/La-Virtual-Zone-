import  { useState } from 'react';
import { Plus, Search, Edit, Trash, Filter, User, Trophy, Star, Eye, MoreVertical, Users } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';
import NewPlayerModal from '../../components/admin/NewPlayerModal';
import EditPlayerModal from '../../components/admin/EditPlayerModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { Player } from '../../types/shared';

const Jugadores = () => {
  const { players, clubs, addPlayer, updatePlayer, removePlayer, setLoading } = useGlobalStore();
  const [showNew, setShowNew] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deletePlayer, setDeletePlayer] = useState<Player | null>(null);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [clubFilter, setClubFilter] = useState('all'); 

   const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
    const matchesClub = clubFilter === 'all' || player.clubId === clubFilter;
    return matchesSearch && matchesPosition && matchesClub;
  });

  const getClubName = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Club no encontrado';
  };

  const handleCreatePlayer = async (playerData: Partial<Player>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerData.name || '',
      age: playerData.age || 18,
      nationality: playerData.nationality || '',
      dorsal: playerData.dorsal || 1,
      position: playerData.position || 'DEL',
      clubId: playerData.clubId || '',
      overall: playerData.overall || 75,
      potential: playerData.potential || 80,
      transferListed: false,
      matches: 0,
      transferValue: playerData.price || 0,
      value: playerData.price || 0,
      image:
        playerData.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(playerData.name || '')}&background=1e293b&color=fff&size=128`,
      attributes: {
        pace: 50,
        shooting: 50,
        passing: 50,
        dribbling: 50,
        defending: 50,
        physical: 50
      },
      contract: {
        expires: playerData.contract?.expires || '',
        salary: playerData.contract?.salary || 0
      },
      form: 1,
      goals: 0,
      assists: 0,
      appearances: 0,
      price: playerData.price || 0
    };
    
    addPlayer(newPlayer);
    setShowNew(false);
    setLoading(false);
    toast.success('Jugador creado exitosamente');
  };

  const handleUpdatePlayer = async (playerData: Player) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updatePlayer(playerData);
    setEditPlayer(null);
    setLoading(false);
    toast.success('Jugador actualizado exitosamente');
  };

  const handleDeletePlayer = async () => {
    if (!deletePlayer) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    removePlayer(deletePlayer.id);
    setDeletePlayer(null);
    setLoading(false);
    toast.success('Jugador eliminado exitosamente');
  };

   return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Gestión de Jugadores
                </h1>
                <p className="text-gray-400 text-lg">Base de datos completa de jugadores</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{filteredPlayers.length}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {filteredPlayers.filter(p => p.overall >= 85).length}
                </div>
                <div className="text-xs text-gray-400">Elite</div>
              </div>
            </div>
            
            <button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => setShowNew(true)}
            >
              <Plus size={20} />
              <span>Nuevo Jugador</span>
            </button>
          </div>
        </div>  

             {/* Advanced Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre de jugador..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="all">Todas las posiciones</option>
              <option value="POR">Portero</option>
              <option value="DEF">Defensor</option>
              <option value="MED">Mediocampista</option>
              <option value="DEL">Delantero</option>
            </select>
            
            <select
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
            >
              <option value="all">Todos los clubes</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
          </div>
        </div> 

             {/* Players Grid */}
        <div className="grid gap-4">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <div 
                key={player.id} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
                        {player.image ? (
                          <img 
                            src={player.image} 
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg px-2 py-1 text-xs font-bold text-white">
                        {player.overall}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{player.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          player.position === 'POR' 
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : player.position === 'DEF'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : player.position === 'MED'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {player.position}
                        </span>
                        {player.overall >= 85 && (
                          <Star size={16} className="text-yellow-400" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Club:</span>
                          <span className="text-white font-medium">{getClubName(player.clubId)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Edad:</span>
                          <span className="text-white font-medium">{player.age} años</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Nacionalidad:</span>
                          <span className="text-white font-medium">{player.nationality}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Dorsal:</span>
                          <span className="text-white font-bold">#{player.dorsal}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-sm">Valor:</span>
                            <span className="text-green-400 font-bold">
                              ${(player.price || 0).toLocaleString()}
                            </span>
                          </div>
                          
                          {player.potential && (
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 text-sm">Potencial:</span>
                              <span className="text-blue-400 font-medium">{player.potential}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            player.overall >= 85 ? 'bg-green-400' :
                            player.overall >= 75 ? 'bg-yellow-400' :
                            'bg-gray-400'
                          }`}></div>
                          <span className="text-xs text-gray-400">
                            {player.overall >= 85 ? 'Elite' :
                             player.overall >= 75 ? 'Profesional' :
                             'Promesa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
                      onClick={() => setEditPlayer(player)}
                      title="Editar jugador"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-300"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                      onClick={() => setDeletePlayer(player)}
                      title="Eliminar jugador"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800/30 rounded-xl p-12 text-center border border-gray-700/50">
              <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No se encontraron jugadores</h3>
              <p className="text-gray-400 mb-6">Intenta ajustar los filtros o crear un nuevo jugador</p>
              <button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                onClick={() => setShowNew(true)}
              >
                Crear primer jugador
              </button>
            </div>
          )}
        </div> 

             {/* Modals */}
        {showNew && <NewPlayerModal onClose={() => setShowNew(false)} onSave={handleCreatePlayer} />}
        {editPlayer && <EditPlayerModal player={editPlayer} onClose={() => setEditPlayer(null)} onSave={handleUpdatePlayer} />}
        {deletePlayer && (
          <ConfirmDeleteModal
            message={`¿Estás seguro de eliminar al jugador "${deletePlayer.name}"?`}
            onConfirm={handleDeletePlayer}
            onClose={() => setDeletePlayer(null)}
          />
        )}
      </div>
    </div>
  );  
};

export default Jugadores;
 