import  { useState } from 'react';
import { Plus, Search, Edit, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';
import NewClubModal from '../../components/admin/NewClubModal';
import EditClubModal from '../../components/admin/EditClubModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { Club } from '../../types';

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
       <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Clubes</h1>
          <p className="text-gray-400 mt-2">Administra todos los clubes de la liga</p>
        </div>
        <button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowNew(true)}
        >
          <Plus size={20} />
          <span>Nuevo Club</span>
        </button>
      </div> 

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar clubes..."
          className="input pl-10 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clubs Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="table-header">Club</th>
              <th className="table-header">Entrenador</th>
              <th className="table-header">Presupuesto</th>
              <th className="table-header">Fecha de Creación</th>
              <th className="table-header text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClubs.length > 0 ? (
              filteredClubs.map((club) => (
                <tr key={club.id} className="border-t border-gray-700">
                  <td className="table-cell font-medium">{club.name}</td>
                  <td className="table-cell">{getManagerName(club)}</td>
                  <td className="table-cell">${club.budget.toLocaleString()}</td>
                  <td className="table-cell">
                    {new Date(club.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => setEditClub(club)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300"
                        onClick={() => setDeleteClub(club)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="table-cell text-center py-8 text-gray-400">
                  No se encontraron clubes
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  ); 
};

export default Clubes;
 