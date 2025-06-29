import  { useState } from 'react';
import { Plus, Search, Edit, Trash, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';
import NewPlayerModal from '../../components/admin/NewPlayerModal';
import EditPlayerModal from '../../components/admin/EditPlayerModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { Player } from '../../types';

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
      position: playerData.position || 'DEL',
      clubId: playerData.clubId || '',
      overall: playerData.overall || 75,
      price: playerData.price || 100000
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
       <div className="p-8 space-y-8">
      <header className="flex justify-between items-center bg-vz-surface p-6 rounded">
        <div>
          <h1 className="text-4xl font-heading font-bold gradient-text">Jugadores</h1>
          <p className="text-secondary mt-2">Base de datos completa de jugadores</p>
        </div>
        <button
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowNew(true)}
        >
          <Plus size={20} />
          <span>Nuevo Jugador</span>
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
          <input
            type="text"
            placeholder="Buscar jugadores..."
            className="input pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input"
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
          className="input"
          value={clubFilter}
          onChange={(e) => setClubFilter(e.target.value)}
        >
          <option value="all">Todos los clubes</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>{club.name}</option>
          ))}
        </select>
      </div>

      {/* Players Table */}
      <div className="rounded-lg border border-vz-overlay overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-vz-overlay">
            <tr>
              <th className="table-header">Nombre</th>
              <th className="table-header">Posición</th>
              <th className="table-header">Club</th>
              <th className="table-header">Overall</th>
              <th className="table-header">Precio</th>
              <th className="table-header text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <tr key={player.id} className="border-t border-vz-overlay even:bg-vz-overlay/50">
                  <td className="table-cell font-medium">{player.name}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      player.position === 'POR' 
                        ? 'bg-yellow-900/20 text-yellow-300'
                        : player.position === 'DEF'
                        ? 'bg-blue-900/20 text-blue-300'
                        : player.position === 'MED'
                        ? 'bg-green-900/20 text-green-300'
                        : 'bg-red-900/20 text-red-300'
                    }`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="table-cell">{getClubName(player.clubId)}</td>
                  <td className="table-cell">
                    <span className={`font-medium ${
                      player.overall >= 85 ? 'text-green-400' :
                      player.overall >= 75 ? 'text-yellow-400' :
                      'text-secondary'
                    }`}>
                      {player.overall}
                    </span>
                  </td>
                  <td className="table-cell">${player.price.toLocaleString()}</td>
                  <td className="table-cell text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => setEditPlayer(player)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300"
                        onClick={() => setDeletePlayer(player)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="table-cell text-center py-8 text-secondary">
                  No se encontraron jugadores
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  ); 
};

export default Jugadores;
 