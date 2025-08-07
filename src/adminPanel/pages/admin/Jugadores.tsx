import  { useState } from 'react';
import { Plus, Search, Edit, Trash, Filter, User, Trophy, Star, Eye, MoreVertical, Users, RefreshCw } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';
import { useDataStore } from '../../../store/dataStore';
import NewPlayerModal from '../../components/admin/NewPlayerModal';
import EditPlayerModal from '../../components/admin/EditPlayerModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { Player } from '../../types/shared';
import { resetPlayersData } from '../../../utils/playerService';

const Jugadores = () => {
  const { players, clubs, addPlayer, updatePlayer, removePlayer, setLoading } = useGlobalStore();
  const { addPlayer: addPlayerToDataStore, updatePlayerEntry } = useDataStore();
  const [showNew, setShowNew] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deletePlayer, setDeletePlayer] = useState<Player | null>(null);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [clubFilter, setClubFilter] = useState('all'); 

   const filteredPlayers = players.filter(player => {
    const fullName = `${player.nombre_jugador || ''} ${player.apellido_jugador || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    const matchesPosition = positionFilter === 'all' || player.posicion === positionFilter;
    const matchesClub = clubFilter === 'all' || player.id_equipo === clubFilter;
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
      nombre_jugador: playerData.nombre_jugador || '',
      apellido_jugador: playerData.apellido_jugador || '',
      edad: playerData.edad || 18,
      altura: playerData.altura || 175,
      peso: playerData.peso || 70,
      pierna: playerData.pierna || 'right',
      estilo_juego: playerData.estilo_juego || 'Balanced',
      posicion: playerData.posicion || 'CF',
      valoracion: playerData.valoracion || 75,
      precio_compra_libre: playerData.precio_compra_libre || 1000000,
      nacionalidad: playerData.nacionalidad || '',
      id_equipo: playerData.id_equipo || '',
      foto_jugador: playerData.foto_jugador || '',
      is_free: playerData.is_free || false,
      
      // Características ofensivas
      actitud_ofensiva: playerData.actitud_ofensiva ?? 70,
      control_balon: playerData.control_balon ?? 70,
      drible: playerData.drible ?? 70,
      posesion_balon: playerData.posesion_balon ?? 70,
      pase_raso: playerData.pase_raso ?? 70,
      pase_bombeado: playerData.pase_bombeado ?? 70,
      finalizacion: playerData.finalizacion ?? 70,
      cabeceador: playerData.cabeceador ?? 70,
      balon_parado: playerData.balon_parado ?? 70,
      efecto: playerData.efecto ?? 70,
      
      // Características físicas
      velocidad: playerData.velocidad ?? 70,
      aceleracion: playerData.aceleracion ?? 70,
      potencia_tiro: playerData.potencia_tiro ?? 70,
      salto: playerData.salto ?? 70,
      contacto_fisico: playerData.contacto_fisico ?? 70,
      equilibrio: playerData.equilibrio ?? 70,
      resistencia: playerData.resistencia ?? 70,
      
      // Características defensivas
      actitud_defensiva: playerData.actitud_defensiva ?? 70,
      recuperacion_balon: playerData.recuperacion_balon ?? 70,
      agresividad: playerData.agresividad ?? 70,
      
      // Características de portero
      actitud_portero: playerData.actitud_portero ?? 70,
      atajar_pt: playerData.atajar_pt ?? 70,
      despejar_pt: playerData.despejar_pt ?? 70,
      reflejos_pt: playerData.reflejos_pt ?? 70,
      cobertura_pt: playerData.cobertura_pt ?? 70,
      
      // Características adicionales
      uso_pie_malo: playerData.uso_pie_malo ?? 70,
      precision_pie_malo: playerData.precision_pie_malo ?? 70,
      estabilidad: playerData.estabilidad ?? 70,
      resistencia_lesiones: playerData.resistencia_lesiones ?? 70,
      
      // Campos legacy para compatibilidad
      name: playerData.nombre_jugador || '',
      age: playerData.edad ?? 18,
      position: playerData.posicion || 'CF',
      nationality: playerData.nacionalidad || '',
      dorsal: playerData.dorsal ?? 1,
      clubId: playerData.id_equipo || '',
      overall: playerData.valoracion ?? 75,
      potential: playerData.valoracion ?? 75,
      transferListed: false,
      matches: 0,
      transferValue: playerData.precio_compra_libre ?? 1000000,
      value: playerData.precio_compra_libre ?? 1000000,
      image: playerData.foto_jugador || `https://ui-avatars.com/api/?name=${encodeURIComponent(playerData.nombre_jugador || '')}&background=1e293b&color=fff&size=128`,
      attributes: {
        pace: playerData.velocidad ?? 70,
        shooting: playerData.finalizacion ?? 70,
        passing: playerData.pase_raso ?? 70,
        dribbling: playerData.drible ?? 70,
        defending: playerData.actitud_defensiva ?? 70,
        physical: playerData.contacto_fisico ?? 70
      },
      contract: {
        expires: (new Date().getFullYear() + 3).toString(),
        salary: playerData.precio_compra_libre ?? 1000000
      },
      form: 1,
      goals: 0,
      assists: 0,
      appearances: 0,
      price: playerData.precio_compra_libre || 1000000,
      detailedStats: {
        offensive: playerData.actitud_ofensiva ?? 70,
        ballControl: playerData.control_balon ?? 70,
        dribbling: playerData.drible ?? 70,
        lowPass: playerData.pase_raso ?? 70,
        loftedPass: playerData.pase_bombeado ?? 70,
        finishing: playerData.finalizacion ?? 70,
        placeKicking: playerData.balon_parado ?? 70,
        volleys: playerData.efecto ?? 70,
        curl: playerData.cabeceador ?? 70,
        speed: playerData.velocidad ?? 70,
        acceleration: playerData.aceleracion ?? 70,
        kickingPower: playerData.potencia_tiro ?? 70,
        stamina: playerData.resistencia ?? 70,
        jumping: playerData.salto ?? 70,
        physicalContact: playerData.contacto_fisico ?? 70,
        balance: playerData.equilibrio ?? 70,
        defensive: playerData.actitud_defensiva ?? 70,
        ballWinning: playerData.recuperacion_balon ?? 70,
        aggression: playerData.agresividad ?? 70,
        goalkeeperReach: playerData.actitud_portero ?? 70,
        goalkeeperReflexes: playerData.reflejos_pt ?? 70,
        goalkeeperClearing: playerData.despejar_pt ?? 70,
        goalkeeperThrowing: playerData.atajar_pt ?? 70,
        goalkeeperHandling: playerData.cobertura_pt ?? 70,
      },
      specialSkills: playerData.specialSkills || [],
      celebrations: playerData.celebrations || [],
      playingStyle: playerData.estilo_juego || 'Equilibrado',
      consistency: playerData.estabilidad ?? 70,
      injuryResistance: playerData.resistencia_lesiones ?? 70,
      morale: 70
    };
    
    addPlayer(newPlayer);
    // Sincronizar con dataStore para el Dashboard del DT
    addPlayerToDataStore(newPlayer);
    setShowNew(false);
    setLoading(false);
    toast.success('Jugador creado exitosamente');
  };

  const handleUpdatePlayer = async (playerData: Player) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updatePlayer(playerData);
    // Sincronizar con dataStore para el Dashboard del DT
    updatePlayerEntry(playerData);
    setEditPlayer(null);
    setLoading(false);
    toast.success('Jugador actualizado exitosamente');
  };

  const handleDeletePlayer = async () => {
    if (!deletePlayer) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    removePlayer(deletePlayer.id);
    // Sincronizar con dataStore para el Dashboard del DT
    const { removePlayer: removePlayerFromDataStore } = useDataStore.getState();
    removePlayerFromDataStore(deletePlayer.id);
    setDeletePlayer(null);
    setLoading(false);
    toast.success('Jugador eliminado exitosamente');
  };

  const handleResetPlayersData = () => {
    if (confirm('¿Estás seguro de que quieres regenerar todos los datos de jugadores? Esto eliminará todos los jugadores existentes.')) {
      resetPlayersData();
    }
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
            
            <button
              onClick={handleResetPlayersData}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Regenerar datos de jugadores"
            >
              <RefreshCw size={20} />
              <span>Regenerar Datos</span>
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
              <option value="GK">Portero</option>
              <option value="CB">Central</option>
              <option value="LB">Lateral Izquierdo</option>
              <option value="RB">Lateral Derecho</option>
              <option value="DMF">Mediocentro Defensivo</option>
              <option value="CMF">Mediocentro</option>
              <option value="AMF">Mediocentro Ofensivo</option>
              <option value="LMF">Medio Izquierdo</option>
              <option value="RMF">Medio Derecho</option>
              <option value="LWF">Extremo Izquierdo</option>
              <option value="RWF">Extremo Derecho</option>
              <option value="SS">Segundo Delantero</option>
              <option value="CF">Delantero Centro</option>
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
                        {player.valoracion || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{player.nombre_jugador || 'Sin nombre'} {player.apellido_jugador || ''}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          player.posicion === 'GK' 
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : player.posicion?.includes('DEF')
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : player.posicion?.includes('MF')
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {player.posicion || 'N/A'}
                        </span>
                        {(player.valoracion || 0) >= 85 && (
                          <Star size={16} className="text-yellow-400" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Club:</span>
                          <span className="text-white font-medium">{getClubName(player.id_equipo)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Edad:</span>
                          <span className="text-white font-medium">{player.edad || 'N/A'} años</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Nacionalidad:</span>
                          <span className="text-white font-medium">{player.nacionalidad || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Altura:</span>
                          <span className="text-white font-medium">{player.altura || 'N/A'}cm</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Peso:</span>
                          <span className="text-white font-medium">{player.peso || 'N/A'}kg</span>
                        </div>
                      </div>
                      
                                              <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 text-sm">Valor:</span>
                              <span className="text-green-400 font-bold">
                                ${(player.precio_compra_libre || 0).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 text-sm">Valoración:</span>
                              <span className="text-blue-400 font-medium">{player.valoracion || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              (player.valoracion || 0) >= 85 ? 'bg-green-400' :
                              (player.valoracion || 0) >= 75 ? 'bg-yellow-400' :
                              'bg-gray-400'
                            }`}></div>
                            <span className="text-xs text-gray-400">
                              {(player.valoracion || 0) >= 85 ? 'Elite' :
                               (player.valoracion || 0) >= 75 ? 'Profesional' :
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
 