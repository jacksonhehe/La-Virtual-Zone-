import  { useState } from 'react';
import { Plus, Search, Edit, Trash, Building, Trophy, Users, Eye, MoreVertical, Filter } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';
import NewClubModal from '../../components/admin/NewClubModal';
import EditClubModal from '../../components/admin/EditClubModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { Club } from '../../types/shared';

const Clubes = () => {
  const { clubs, users, addClub, updateClub, removeClub, setLoading } = useGlobalStore();
  const [showNew, setShowNew] = useState(false);
  const [editClub, setEditClub] = useState<Club | null>(null);
  const [deleteClub, setDeleteClub] = useState<Club | null>(null);
  const [search, setSearch] = useState(''); 

  const getManagerName = (club: Club) => {
    const m = users.find(u => u.id === club.managerId);
    return m ? m.username : club.manager;
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(search.toLowerCase()) ||
    getManagerName(club).toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateClub = async (clubData: Partial<Club>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const managerUser = users.find(u => u.id === clubData.managerId);
    const newClub: Club = {
      id: Date.now().toString(),
      name: clubData.name || '',
      slug: clubData.slug || '',
      logo: clubData.logo || '',
      foundedYear: clubData.foundedYear || new Date().getFullYear(),
      stadium: clubData.stadium || '',
      budget: clubData.budget || 1000000,
      manager: managerUser ? managerUser.username : '',
      managerId: clubData.managerId,
      playStyle: clubData.playStyle || '',
      primaryColor: clubData.primaryColor || '#ffffff',
      secondaryColor: clubData.secondaryColor || '#000000',
      description: clubData.description || '',
      titles: [],
      reputation: 50,
      fanBase: 0,
      morale: 50,
      createdAt: new Date().toISOString()
    };
    
    addClub(newClub);
    setShowNew(false);
    setLoading(false);
    toast.success('Club creado exitosamente');
  };

  const handleUpdateClub = async (clubData: Club) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const managerUser = users.find(u => u.id === clubData.managerId);
    const updatedClub: Club = {
      ...clubData,
      manager: managerUser ? managerUser.username : ''
    };

    updateClub(updatedClub);
    setEditClub(null);
    setLoading(false);
    toast.success('Club actualizado exitosamente');
  };

  const handleDeleteClub = async () => {
    if (!deleteClub) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    removeClub(deleteClub.id);
    setDeleteClub(null);
    setLoading(false);
    toast.success('Club eliminado exitosamente');
  };

   return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
                <Building size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Gestión de Clubes
                </h1>
                <p className="text-gray-400 text-lg">Administra todos los clubes de la liga</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{clubs.length}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {clubs.filter(c => c.managerId).length}
                </div>
                <div className="text-xs text-gray-400">Con DT</div>
              </div>
            </div>
            
            <button 
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => setShowNew(true)}
            >
              <Plus size={20} />
              <span>Nuevo Club</span>
            </button>
          </div>
        </div>  

             {/* Advanced Search */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre de club o entrenador..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <button className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-600/50 transition-all duration-300">
              <Filter size={20} />
            </button>
          </div>
        </div> 

             {/* Clubs Grid */}
        <div className="grid gap-6">
          {filteredClubs.length > 0 ? (
            filteredClubs.map((club) => (
              <div 
                key={club.id} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        {club.logo ? (
                          <img 
                            src={club.logo} 
                            alt={club.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building size={24} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{club.name}</h3>
                        {club.titles && club.titles.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Trophy size={16} className="text-yellow-400" />
                            <span className="text-yellow-400 text-sm font-medium">{club.titles.length}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users size={16} className="text-blue-400" />
                          <span className="text-gray-400">DT:</span>
                          <span className={`font-medium ${club.managerId ? 'text-green-400' : 'text-red-400'}`}>
                            {getManagerName(club) || 'Sin asignar'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Presupuesto:</span>
                          <span className="font-bold text-green-400">
                            ${club.budget.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Fundado:</span>
                          <span className="text-white font-medium">
                            {club.foundedYear || new Date(club.createdAt).getFullYear()}
                          </span>
                        </div>
                      </div>
                      
                      {club.stadium && (
                        <div className="mt-2 text-sm text-gray-400">
                          <span>Estadio: </span>
                          <span className="text-white">{club.stadium}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-600"
                            style={{ backgroundColor: club.primaryColor }}
                          ></div>
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-600"
                            style={{ backgroundColor: club.secondaryColor }}
                          ></div>
                        </div>
                        
                        <span className="text-xs text-gray-500">
                          Creado: {new Date(club.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
                      onClick={() => setEditClub(club)}
                      title="Editar club"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-300"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                      onClick={() => setDeleteClub(club)}
                      title="Eliminar club"
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
                <Building size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No se encontraron clubes</h3>
              <p className="text-gray-400 mb-6">Intenta ajustar los filtros o crear un nuevo club</p>
              <button 
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                onClick={() => setShowNew(true)}
              >
                Crear primer club
              </button>
            </div>
          )}
        </div> 

             {/* Modals */}
        {showNew && <NewClubModal onClose={() => setShowNew(false)} onSave={handleCreateClub} />}
        {editClub && <EditClubModal club={editClub} onClose={() => setEditClub(null)} onSave={handleUpdateClub} />}
        {deleteClub && (
          <ConfirmDeleteModal
            message={`¿Estás seguro de eliminar el club "${deleteClub.name}"?`}
            onConfirm={handleDeleteClub}
            onClose={() => setDeleteClub(null)}
          />
        )}
      </div>
    </div>
  );  
};

export default Clubes;
 