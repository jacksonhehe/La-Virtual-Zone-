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
import PageHeader from '../components/common/PageHeader';
import ProgressRing from '../components/common/ProgressRing';
import FlipCard from '../components/common/FlipCard';

const UserPanel = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { clubs, players } = useDataStore();
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
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark">
      <PageHeader 
        title={`Bienvenido, ${user.username}`}
        subtitle="Aquí puedes gestionar tu perfil, seguir tu progreso y configurar tu cuenta."
        image="https://images.unsplash.com/photo-1544194215-541c2d3561a4?w=1600&auto=format&fit=crop&fm=webp&ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw1fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar mejorado */}
          <div className="lg:col-span-1">
            <div className="card-elevated p-8 text-center mb-6 shadow-consistent-xl">
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
                <div className="mt-4 p-4 bg-gradient-to-r from-dark-light to-dark rounded-xl border border-gray-800/50">
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
            
            <div className="card-elevated overflow-hidden shadow-consistent-xl">
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center p-3 rounded-lg transition-smooth ${
                    activeTab === 'profile' 
                      ? 'bg-primary/20 text-primary font-medium' 
                      : 'text-gray-300 hover:bg-dark/50 hover:text-white'
                  }`}
                >
                  <User size={20} className="mr-3" />
                  <span>Mi Perfil</span>
                </button>
                
                {user.role === 'dt' && (
                  <button
                    onClick={() => setActiveTab('club')}
                    className={`w-full flex items-center p-3 mt-1 rounded-lg transition-smooth ${
                      activeTab === 'club' 
                        ? 'bg-primary/20 text-primary font-medium' 
                        : 'text-gray-300 hover:bg-dark/50 hover:text-white'
                    }`}
                  >
                    <Trophy size={20} className="mr-3" />
                    <span>Mi Club</span>
                  </button>
                )}
                
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full flex items-center p-3 mt-1 rounded-lg transition-smooth ${
                    activeTab === 'activity' 
                      ? 'bg-primary/20 text-primary font-medium' 
                      : 'text-gray-300 hover:bg-dark/50 hover:text-white'
                  }`}
                >
                  <Activity size={20} className="mr-3" />
                  <span>Actividad</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('community')}
                  className={`w-full flex items-center p-3 mt-1 rounded-lg transition-smooth ${
                    activeTab === 'community' 
                      ? 'bg-primary/20 text-primary font-medium' 
                      : 'text-gray-300 hover:bg-dark/50 hover:text-white'
                  }`}
                >
                  <Users size={20} className="mr-3" />
                  <span>Comunidad</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center p-3 mt-1 rounded-lg transition-smooth ${
                    activeTab === 'settings' 
                      ? 'bg-primary/20 text-primary font-medium' 
                      : 'text-gray-300 hover:bg-dark/50 hover:text-white'
                  }`}
                >
                  <Settings size={20} className="mr-3" />
                  <span>Configuración</span>
                </button>
                
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center p-3 mt-2 text-white font-medium transition-all duration-200 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                  >
                    <Shield size={20} className="mr-3 text-red-400" />
                    <span className="text-red-400">Panel de Admin</span>
                  </button>
                )}
              </nav>
              
              <div className="p-2 mt-2 border-t border-gray-800/50">
                <button
                  onClick={logout}
                  className="w-full flex items-center p-3 rounded-lg text-gray-400 hover:bg-dark/50 hover:text-white transition-smooth"
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
                <div className="card-elevated p-8">
                  <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Mi Perfil
                      </h2>
                      <p className="text-gray-400">Gestiona tu información personal y estadísticas</p>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-gradient-primary flex items-center px-6 py-3 rounded-lg"
                      >
                        <Edit size={18} className="mr-2" />
                        Editar Perfil
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveProfile}
                          className="btn-gradient-success flex items-center px-6 py-3 rounded-lg"
                        >
                          <Save size={18} className="mr-2" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-gradient-secondary flex items-center px-6 py-3 rounded-lg"
                        >
                          <X size={18} className="mr-2" />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="card-subtle p-6">
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
                      <div className="card-subtle p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center">
                          <TrendingUp size={24} className="mr-3 text-primary" />
                          Estadísticas y Logros
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                          {/* Nivel */}
                          <FlipCard
                            className="bg-dark/50 border border-primary/20 shadow-lg"
                            front={
                              <div className="flex flex-col items-center justify-center h-full p-4">
                                <ProgressRing value={levelProgress} color="var(--primary)" />
                                <p className="text-sm text-gray-400 mt-2">Nivel</p>
                              </div>
                            }
                            back={
                              <div className="flex flex-col items-center justify-center h-full p-4">
                                <p className="font-medium text-white text-center text-sm">XP: {user.xp || 0}</p>
                                <p className="text-xs text-gray-400 mt-1">Hasta siguiente nivel: {nextLevelXp - (user.xp || 0)} XP</p>
                              </div>
                            }
                          />
                          {/* Experiencia */}
                          <div className="text-center p-4 bg-dark/50 rounded-xl border border-green-500/20 shadow-lg hover-lift transition-smooth">
                            <div className="text-3xl font-bold text-green-400 mb-1">{user.xp || 0}</div>
                            <div className="text-sm text-gray-400">Experiencia</div>
                          </div>
                          {/* Logros */}
                          <div className="text-center p-4 bg-dark/50 rounded-xl border border-yellow-500/20 shadow-lg hover-lift transition-smooth">
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
                                <div key={achievement} className="flex items-center p-3 bg-dark-lighter/50 rounded-lg border border-gray-700/50 shadow-md hover-lift transition-smooth">
                                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                                    <Trophy size={20} className="text-white" />
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
                  <div className="card-elevated p-8">
                    <div className="text-center">
                      <Trophy size={64} className="mx-auto mb-6 text-primary/50" />
                      <h3 className="text-2xl font-bold mb-4">¿Quieres ser Director Técnico?</h3>
                      <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                        Para participar en la Liga Master necesitas convertirte en Director Técnico y administrar un club. 
                        Solicita un puesto para la próxima temporada y comienza tu carrera como DT.
                      </p>
                      <button
                        className="btn-gradient-primary px-8 py-4 rounded-lg text-lg font-medium"
                        onClick={() => setShowRequestModal(true)}
                      >
                        Solicitar participación como DT
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="card-elevated p-8">
                  <div className="text-center">
                    <Eye size={64} className="mx-auto mb-6 text-primary/50" />
                    <h3 className="text-2xl font-bold mb-4">Perfil Público</h3>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                      Tu perfil público muestra tu información a otros usuarios de la comunidad. 
                      Puedes personalizar lo que se muestra y gestionar tu visibilidad.
                    </p>
                    <button
                      className="btn-gradient-secondary px-8 py-4 rounded-lg text-lg font-medium"
                      onClick={() => navigate(`/perfil/${user.id}`)}
                    >
                      Ver mi perfil público
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Club tab (solo para DT) */}
            {activeTab === 'club' && userClub && (
              <div className="space-y-8">
                <div className="card-elevated p-8">
                  <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                    <div className="flex items-center">
                      <img src={userClub.logo} alt={userClub.name} className="w-16 h-16 mr-4 rounded-lg"/>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          {userClub.name}
                        </h2>
                        <p className="text-gray-400">Panel de Director Técnico</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/dt-dashboard')}
                      className="btn-gradient-primary flex items-center px-6 py-3 rounded-lg"
                    >
                      <Trophy size={18} className="mr-2" />
                      Ir al Panel de DT
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="card-subtle p-6 col-span-1 md:col-span-2 lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-4">Estadísticas</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-dark/50 rounded-lg">
                        <span className="text-gray-400">Presupuesto</span>
                        <span className="font-medium text-green-400">${userClub.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-dark/50 rounded-lg">
                        <span className="text-gray-400">Jugadores</span>
                        <span className="font-medium">{players.filter(p => p.clubId === userClub.id).length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-dark/50 rounded-lg">
                        <span className="text-gray-400">Moral</span>
                        <span className="font-medium">{userClub.morale || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-dark/50 rounded-lg">
                        <span className="text-gray-400">Reputación</span>
                        <span className="font-medium">{userClub.reputation || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-subtle p-6 md:col-span-2">
                    <h3 className="text-xl font-semibold mb-4">Próximo Partido</h3>
                    <div className="flex items-center justify-around text-center">
                      <div className="flex flex-col items-center w-1/3">
                        <img src={userClub.logo} alt={userClub.name} className="w-20 h-20 mb-2"/>
                        <span className="font-bold text-lg">{userClub.name}</span>
                      </div>
                      <div className="w-1/3">
                        <span className="text-4xl font-bold text-gray-500">VS</span>
                        <p className="text-sm text-gray-400 mt-2">
                          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-center w-1/3">
                        <img src="https://ui-avatars.com/api/?name=AP&background=3b82f6&color=fff&size=128&bold=true" alt="Atlético Pixelado" className="w-20 h-20 mb-2"/>
                        <span className="font-bold text-lg">Atlético Pixelado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity tab */}
            {activeTab === 'activity' && (
              <div className="space-y-8">
                <div className="card-elevated p-8">
                  <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Actividad Reciente
                  </h2>
                  <div className="space-y-4">
                    {/* Ejemplo de actividad */}
                    <div className="flex items-center p-4 bg-dark/50 rounded-lg border border-gray-800/50">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mr-4">
                        <Activity size={20} className="text-primary"/>
                      </div>
                      <div>
                        <p className="font-medium text-white">Has iniciado sesión.</p>
                        <p className="text-sm text-gray-400">Hace 5 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-dark/50 rounded-lg border border-gray-800/50">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mr-4">
                        <Trophy size={20} className="text-yellow-400"/>
                      </div>
                      <div>
                        <p className="font-medium text-white">Has desbloqueado el logro "Primera Victoria".</p>
                        <p className="text-sm text-gray-400">Hace 2 horas</p>
                      </div>
                    </div>
                     <div className="flex items-center p-4 bg-dark/50 rounded-lg border border-gray-800/50">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mr-4">
                        <ShoppingCart size={20} className="text-green-400"/>
                      </div>
                      <div>
                        <p className="font-medium text-white">Has comprado "Escudo Premium - Neón".</p>
                        <p className="text-sm text-gray-400">Hace 1 día</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Community tab */}
            {activeTab === 'community' && (
              <div className="card-elevated p-8">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Comunidad
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="card-subtle p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Users size={20} className="mr-3 text-primary" />
                      Usuarios Seguidos
                    </h3>
                    {followingUsers.length > 0 ? (
                      <div className="space-y-3">
                        {/* Mapeo de usuarios seguidos */}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No sigues a ningún usuario.</p>
                    )}
                  </div>
                  <div className="card-subtle p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Trophy size={20} className="mr-3 text-primary" />
                      Clubes Seguidos
                    </h3>
                    {followingClubs.length > 0 ? (
                      <div className="space-y-3">
                        {/* Mapeo de clubes seguidos */}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No sigues a ningún club.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <div className="card-elevated p-8">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Configuración
                </h2>
                <div className="space-y-8">
                  <div className="card-subtle p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Bell size={20} className="mr-3 text-primary" />
                      Notificaciones
                    </h3>
                    <div className="flex items-center justify-between p-3 bg-dark/50 rounded-lg">
                      <span className="text-gray-300">Notificaciones por correo</span>
                      <button className="w-12 h-6 rounded-full bg-gray-600 flex items-center p-1">
                        <span className="w-4 h-4 rounded-full bg-white block"></span>
                      </button>
                    </div>
                  </div>
                  <div className="card-subtle p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Lock size={20} className="mr-3 text-primary" />
                      Cambiar Contraseña
                    </h3>
                    <div className="space-y-4">
                      <input type="password" placeholder="Contraseña actual" className="input w-full bg-dark" />
                      <input type="password" placeholder="Nueva contraseña" className="input w-full bg-dark" />
                      <input type="password" placeholder="Confirmar nueva contraseña" className="input w-full bg-dark" />
                      <button className="btn-gradient-primary px-6 py-2 rounded-lg">Guardar Cambios</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <RequestClubModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
};

export default UserPanel;
 