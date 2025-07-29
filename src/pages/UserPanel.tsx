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
  Lock,
  Camera,
  Sun,
  Moon,
  Globe,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import usePersistentState from '../hooks/usePersistentState';
import ConfirmModal from '../components/common/ConfirmModal';
import RequestClubModal from '../components/common/RequestClubModal';
import { xpForNextLevel } from '../utils/helpers';
import PageHeader from '../components/common/PageHeader';
import ProgressRing from '../components/common/ProgressRing';

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

  /* ================= Preferencias de Usuario ================= */
  const [language, setLanguage] = usePersistentState<'es' | 'en'>('vz_language', 'es');
  const [notificationsEnabled, setNotificationsEnabled] = usePersistentState<boolean>('vz_notifications', true);
  const [theme, setTheme] = usePersistentState<'dark' | 'light'>('vz_theme', 'dark');

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  /* ================= Cambio de contraseña ================= */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChangeSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Completa todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setPwLoading(true);
    // Simulación de llamada API
    setTimeout(() => {
      setPwLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Contraseña actualizada correctamente');
    }, 1500);
  };

  /* ================= Confirmación de logout ================= */
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
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

  // Color dinámico de la barra según porcentaje
  const progressColorClass = levelProgress >= 70
    ? 'bg-green-500'
    : levelProgress >= 40
      ? 'bg-yellow-500'
      : 'bg-red-500';

  // XP restante para siguiente nivel
  const xpRemaining = Math.max(0, nextLevelXp - ((user?.xp) || 0));

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
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
              <div className="relative mx-auto w-24 h-24 rounded-full overflow-visible mb-6 bg-gradient-to-br from-primary to-secondary p-1 ring-4 ring-primary/20 shadow-lg shadow-primary/30">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {user.avatar ? (
                    <SmartAvatar src={user.avatar} name={user.username} size={96} className="w-24 h-24 ring-1 ring-violet-500/30" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full">
                      <User size={40} className="text-primary" />
                    </div>
                  )}
                  {true && (
                    <>
                      <button
                        className="absolute bottom-1 right-1 z-10 bg-primary p-1 rounded-full text-white hover:bg-primary/80 w-6 h-6 flex items-center justify-center transform hover:scale-110 transition-transform"
                        onClick={() => document.getElementById('avatarUpload')?.click()}
                        title="Cambiar foto"
                      >
                        <Camera size={14} />
                      </button>
                      <input
                        id="avatarUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e)=>{
                          const file=e.target.files?.[0];
                          if(!file) return;
                          const reader=new FileReader();
                          reader.onload=()=>{
                            useAuthStore.getState().updateUser({avatar: reader.result as string});
                            toast.success('Avatar actualizado');
                          };
                          if (file.size>2*1024*1024){toast.error('La imagen supera 2 MB');return;}
                          reader.readAsDataURL(file);
                        }}
                      />
                    </>
                  )}
                </div>
                <div className="absolute -bottom-3 -right-3 bg-dark rounded-full p-1 border-2 border-dark-lighter">
                  <div className={`w-12 h-12 flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-dark text-sm font-extrabold rounded-full ${levelPulse ? 'ring-2 ring-primary/80 animate-pulse' : ''}`}>
                    {user.level || 1}
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
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
                      className={`h-full ${progressColorClass} ${levelPulse ? 'animate-pulse' : ''} transition-all duration-300`}
                      style={{ width: `${levelProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs w-12 text-right font-medium">{Math.round(levelProgress)}%</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {Math.max(0, nextLevelXp - (user.xp || 0))} XP restantes para el siguiente nivel
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
              <nav className="p-2 space-y-1">
                {/* Grupo: Mi cuenta */}
                <p className="text-xs text-gray-500 uppercase px-3 mt-2 mb-1">Mi cuenta</p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center p-3 rounded-lg transition-smooth transform hover:scale-105 border-l-4 ${
                    activeTab === 'profile' 
                      ? 'border-primary bg-primary/10 text-primary font-medium shadow-inner ring-2 ring-primary/30' 
                      : 'border-transparent text-gray-300 hover:bg-dark/50 hover:text-white'
                  }`}
                >
                  <User size={20} className="mr-3" />
                  <span>Mi Perfil</span>
                </button>
                
                {/* Grupo Club (solo DT) */}
                {user.role === 'dt' && (
                  <>
                    <div className="border-t border-gray-700 mt-4 pt-2" />
                    <p className="text-xs text-gray-500 uppercase px-3 mb-1">Club</p>
                    <button
                      onClick={() => setActiveTab('club')}
                      className={`w-full flex items-center p-3 rounded-lg transition-smooth transform hover:scale-105 border-l-4 ${
                        activeTab === 'club' 
                          ? 'border-primary bg-primary/10 text-primary font-medium shadow-inner ring-2 ring-primary/30' 
                          : 'border-transparent text-gray-300 hover:bg-dark/50 hover:text-white'
                      }`}
                    >
                      <Trophy size={20} className="mr-3" />
                      <span>Mi Club</span>
                    </button>
                  </>
                )}

                {/* Grupo Actividad */}
                <div className="border-t border-gray-700 mt-4 pt-2" />
                <p className="text-xs text-gray-500 uppercase px-3 mb-1">Actividad</p>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full flex items-center p-3 rounded-lg transition-smooth transform hover:scale-105 border-l-4 ${
                    activeTab === 'activity' 
                      ? 'border-primary bg-primary/10 text-primary font-medium shadow-inner ring-2 ring-primary/30' 
                      : 'border-transparent text-gray-300 hover:bg-dark/50 hover:text-white'
                  }`}
                >
                  <Activity size={20} className="mr-3" />
                  <span>Actividad</span>
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`w-full flex items-center p-3 mt-1 rounded-lg transition-smooth transform hover:scale-105 border-l-4 ${
                    activeTab === 'community' 
                      ? 'border-primary bg-primary/10 text-primary font-medium shadow-inner ring-2 ring-primary/30' 
                      : 'border-transparent text-gray-300 hover:bg-dark/50 hover:text-white'
                  }`}
                >
                  <Users size={20} className="mr-3" />
                  <span>Comunidad</span>
                </button>

                {/* Grupo Configuración */}
                <div className="border-t border-gray-700 mt-4 pt-2" />
                <p className="text-xs text-gray-500 uppercase px-3 mb-1">Configuración</p>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center p-3 rounded-lg transition-smooth transform hover:scale-105 border-l-4 ${
                    activeTab === 'settings' 
                      ? 'border-primary bg-primary/10 text-primary font-medium shadow-inner ring-2 ring-primary/30' 
                      : 'border-transparent text-gray-300 hover:bg-dark/50 hover:text-white'
                  }`}
                >
                  <Settings size={20} className="mr-3" />
                  <span>Configuración</span>
                </button>

                {/* Admin */}
                {user.role === 'admin' && (
                  <>
                    <div className="border-t border-gray-700 mt-4 pt-2" />
                    <p className="text-xs text-gray-500 uppercase px-3 mb-1">Admin</p>
                    <button
                      onClick={() => navigate('/admin')}
                      className="w-full flex items-center p-3 rounded-lg transition-smooth transform hover:scale-105 border-l-4 border-red-500 bg-red-500/10 text-red-400 font-medium ring-2 ring-red-500/30"
                    >
                      <Shield size={20} className="mr-3 text-red-400" />
                      <span>Panel de Admin</span>
                    </button>
                  </>
                )}
              </nav>
              
              <div className="p-2 mt-2 border-t border-gray-800/50">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          {/* Progreso de Nivel */}
                          <div
                            className="stat-card group border border-primary/40 hover:border-primary/70 transition-smooth p-6 text-center"
                            title={`${xpRemaining} XP restantes para subir de nivel`}
                          >
                            <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Progreso de Nivel</h4>
                            <div className="flex flex-col items-center justify-center">
                              <ProgressRing value={levelProgress} color="var(--primary)" />
                              <p className="text-xs text-gray-400 mt-2">Nivel {user.level || 1}</p>
                            </div>
                          </div>

                          {/* XP Total */}
                          <div
                            className="stat-card group border border-green-500/40 hover:border-green-500/70 transition-smooth p-6 text-center"
                            title={`XP total acumulada`}
                          >
                            <h4 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wide">XP Total</h4>
                            <div className="text-4xl font-extrabold text-green-400 group-hover:scale-105 transition-transform">{user.xp || 0}</div>
                          </div>

                          {/* Logros */}
                          <div
                            className="stat-card group border border-yellow-500/40 hover:border-yellow-500/70 transition-smooth p-6 text-center"
                            title={`Has desbloqueado ${achievements.length} logro(s)`}
                          >
                            <h4 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">Logros</h4>
                            <div className="text-4xl font-extrabold text-yellow-400 group-hover:scale-105 transition-transform">{achievements.length}</div>
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

    {/* Cambio de contraseña */}
    <div className="card-subtle p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Lock size={20} className="mr-3 text-primary" />
        Cambiar Contraseña
      </h3>
      <div className="space-y-4">
        <input
          type="password"
          placeholder="Contraseña actual"
          className="input w-full bg-dark"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          className="input w-full bg-dark"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          className="input w-full bg-dark"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          onClick={handlePasswordChangeSubmit}
          className="btn-gradient-primary px-6 py-2 rounded-lg flex items-center justify-center"
          disabled={pwLoading}
        >
          {pwLoading ? <Loader2 size={18} className="animate-spin" /> : 'Guardar Cambios'}
        </button>
      </div>
    </div>

    {/* Preferencias */}
    <div className="card-subtle p-6 mt-6 border-t border-gray-700 pt-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Settings size={20} className="mr-3 text-primary" />
        Preferencias
      </h3>

      {/* Idioma */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1 flex items-center">
          <Globe size={18} className="mr-2" />Idioma
        </label>
        <select
          className="input w-full bg-dark cursor-pointer"
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Notificaciones */}
      <div className="flex items-center justify-between p-3 bg-dark/50 rounded-lg mb-4">
        <span className="text-gray-300 flex items-center"><Bell size={18} className="mr-2"/> Notificaciones en sitio</span>
        <button
          onClick={() => setNotificationsEnabled(prev => !prev)}
          className={`w-12 h-6 rounded-full flex items-center p-1 transition-smooth ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
        >
          <span className={`w-4 h-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : ''}`}></span>
        </button>
      </div>

      {/* Tema */}
      <div className="flex items-center justify-between p-3 bg-dark/50 rounded-lg">
        <span className="text-gray-300 flex items-center">{theme === 'dark' ? <Moon size={18} className="mr-2"/> : <Sun size={18} className="mr-2"/>}Tema {theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`w-12 h-6 rounded-full flex items-center p-1 transition-smooth ${theme === 'dark' ? 'bg-purple-600' : 'bg-yellow-400'}`}
        >
          <span className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`}></span>
        </button>
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
      {showLogoutConfirm && (
        <ConfirmModal
          title="Cerrar Sesión"
          message="¿Estás seguro de que quieres cerrar sesión?"
          confirmText="Sí, salir"
          cancelText="Cancelar"
          onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
};

export default UserPanel;
 