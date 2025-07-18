import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Trophy, 
  Clipboard, 
  Users, 
  ShoppingCart, 
  Bell,
  Star,
  Edit,
  Save,
  X,
  Crown,
  Award,
  Calendar,
  Mail,
  Shield,
  TrendingUp,
  Activity,
  Heart,
  Eye,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import RequestClubModal from '../components/common/RequestClubModal';
import { xpForNextLevel } from '../utils/helpers';

const UserPanel = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { clubs } = useDataStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  
  // Initialize following property if it doesn't exist
  const following = user?.following || 0;
  
  // Get user's club if they are a DT
  const userClub = user?.role === 'dt' && user?.clubId
    ? clubs.find(club => club.id === user.clubId)
    : null;

  // Calculate XP progress for the level bar
  const currentLevelXp = xpForNextLevel((user?.level ?? 1) - 1);
  const nextLevelXp = xpForNextLevel(user?.level ?? 1);
  const levelProgress = user && user.xp
    ? Math.max(0, Math.min(100, ((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))
    : 0;
  const [levelPulse, setLevelPulse] = useState(false);
  const prevLevel = useRef(levelProgress);

  useEffect(() => {
    if (prevLevel.current !== levelProgress) {
      setLevelPulse(true);
      const id = setTimeout(() => setLevelPulse(false), 1000);
      prevLevel.current = levelProgress;
      return () => clearTimeout(id);
    }
  }, [levelProgress]);

  // Update edit form when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);
  
  // Initialize achievements array if it doesn't exist
  const achievements = (user as any)?.achievements || [];

  // Handle form submission
  const handleSaveProfile = () => {
    if (user) {
      updateUser({
        ...user,
        ...editForm
      });
      setIsEditing(false);
    }
  };

  // Handle form cancellation
  const handleCancelEdit = () => {
    setEditForm({
      email: user?.email || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  // Mock data for following (since we changed the type)
  const followingUsers: string[] = [];
  const followingClubs: string[] = [];

  // Get role badge info
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', icon: Crown, color: 'from-red-500 to-pink-500', bgColor: 'bg-red-500/10' };
      case 'dt':
        return { label: 'Director Técnico', icon: Trophy, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10' };
      default:
        return { label: 'Usuario', icon: User, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-500/10' };
    }
  };

  const roleInfo = getRoleInfo(user?.role || 'user');
  const RoleIcon = roleInfo.icon;

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark to-dark-lighter">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar mejorado */}
          <div className="lg:col-span-1">
            <div className="card p-8 text-center mb-6 bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
              <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden mb-6 bg-gradient-to-br from-primary to-secondary p-1">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full">
                    <User size={40} className="text-primary" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-dark rounded-full p-1 border-2 border-dark-lighter">
                  <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-dark text-xs font-bold rounded-full">
                    {user.level || 1}
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {user.username}
              </h2>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${roleInfo.bgColor} bg-gradient-to-r ${roleInfo.color} bg-clip-text text-transparent`}>
                <RoleIcon size={16} className="mr-2" />
                {roleInfo.label}
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Nivel {user.level || 1}</span>
                  <span>Nivel {(user.level || 1) + 1}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 flex-1 bg-dark rounded-full overflow-hidden border border-gray-700">
                    <div
                      className={`h-full bg-gradient-to-r from-primary to-secondary ${levelPulse ? 'animate-pulse' : ''} transition-all duration-300`}
                      style={{ width: `${levelProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs w-12 text-right font-medium">{Math.round(levelProgress)}%</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {user.xp || 0} / {nextLevelXp} XP
                </div>
              </div>
              
              {user.role === 'dt' && userClub && (
                <div className="mt-4 p-4 bg-gradient-to-r from-dark-lighter to-dark rounded-xl border border-gray-800/50">
                  <div className="flex items-center justify-center">
                    <img 
                      src={userClub.logo} 
                      alt={userClub.name} 
                      className="w-10 h-10 mr-3 rounded-full"
                    />
                    <span className="font-medium text-sm">{userClub.name}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="card overflow-hidden bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
              <nav>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center p-4 transition-all duration-200 ${
                    activeTab === 'profile' 
                      ? 'bg-gradient-to-r from-primary to-secondary text-dark font-medium' 
                      : 'text-gray-300 hover:bg-dark hover:text-white'
                  }`}
                >
                  <User size={20} className="mr-3" />
                  <span>Mi Perfil</span>
                </button>
                
                {user.role === 'dt' && (
                  <button
                    onClick={() => setActiveTab('club')}
                    className={`w-full flex items-center p-4 transition-all duration-200 ${
                      activeTab === 'club' 
                        ? 'bg-gradient-to-r from-primary to-secondary text-dark font-medium' 
                        : 'text-gray-300 hover:bg-dark hover:text-white'
                    }`}
                  >
                    <Trophy size={20} className="mr-3" />
                    <span>Mi Club</span>
                  </button>
                )}
                
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full flex items-center p-4 transition-all duration-200 ${
                    activeTab === 'activity' 
                      ? 'bg-gradient-to-r from-primary to-secondary text-dark font-medium' 
                      : 'text-gray-300 hover:bg-dark hover:text-white'
                  }`}
                >
                  <Activity size={20} className="mr-3" />
                  <span>Actividad</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('community')}
                  className={`w-full flex items-center p-4 transition-all duration-200 ${
                    activeTab === 'community' 
                      ? 'bg-gradient-to-r from-primary to-secondary text-dark font-medium' 
                      : 'text-gray-300 hover:bg-dark hover:text-white'
                  }`}
                >
                  <Users size={20} className="mr-3" />
                  <span>Comunidad</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center p-4 transition-all duration-200 ${
                    activeTab === 'settings' 
                      ? 'bg-gradient-to-r from-primary to-secondary text-dark font-medium' 
                      : 'text-gray-300 hover:bg-dark hover:text-white'
                  }`}
                >
                  <Settings size={20} className="mr-3" />
                  <span>Configuración</span>
                </button>
                
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center p-4 rounded-md bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium transition-all duration-200 hover:from-red-600 hover:to-pink-600"
                  >
                    <Settings size={20} className="mr-3" />
                    <span>Panel de Admin</span>
                  </button>
                )}
              </nav>
              
              <div className="border-t border-gray-800 p-4">
                <button
                  onClick={logout}
                  className="w-full flex items-center p-3 rounded-md text-gray-400 hover:bg-dark hover:text-white transition-all duration-200"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content mejorado */}
          <div className="lg:col-span-3">
            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="card p-8 bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Mi Perfil
                      </h2>
                      <p className="text-gray-400">Gestiona tu información personal y estadísticas</p>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-primary flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 shadow-lg"
                      >
                        <Edit size={18} className="mr-2" />
                        Editar Perfil
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveProfile}
                          className="btn-primary flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                        >
                          <Save size={18} className="mr-2" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-outline flex items-center px-6 py-3 border-gray-600 hover:bg-gray-800 transition-all duration-200"
                        >
                          <X size={18} className="mr-2" />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 flex items-center">
                          <User size={24} className="mr-3 text-primary" />
                          Información Personal
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center p-3 bg-dark-lighter/50 rounded-lg">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                              <User size={20} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm text-gray-400 mb-1">Nombre de usuario</label>
                              <div className="font-medium text-white">{user.username}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 bg-dark-lighter/50 rounded-lg">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                              <Mail size={20} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm text-gray-400 mb-1">Correo electrónico</label>
                              {isEditing ? (
                                <input
                                  type="email"
                                  className="input w-full bg-dark border-gray-700 focus:border-primary"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                />
                              ) : (
                                <div className="font-medium text-white">{user.email}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 bg-dark-lighter/50 rounded-lg">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                              <Shield size={20} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm text-gray-400 mb-1">Rol</label>
                              <div className="font-medium text-white">
                                {user.role === 'dt' ? 'Director Técnico' : 
                                 user.role === 'admin' ? 'Administrador' : 'Usuario Estándar'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 bg-dark-lighter/50 rounded-lg">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                              <Calendar size={20} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm text-gray-400 mb-1">Fecha de registro</label>
                              <div className="font-medium text-white">
                                {user.joinDate ? new Date(user.joinDate).toLocaleDateString('es-ES') : '-'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start p-3 bg-dark-lighter/50 rounded-lg">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                              <Heart size={20} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm text-gray-400 mb-1">Biografía</label>
                              {isEditing ? (
                                <textarea
                                  className="input w-full bg-dark border-gray-700 focus:border-primary"
                                  rows={3}
                                  value={editForm.bio}
                                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                  placeholder="Cuéntanos sobre ti..."
                                />
                              ) : (
                                <div className="font-medium text-white">{user.bio || 'Sin biografía'}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 flex items-center">
                          <TrendingUp size={24} className="mr-3 text-primary" />
                          Estadísticas y Logros
                        </h3>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-primary/20 shadow-lg">
                            <div className="text-3xl font-bold text-primary mb-1">{user.level || 1}</div>
                            <div className="text-sm text-gray-400">Nivel</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/20 shadow-lg">
                            <div className="text-3xl font-bold text-green-400 mb-1">{user.xp || 0}</div>
                            <div className="text-sm text-gray-400">Experiencia</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/20 shadow-lg">
                            <div className="text-3xl font-bold text-yellow-400 mb-1">{achievements.length}</div>
                            <div className="text-sm text-gray-400">Logros</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <Award size={20} className="mr-2 text-primary" />
                            Logros Desbloqueados
                          </h4>
                          <div className="space-y-3">
                            {achievements.length > 0 ? (
                              achievements.map((achievement: string) => (
                                <div key={achievement} className="flex items-center p-3 bg-dark-lighter/50 rounded-lg border border-gray-700/50 shadow-md">
                                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                                    <Trophy size={20} className="text-dark" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {achievement === 'founder' ? 'Fundador' : 
                                       achievement === 'first_win' ? 'Primera Victoria' :
                                       achievement === 'first_transfer' ? 'Primer Fichaje' :
                                       achievement}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      {achievement === 'founder' ? 'Fundador de La Virtual Zone' : 
                                       achievement === 'first_win' ? 'Ganaste tu primer partido' :
                                       achievement === 'first_transfer' ? 'Completaste tu primer fichaje' :
                                       'Logro desbloqueado'}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <Award size={48} className="mx-auto mb-4 text-gray-600" />
                                <p className="text-lg font-medium mb-2">No has desbloqueado logros todavía</p>
                                <p className="text-sm">Participa en partidos y torneos para desbloquear logros</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {user.role !== 'dt' && (
                  <div className="card p-8 bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
                    <div className="text-center">
                      <Trophy size={64} className="mx-auto mb-6 text-primary/50" />
                      <h3 className="text-2xl font-bold mb-4">¿Quieres ser Director Técnico?</h3>
                      <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                        Para participar en la Liga Master necesitas convertirte en Director Técnico y administrar un club. 
                        Solicita un puesto para la próxima temporada y comienza tu carrera como DT.
                      </p>
                      <button
                        className="btn-primary px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 text-lg font-medium shadow-lg"
                        onClick={() => setShowRequestModal(true)}
                      >
                        Solicitar participación como DT
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="card p-8 bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
                  <div className="text-center">
                    <Eye size={64} className="mx-auto mb-6 text-primary/50" />
                    <h3 className="text-2xl font-bold mb-4">Perfil Público</h3>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                      Tu perfil público muestra tu información a otros usuarios de la comunidad. 
                      Puedes personalizar lo que se muestra y gestionar tu visibilidad.
                    </p>
                    <a 
                      href={`/usuarios/${user.username}`}
                      className="btn-secondary px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-lg font-medium shadow-lg"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver mi perfil público
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {/* Club tab (only for DT) */}
            {activeTab === 'club' && user.role === 'dt' && userClub && (
              <div className="space-y-8">
                <div className="card p-8 bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                    <div className="flex items-center mb-6 md:mb-0">
                      <img 
                        src={userClub.logo} 
                        alt={userClub.name} 
                        className="w-20 h-20 mr-6 rounded-xl"
                      />
                      <div>
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          {userClub.name}
                        </h2>
                        <p className="text-gray-400">
                          Fundado en {userClub.foundedYear} • {userClub.stadium}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`/liga-master/club/${userClub.slug}`}
                        className="btn-secondary px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg"
                      >
                        Ver Perfil
                      </a>
                      <a
                        href={`/liga-master/club/${userClub.slug}/plantilla`}
                        className="btn-outline px-6 py-3 border-gray-600 hover:bg-gray-800 transition-all duration-200"
                      >
                        Plantilla
                      </a>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/20 text-center shadow-lg">
                      <div className="text-3xl font-bold text-green-400 mb-2">{(userClub as any).wins || 0}</div>
                      <div className="text-sm text-gray-400">Victorias</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 p-6 rounded-xl border border-gray-500/20 text-center shadow-lg">
                      <div className="text-3xl font-bold text-gray-400 mb-2">{(userClub as any).draws || 0}</div>
                      <div className="text-sm text-gray-400">Empates</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-6 rounded-xl border border-red-500/20 text-center shadow-lg">
                      <div className="text-3xl font-bold text-red-400 mb-2">{(userClub as any).losses || 0}</div>
                      <div className="text-sm text-gray-400">Derrotas</div>
                    </div>
                  </div>
                  
                  <div className="bg-dark/50 p-6 rounded-xl border border-gray-800/50 shadow-lg">
                    <h4 className="text-xl font-semibold mb-4 flex items-center">
                      <Shield size={24} className="mr-3 text-primary" />
                      Información del Club
                    </h4>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="flex items-center p-3 bg-dark-lighter/50 rounded-lg">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                          <TrendingUp size={20} className="text-primary" />
                        </div>
                        <div>
                          <span className="text-gray-400">Presupuesto:</span>
                          <div className="font-medium text-white">{userClub.budget ? `$${userClub.budget.toLocaleString()}` : 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-dark-lighter/50 rounded-lg">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                          <Trophy size={20} className="text-primary" />
                        </div>
                        <div>
                          <span className="text-gray-400">Estadio:</span>
                          <div className="font-medium text-white">{userClub.stadium}</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-dark-lighter/50 rounded-lg">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                          <Activity size={20} className="text-primary" />
                        </div>
                        <div>
                          <span className="text-gray-400">Estilo de juego:</span>
                          <div className="font-medium text-white">{userClub.playStyle}</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-dark-lighter/50 rounded-lg">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                          <Calendar size={20} className="text-primary" />
                        </div>
                        <div>
                          <span className="text-gray-400">Fundado:</span>
                          <div className="font-medium text-white">{userClub.foundedYear}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Activity tab */}
            {activeTab === 'activity' && (
              <div className="space-y-8">
                <div className="card p-8 bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Actividad Reciente
                  </h2>
                  <p className="text-gray-400 mb-8">Tu historial de actividades y logros</p>
                  
                  <div className="space-y-6">
                    <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50 shadow-lg">
                      <h3 className="text-xl font-semibold mb-6 flex items-center">
                        <Activity size={24} className="mr-3 text-primary" />
                        Últimas Actividades
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center p-4 bg-dark-lighter/50 rounded-lg border border-gray-700/50 shadow-md">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                            <Trophy size={20} className="text-dark" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">Logro desbloqueado: Fundador</div>
                            <div className="text-sm text-gray-400">Hace 2 días</div>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-dark-lighter/50 rounded-lg border border-gray-700/50 shadow-md">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                            <User size={20} className="text-dark" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">Cuenta creada</div>
                            <div className="text-sm text-gray-400">Hace 1 semana</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Community tab */}
            {activeTab === 'community' && (
              <div className="space-y-8">
                <div className="card p-8 bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Comunidad
                  </h2>
                  <p className="text-gray-400 mb-8">Conecta con otros usuarios y clubes</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50 shadow-lg">
                      <h3 className="text-xl font-semibold mb-6 flex items-center">
                        <Users size={24} className="mr-3 text-primary" />
                        Usuarios seguidos
                      </h3>
                      <div className="space-y-4">
                        {followingUsers.length > 0 ? (
                          followingUsers.map((followedUser: string, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-dark-lighter/50 rounded-xl border border-gray-700/50 shadow-md">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mr-4">
                                  <User size={20} className="text-dark" />
                                </div>
                                <span className="font-medium text-white">{followedUser}</span>
                              </div>
                              <button className="text-xs text-gray-400 hover:text-white transition-colors">
                                Ver perfil
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Users size={48} className="mx-auto mb-4 text-gray-600" />
                            <p className="text-lg font-medium mb-2">No sigues a ningún usuario</p>
                            <p className="text-sm">Descubre usuarios interesantes para seguir</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50 shadow-lg">
                      <h3 className="text-xl font-semibold mb-6 flex items-center">
                        <Trophy size={24} className="mr-3 text-primary" />
                        Clubes seguidos
                      </h3>
                      <div className="space-y-4">
                        {followingClubs.length > 0 ? (
                          followingClubs.map((followedClub: string, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-dark-lighter/50 rounded-xl border border-gray-700/50 shadow-md">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-secondary to-blue-500 rounded-lg flex items-center justify-center mr-4">
                                  <Trophy size={20} className="text-dark" />
                                </div>
                                <span className="font-medium text-white">{followedClub}</span>
                              </div>
                              <button className="text-xs text-gray-400 hover:text-white transition-colors">
                                Ver club
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Trophy size={48} className="mx-auto mb-4 text-gray-600" />
                            <p className="text-lg font-medium mb-2">No sigues a ningún club</p>
                            <p className="text-sm">Descubre clubes interesantes para seguir</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div className="card p-8 bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Configuración de Cuenta
                  </h2>
                  <p className="text-gray-400 mb-8">Gestiona tus preferencias y configuración</p>
                  
                  <form className="space-y-8">
                    <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50 shadow-lg">
                      <h3 className="text-xl font-semibold mb-6 flex items-center">
                        <User size={24} className="mr-3 text-primary" />
                        Información Personal
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-center p-4 bg-dark-lighter/50 rounded-lg">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                            <User size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Nombre de usuario
                            </label>
                            <input
                              type="text"
                              className="input w-full bg-dark border-gray-700 focus:border-primary"
                              value={user.username}
                              disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              El nombre de usuario no se puede cambiar
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-4 bg-dark-lighter/50 rounded-lg">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                            <Mail size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Correo electrónico
                            </label>
                            <input
                              type="email"
                              className="input w-full bg-dark border-gray-700 focus:border-primary"
                              defaultValue={user.email}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-start p-4 bg-dark-lighter/50 rounded-lg">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                            <Heart size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Biografía
                            </label>
                            <textarea
                              className="input w-full bg-dark border-gray-700 focus:border-primary"
                              rows={3}
                              defaultValue={user.bio || ''}
                              placeholder="Cuéntanos sobre ti..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50 shadow-lg">
                      <h3 className="text-xl font-semibold mb-6 flex items-center">
                        <Bell size={24} className="mr-3 text-primary" />
                        Notificaciones
                      </h3>
                      
                      <div className="space-y-4">
                        <label className="flex items-center p-3 bg-dark-lighter/50 rounded-lg hover:bg-dark-lighter/70 transition-colors shadow-md">
                          <input type="checkbox" className="mr-4" defaultChecked />
                          <span className="text-white">Notificaciones de partidos</span>
                        </label>
                        <label className="flex items-center p-3 bg-dark-lighter/50 rounded-lg hover:bg-dark-lighter/70 transition-colors shadow-md">
                          <input type="checkbox" className="mr-4" defaultChecked />
                          <span className="text-white">Notificaciones de fichajes</span>
                        </label>
                        <label className="flex items-center p-3 bg-dark-lighter/50 rounded-lg hover:bg-dark-lighter/70 transition-colors shadow-md">
                          <input type="checkbox" className="mr-4" />
                          <span className="text-white">Notificaciones de la comunidad</span>
                        </label>
                        <label className="flex items-center p-3 bg-dark-lighter/50 rounded-lg hover:bg-dark-lighter/70 transition-colors shadow-md">
                          <input type="checkbox" className="mr-4" defaultChecked />
                          <span className="text-white">Notificaciones de logros</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50 shadow-lg">
                      <h3 className="text-xl font-semibold mb-6 flex items-center">
                        <Lock size={24} className="mr-3 text-primary" />
                        Privacidad
                      </h3>
                      
                      <div className="space-y-4">
                        <label className="flex items-center p-3 bg-dark-lighter/50 rounded-lg hover:bg-dark-lighter/70 transition-colors shadow-md">
                          <input type="checkbox" className="mr-4" defaultChecked />
                          <span className="text-white">Perfil público visible</span>
                        </label>
                        <label className="flex items-center p-3 bg-dark-lighter/50 rounded-lg hover:bg-dark-lighter/70 transition-colors shadow-md">
                          <input type="checkbox" className="mr-4" />
                          <span className="text-white">Mostrar estadísticas detalladas</span>
                        </label>
                        <label className="flex items-center p-3 bg-dark-lighter/50 rounded-lg hover:bg-dark-lighter/70 transition-colors shadow-md">
                          <input type="checkbox" className="mr-4" defaultChecked />
                          <span className="text-white">Permitir mensajes de otros usuarios</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button type="submit" className="btn-primary px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 text-lg font-medium shadow-lg">
                        Guardar cambios
                      </button>
                      <button type="button" className="btn-outline px-8 py-4 border-gray-600 hover:bg-gray-800 transition-all duration-200 text-lg font-medium">
                        Restablecer
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="card p-8 bg-gradient-to-br from-dark-lighter to-dark border border-gray-800/50 shadow-xl">
                  <h3 className="text-2xl font-semibold mb-6 text-red-400 flex items-center">
                    <Lock size={24} className="mr-3" />
                    Zona de Peligro
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 shadow-lg">
                      <h4 className="font-medium mb-3 text-red-400">Eliminar cuenta</h4>
                      <p className="text-gray-300 text-sm mb-4">
                        Esta acción no se puede deshacer. Se eliminarán todos tus datos, logros y progreso.
                      </p>
                      <button className="btn-outline px-6 py-3 text-red-400 border-red-400 hover:bg-red-400 hover:text-dark transition-all duration-200">
                        Eliminar cuenta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {showRequestModal && (
          <RequestClubModal
            onClose={() => setShowRequestModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default UserPanel;
 