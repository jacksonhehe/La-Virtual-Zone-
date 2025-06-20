import  { useState, useMemo } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Settings, Users, Trophy, ShoppingCart, Calendar, FileText, Clipboard, BarChart, Edit, Plus, Trash, Activity, Search, ExternalLink, MessageSquare } from 'lucide-react';
import NewUserModal from '../components/admin/NewUserModal';
import NewClubModal from '../components/admin/NewClubModal';
import NewPlayerModal from '../components/admin/NewPlayerModal';
import EditUserModal from '../components/admin/EditUserModal';
import EditClubModal from '../components/admin/EditClubModal';
import EditPlayerModal from '../components/admin/EditPlayerModal';
import ConfirmDeleteModal from '../components/admin/ConfirmDeleteModal';
import MarketAdminPanel from '../components/admin/MarketAdminPanel';
import TournamentsAdminPanel from '../components/admin/TournamentsAdminPanel';
import NewsAdminPanel from '../components/admin/NewsAdminPanel';
import StatsAdminPanel from '../components/admin/StatsAdminPanel';
import CalendarAdminPanel from '../components/admin/CalendarAdminPanel';
import ActivityAdminPanel from '../components/admin/ActivityAdminPanel';
import CommentsAdminPanel from '../components/admin/CommentsAdminPanel';
import { User, Club, Player } from '../types';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null as User | null);
  const [editingClub, setEditingClub] = useState(null as Club | null);
  const [editingPlayer, setEditingPlayer] = useState(null as Player | null);
  const [userToDelete, setUserToDelete] = useState(null as User | null);
  const [clubToDelete, setClubToDelete] = useState(null as Club | null);
  const [playerToDelete, setPlayerToDelete] = useState(null as Player | null);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all');
  const {
    clubs,
    players,
    users,
    tournaments,
    transfers,
    removeUser,
    removeClub,
    removePlayer,
    marketStatus,
    updateMarketStatus
  } = useDataStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Stats for dashboard
  const newUsersCount = useMemo(() => {
    const today = new Date().toDateString();
    return users.filter(u => {
      const date =
        u.joinDate || (u as unknown as { createdAt?: string }).createdAt;
      return date ? new Date(date).toDateString() === today : false;
    }).length;
  }, [users]);

  const activeClubsCount = clubs.length;

  const transfersTodayCount = useMemo(() => {
    const today = new Date().toDateString();
    return transfers.filter(t => {
      const date = new Date(t.date).toDateString();
      return date === today;
    }).length;
  }, [transfers]);
  const activeTournamentsCount = tournaments.filter(t => t.status === 'active').length;

  const filteredUsers = users.filter(u => {
    const search = userSearch.toLowerCase();
    const matchSearch =
      u.username.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen bg-dark">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-dark-light border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Settings size={20} className="text-primary mr-2" />
              Panel Admin
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Administración de La Virtual Zone
            </p>
          </div>
          
          <nav className="p-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Clipboard size={18} className="mr-3" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'users' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Users size={18} className="mr-3" />
              <span>Usuarios</span>
            </button>
            
            <button
              onClick={() => setActiveTab('clubs')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'clubs' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Trophy size={18} className="mr-3" />
              <span>Clubes</span>
            </button>
            
            <button
              onClick={() => setActiveTab('players')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'players' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Users size={18} className="mr-3" />
              <span>Jugadores</span>
            </button>
            
            <button
              onClick={() => setActiveTab('market')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'market' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <ShoppingCart size={18} className="mr-3" />
              <span>Mercado</span>
            </button>
            
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'tournaments' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Trophy size={18} className="mr-3" />
              <span>Torneos</span>
            </button>
            
            <button
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'news' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <FileText size={18} className="mr-3" />
              <span>Noticias</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'comments' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <MessageSquare size={18} className="mr-3" />
              <span>Comentarios</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'activity' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Activity size={18} className="mr-3" />
              <span>Actividad</span>
            </button>
            
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'stats' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <BarChart size={18} className="mr-3" />
              <span>Estadísticas</span>
            </button>
            
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'calendar' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Calendar size={18} className="mr-3" />
              <span>Calendario</span>
            </button>
            
            <div className="border-t border-gray-800 my-2 pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center p-3 rounded-md text-left text-gray-400 hover:bg-dark-lighter"
              >
                <span>Volver al sitio</span>
              </button>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-grow p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-dark-light rounded-lg p-6 border border-gray-800 flex flex-col">
                  <p className="text-gray-400 text-sm mb-1">Nuevos usuarios</p>
                  <h3 className="text-2xl font-bold">{newUsersCount}</h3>
                  <button
                    className="btn-primary mt-3"
                    onClick={() => setActiveTab('users')}
                  >
                    Ver usuarios
                  </button>
                </div>

                <div className="bg-dark-light rounded-lg p-6 border border-gray-800 flex flex-col">
                  <p className="text-gray-400 text-sm mb-1">Clubes activos</p>
                  <h3 className="text-2xl font-bold">{activeClubsCount}</h3>
                  <button
                    className="btn-primary mt-3"
                    onClick={() => setActiveTab('clubs')}
                  >
                    Ver clubes
                  </button>
                </div>

                <div className="bg-dark-light rounded-lg p-6 border border-gray-800 flex flex-col">
                  <p className="text-gray-400 text-sm mb-1">Transferencias hoy</p>
                  <h3 className="text-2xl font-bold">{transfersTodayCount}</h3>
                  <button
                    className="btn-primary mt-3"
                    onClick={() => setActiveTab('market')}
                  >
                    Ver mercado
                  </button>
                </div>

                <div className="bg-dark-light rounded-lg p-6 border border-gray-800 flex flex-col">
                  <p className="text-gray-400 text-sm mb-1">Torneos activos</p>
                  <h3 className="text-2xl font-bold">{activeTournamentsCount}</h3>
                  <button
                    className="btn-primary mt-3"
                    onClick={() => setActiveTab('tournaments')}
                  >
                    Ver torneos
                  </button>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Actividad reciente</h3>
                <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <Users size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Nuevo usuario registrado</p>
                          <p className="text-sm text-gray-400">user2024 se ha registrado</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Hace 2 horas</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                          <ShoppingCart size={18} className="text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium">Fichaje completado</p>
                          <p className="text-sm text-gray-400">Rayo Digital FC ha fichado a un nuevo jugador</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Hace 5 horas</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                          <Trophy size={18} className="text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Partido finalizado</p>
                          <p className="text-sm text-gray-400">Rayo Digital FC 3-1 Neón FC</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Hace 1 día</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Estado del sistema</h3>
                  <div className="bg-dark-light rounded-lg border border-gray-800 p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Mercado de fichajes</span>
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          <span className="font-medium">Abierto</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Jornada actual</span>
                        <span className="font-medium">Jornada 3/38</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Temporada</span>
                        <span className="font-medium">2025</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Próxima jornada</span>
                        <span className="font-medium">5 de septiembre, 2025</span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <button
                          className="btn-primary w-full"
                          onClick={() => setActiveTab('market')}
                        >
                          Administrar estado del sistema
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Acciones rápidas</h3>
                  <div className="bg-dark-light rounded-lg border border-gray-800 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        className="btn-outline py-3 flex flex-col items-center justify-center"
                        onClick={() => setActiveTab('users')}
                      >
                        <Users size={18} className="mb-1" />
                        <span className="text-sm">Gestionar usuarios</span>
                      </button>

                      <button
                        className="btn-outline py-3 flex flex-col items-center justify-center"
                        onClick={() => updateMarketStatus(!marketStatus)}
                      >
                        <ShoppingCart size={18} className="mb-1" />
                        <span className="text-sm">Abrir/cerrar mercado</span>
                      </button>

                      <button
                        className="btn-outline py-3 flex flex-col items-center justify-center"
                        onClick={() => setActiveTab('tournaments')}
                      >
                        <Trophy size={18} className="mb-1" />
                        <span className="text-sm">Crear torneo</span>
                      </button>

                      <button
                        className="btn-outline py-3 flex flex-col items-center justify-center"
                        onClick={() => setActiveTab('calendar')}
                      >
                        <Calendar size={18} className="mb-1" />
                        <span className="text-sm">Registrar resultados</span>
                      </button>

                      <button
                        className="btn-outline py-3 flex flex-col items-center justify-center"
                        onClick={() => setActiveTab('news')}
                      >
                        <FileText size={18} className="mb-1" />
                        <span className="text-sm">Crear noticia</span>
                      </button>

                      <button
                        className="btn-outline py-3 flex flex-col items-center justify-center"
                        onClick={() => setActiveTab('stats')}
                      >
                        <Settings size={18} className="mb-1" />
                        <span className="text-sm">Configuración</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
                <button className="btn-primary flex items-center" onClick={() => setShowUserModal(true)}>
                  <Plus size={16} className="mr-2" />
                  Nuevo usuario
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    className="input pl-10 w-full"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>

                <select
                  className="input w-full md:w-48"
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value as 'all' | User['role'])}
                >
                  <option value="all">Todos los roles</option>
                  <option value="user">Usuario</option>
                  <option value="dt">DT</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                        <th className="px-4 py-3 text-left">Usuario</th>
                        <th className="px-4 py-3 text-center">Correo</th>
                        <th className="px-4 py-3 text-center">Rol</th>
                        <th className="px-4 py-3 text-center">Club</th>
                        <th className="px-4 py-3 text-center">Estado</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const roleClasses =
                          u.role === 'admin'
                            ? 'bg-neon-red/20 text-neon-red'
                            : u.role === 'dt'
                            ? 'bg-neon-green/20 text-neon-green'
                            : 'bg-secondary/20 text-secondary';
                        const roleLabel =
                          u.role === 'admin'
                            ? 'Admin'
                            : u.role === 'dt'
                            ? 'DT'
                            : 'Usuario';
                        const statusClasses =
                          u.status === 'active'
                            ? 'bg-green-500/20 text-green-500'
                            : u.status === 'suspended'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400';
                        const dotColor =
                          u.status === 'active'
                            ? 'bg-green-500'
                            : u.status === 'suspended'
                            ? 'bg-yellow-500'
                            : 'bg-red-500';
                        const statusLabel =
                          u.status === 'active'
                            ? 'Activo'
                            : u.status === 'suspended'
                            ? 'Suspendido'
                            : 'Baneado';
                        const clubName =
                          clubs.find(c => c.id === u.clubId)?.name ||
                          u.club ||
                          '-';

                        return (
                          <tr
                            key={u.id}
                            className="border-b border-gray-800 hover:bg-dark-lighter cursor-pointer"
                            onClick={() => setEditingUser(u)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                                  <img src={u.avatar} alt={u.username} />
                                </div>
                                <span className="font-medium">{u.username}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">{u.email}</td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-2 py-1 text-xs rounded-full ${roleClasses}`}
                              >
                                {roleLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">{clubName}</td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusClasses}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${dotColor}`}></span>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center space-x-2">
                                <Link
                                  to={`/usuarios/${u.username}`}
                                  onClick={e => e.stopPropagation()}
                                  className="p-1 text-gray-400 hover:text-primary"
                                >
                                  <ExternalLink size={16} />
                                </Link>
                                <button
                                  className="p-1 text-gray-400 hover:text-primary"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditingUser(u);
                                  }}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="p-1 text-gray-400 hover:text-red-500"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setUserToDelete(u);
                                  }}
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'clubs' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestión de Clubes</h2>
                <button className="btn-primary flex items-center" onClick={() => setShowClubModal(true)}>
                  <Plus size={16} className="mr-2" />
                  Nuevo club
                </button>
              </div>
              
              <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                        <th className="px-4 py-3 text-left">Club</th>
                        <th className="px-4 py-3 text-center">Fundación</th>
                        <th className="px-4 py-3 text-center">DT</th>
                        <th className="px-4 py-3 text-center">Presupuesto</th>
                        <th className="px-4 py-3 text-center">Estilo</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubs.map(club => (
                        <tr key={club.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                                <img src={club.logo} alt={club.name} />
                              </div>
                              <span className="font-medium">{club.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{club.foundedYear}</td>
                          <td className="px-4 py-3 text-center">{club.manager}</td>
                          <td className="px-4 py-3 text-center">
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            }).format(club.budget)}
                          </td>
                          <td className="px-4 py-3 text-center">{club.playStyle}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <Link
                                to={`/clubes/${club.id}/plantilla`}
                                className="btn-secondary text-xs px-2 py-1"
                              >
                                Ver plantilla
                              </Link>
                              <button
                                className="p-1 text-gray-400 hover:text-primary"
                                onClick={() => setEditingClub(club)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-red-500"
                                onClick={() => setClubToDelete(club)}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'players' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestión de Jugadores</h2>
                <button className="btn-primary flex items-center" onClick={() => setShowPlayerModal(true)}>
                  <Plus size={16} className="mr-2" />
                  Nuevo jugador
                </button>
              </div>
              
              <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                        <th className="px-4 py-3 text-left">Jugador</th>
                        <th className="px-4 py-3 text-center">Pos</th>
                        <th className="px-4 py-3 text-center">Media</th>
                        <th className="px-4 py-3 text-center">Edad</th>
                        <th className="px-4 py-3 text-center">Club</th>
                        <th className="px-4 py-3 text-center">Valor</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.slice(0, 5).map(player => (
                        <tr key={player.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-bold">{player.id}</span>
                              </div>
                              <div>
                                <div className="font-medium">{player.name}</div>
                                <div className="text-xs text-gray-400">{player.nationality}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{player.position}</td>
                          <td className="px-4 py-3 text-center font-medium">{player.overall}</td>
                          <td className="px-4 py-3 text-center">{player.age}</td>
                          <td className="px-4 py-3 text-center">{clubs.find(c => c.id === player.clubId)?.name}</td>
                          <td className="px-4 py-3 text-center font-medium">
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            }).format(player.transferValue)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                className="p-1 text-gray-400 hover:text-primary"
                                onClick={() => setEditingPlayer(player)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-red-500"
                                onClick={() => setPlayerToDelete(player)}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'market' && <MarketAdminPanel />}

          {activeTab === 'tournaments' && <TournamentsAdminPanel />}

          {activeTab === 'news' && <NewsAdminPanel />}

          {activeTab === 'comments' && <CommentsAdminPanel />}

          {activeTab === 'activity' && <ActivityAdminPanel />}

          {activeTab === 'stats' && <StatsAdminPanel />}

          {activeTab === 'calendar' && <CalendarAdminPanel />}
        </div>
      </div>
      {showUserModal && <NewUserModal onClose={() => setShowUserModal(false)} />}
      {showClubModal && <NewClubModal onClose={() => setShowClubModal(false)} />}
      {showPlayerModal && <NewPlayerModal onClose={() => setShowPlayerModal(false)} />}
      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}
      {editingClub && (
        <EditClubModal club={editingClub} onClose={() => setEditingClub(null)} />
      )}
      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
        />
      )}
      {userToDelete && (
        <ConfirmDeleteModal
          message="¿Eliminar este usuario?"
          onConfirm={() => removeUser(userToDelete.id)}
          onClose={() => setUserToDelete(null)}
        />
      )}
      {clubToDelete && (
        <ConfirmDeleteModal
          message="¿Eliminar este club?"
          onConfirm={() => removeClub(clubToDelete.id)}
          onClose={() => setClubToDelete(null)}
        />
      )}
      {playerToDelete && (
        <ConfirmDeleteModal
          message="¿Eliminar este jugador?"
          onConfirm={() => removePlayer(playerToDelete.id)}
          onClose={() => setPlayerToDelete(null)}
        />
      )}
    </div>
  );
};

export default Admin;
 