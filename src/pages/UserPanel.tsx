import   { useState, useEffect, useRef } from 'react';
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
  
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { xpForNextLevel } from '../utils/helpers';

const UserPanel = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { clubs } = useDataStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Initialize following property if it doesn't exist
  const following = user?.following || { clubs: [], users: [] };
  
  // Get user's club if they are a DT
  const userClub = user?.role === 'dt' && user?.club
    ? clubs.find(club => club.name === user.club)
    : null;

  // Calculate XP progress for the level bar
  const currentLevelXp = xpForNextLevel((user?.level ?? 1) - 1);
  const nextLevelXp = xpForNextLevel(user?.level ?? 1);
  const levelProgress = user
    ? ((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
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
  
  // Initialize achievements array if it doesn't exist
  const achievements = user?.achievements || [];

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card p-6 text-center mb-6">
            <div className="relative mx-auto w-20 h-20 rounded-full overflow-hidden mb-4 bg-dark">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20">
                  <User size={32} className="text-primary" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-dark rounded-full p-0.5">
                <div className="w-6 h-6 flex items-center justify-center bg-primary text-dark text-xs font-bold rounded-full">
                  {user.level}
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-1">{user.username}</h2>
            <p className="text-gray-400 text-sm mb-4">
              {user.role === 'dt' ? 'Director Técnico' : 
               user.role === 'admin' ? 'Administrador' : 'Usuario Estándar'}
            </p>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Nivel {user.level}</span>
                <span>Nivel {user.level + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full ${levelProgress >= 50 ? 'bg-green-500' : 'bg-red-500'} ${levelPulse ? 'animate-pulse' : ''}`}
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs w-10 text-right">{Math.round(levelProgress)}%</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {user.xp} / {nextLevelXp} XP
              </div>
            </div>
            
            {user.role === 'dt' && userClub && (
              <div className="mt-3 p-3 bg-dark rounded-lg">
                <div className="flex items-center justify-center">
                  <img 
                    src={userClub.logo} 
                    alt={userClub.name} 
                    className="w-8 h-8 mr-2"
                  />
                  <span className="font-medium">{userClub.name}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="card overflow-hidden">
            <nav>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center p-3 ${
                  activeTab === 'profile' ? 'bg-primary text-dark' : 'text-gray-300 hover:bg-dark'
                }`}
              >
                <User size={18} className="mr-3" />
                <span>Mi Perfil</span>
              </button>
              
              {user.role === 'dt' && (
                <button
                  onClick={() => setActiveTab('club')}
                  className={`w-full flex items-center p-3 ${
                    activeTab === 'club' ? 'bg-primary text-dark' : 'text-gray-300 hover:bg-dark'
                  }`}
                >
                  <Trophy size={18} className="mr-3" />
                  <span>Mi Club</span>
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('activity')}
                className={`w-full flex items-center p-3 ${
                  activeTab === 'activity' ? 'bg-primary text-dark' : 'text-gray-300 hover:bg-dark'
                }`}
              >
                <Clipboard size={18} className="mr-3" />
                <span>Actividad</span>
              </button>
              
              <button
                onClick={() => setActiveTab('community')}
                className={`w-full flex items-center p-3 ${
                  activeTab === 'community' ? 'bg-primary text-dark' : 'text-gray-300 hover:bg-dark'
                }`}
              >
                <Users size={18} className="mr-3" />
                <span>Comunidad</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center p-3 ${
                  activeTab === 'settings' ? 'bg-primary text-dark' : 'text-gray-300 hover:bg-dark'
                }`}
              >
                <Settings size={18} className="mr-3" />
                <span>Configuración</span>
              </button>
              
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center p-3 rounded-md bg-neon-red text-white"
                >
                  <Settings size={18} className="mr-3" />
                  <span>Panel de Admin</span>
                </button>
              )}
            </nav>
            
            <div className="border-t border-gray-800 p-3">
              <button
                onClick={logout}
                className="w-full flex items-center p-2 rounded-md text-gray-400 hover:bg-dark hover:text-white"
              >
                <LogOut size={18} className="mr-3" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-2 lg:col-span-3">
          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Mi Perfil</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre de usuario</label>
                        <div className="font-medium">{user.username}</div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Correo electrónico</label>
                        <div className="font-medium">{user.email}</div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Rol</label>
                        <div className="font-medium">
                          {user.role === 'dt' ? 'Director Técnico' : 
                           user.role === 'admin' ? 'Administrador' : 'Usuario Estándar'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Fecha de registro</label>
                        <div className="font-medium">
                          {user.joinDate ? new Date(user.joinDate).toLocaleDateString('es-ES') : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Estadísticas y Logros</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-3xl font-bold">{user.level}</div>
                        <div className="text-sm text-gray-400">Nivel</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{user.xp}</div>
                        <div className="text-sm text-gray-400">Experiencia</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{achievements.length}</div>
                        <div className="text-sm text-gray-400">Logros</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-400 mb-2">Logros Desbloqueados</h4>
                      <div className="flex flex-wrap gap-2">
                        {achievements.length > 0 ? (
                          achievements.map(achievement => (
                            <span 
                              key={achievement}
                              className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-md"
                            >
                              {achievement === 'founder' ? 'Fundador' : 
                               achievement === 'first_win' ? 'Primera Victoria' :
                               achievement === 'first_transfer' ? 'Primer Fichaje' :
                               achievement}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No has desbloqueado logros todavía</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {user.role !== 'dt' && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-3">Solicitar Club</h3>
                  <p className="text-gray-300 mb-4">
                    Para participar en la Liga Master necesitas convertirte en Director Técnico y administrar un club. Solicita un puesto para la próxima temporada.
                  </p>
                  <button className="btn-primary">
                    Solicitar participación como DT
                  </button>
                </div>
              )}
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Perfil Público</h3>
                <p className="text-gray-300 mb-4">
                  Tu perfil público muestra tu información a otros usuarios de la comunidad. Puedes personalizar lo que se muestra.
                </p>
                <a 
                  href={`/usuarios/${user.username}`}
                  className="btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver mi perfil público
                </a>
              </div>
            </div>
          )}
          
          {/* Club tab (only for DT) */}
          {activeTab === 'club' && user.role === 'dt' && userClub && (
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                  <div className="flex items-center mb-4 md:mb-0">
                    <img 
                      src={userClub.logo} 
                      alt={userClub.name} 
                      className="w-16 h-16 mr-4"
                    />
                    <div>
                      <h2 className="text-xl font-bold">{userClub.name}</h2>
                      <p className="text-gray-400">
                        Fundado en {userClub.foundedYear} • {userClub.stadium}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/liga-master/club/${userClub.slug}`}
                      className="btn-secondary"
                    >
                      Ver Perfil
                    </a>
                    <a
                      href={`/liga-master/club/${userClub.slug}/plantilla`}
                      className="btn-outline"
                    >
                      Plantilla
                    </a>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-dark p-4 rounded-lg">
                    <h3 className="font-medium mb-2 text-sm text-gray-400">Presupuesto</h3>
                    <p className="text-xl font-bold text-primary">
                      €{(userClub.budget / 1000000).toFixed(1)}M
                    </p>
                    <a
                      href={`/liga-master/club/${userClub.slug}/finanzas`}
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Ver finanzas
                    </a>
                  </div>
                  
                  <div className="bg-dark p-4 rounded-lg">
                    <h3 className="font-medium mb-2 text-sm text-gray-400">Posición actual</h3>
                    <p className="text-xl font-bold">
                      {userClub.season?.position || '?'}º lugar
                    </p>
                    <div className="text-xs text-gray-400 mt-1">
                      {userClub.season?.wins || 0}V {userClub.season?.draws || 0}E {userClub.season?.losses || 0}D
                    </div>
                  </div>
                  
                  <div className="bg-dark p-4 rounded-lg">
                    <h3 className="font-medium mb-2 text-sm text-gray-400">Jugadores</h3>
                    <p className="text-xl font-bold">
                      {userClub.players?.length || 0} <span className="text-gray-400 text-base font-normal">jugadores</span>
                    </p>
                    <div className="text-xs text-gray-400 mt-1">
                      {userClub.players ? userClub.players.filter(p => p.startsWith('p')).length : 0} activos
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    
                    <a 
                      href="/liga-master/fixture"
                      className="p-4 bg-dark rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center text-center"
                    >
                      <Clipboard size={24} className="text-primary mb-2" />
                      <span className="font-medium">Fixture</span>
                      <span className="text-xs text-gray-400 mt-1">Próximos partidos</span>
                    </a>
                    
                    <a
                      href="/liga-master/tacticas"
                      className="p-4 bg-dark rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center text-center"
                    >
                      <Clipboard size={24} className="text-primary mb-2" />
                      <span className="font-medium">Tácticas</span>
                      <span className="text-xs text-gray-400 mt-1">Alineación y formación</span>
                    </a>
                    
                    <a 
                      href={`/liga-master/feed`}
                      className="p-4 bg-dark rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center text-center"
                    >
                      <Bell size={24} className="text-primary mb-2" />
                      <span className="font-medium">Feed</span>
                      <span className="text-xs text-gray-400 mt-1">Últimas noticias</span>
                    </a>
                  </div>
                </div>
                
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Temporada 2025</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm text-gray-400 mb-2">Estilo de juego</h4>
                      <div className="flex items-center">
                        <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-sm rounded-md">
                          {userClub.style === 'possession' ? 'Posesión' :
                           userClub.style === 'counter' ? 'Contraataque' :
                           userClub.style === 'offensive' ? 'Ofensivo' :
                           userClub.style === 'defensive' ? 'Defensivo' : 'Equilibrado'}
                        </span>
                        <span className="mx-2 text-gray-500">•</span>
                        <span className="text-sm text-gray-300">Formación: {userClub.formation}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-400 mb-2">Objetivos</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Top 3 en la liga</span>
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">En progreso</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Alcanzar cuartos de Copa Virtual</span>
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Pendiente</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Fichar un jugador estrella</span>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Completado</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-400 mb-2">Títulos históricos</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-bold">{userClub.titles?.league || 0}</span>
                          <span className="text-xs text-gray-400">Liga</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-bold">{userClub.titles?.cup || 0}</span>
                          <span className="text-xs text-gray-400">Copa</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-bold">{userClub.titles?.supercup || 0}</span>
                          <span className="text-xs text-gray-400">Supercopa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Jugadores Destacados</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Just show 3 mock players since we don't have the full player details */}
                  <div className="bg-dark p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-red-500/20 rounded-md text-red-400 flex items-center justify-center font-bold mr-3">
                        ST
                      </div>
                      <div>
                        <div className="font-medium">Carlos Martínez</div>
                        <div className="text-xs text-gray-400">Delantero • 26 años</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium">85</div>
                        <div className="text-xs text-gray-400">Media</div>
                      </div>
                      <div>
                        <div className="font-medium">8</div>
                        <div className="text-xs text-gray-400">Goles</div>
                      </div>
                      <div>
                        <div className="font-medium">3</div>
                        <div className="text-xs text-gray-400">Asist.</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-dark p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-green-500/20 rounded-md text-green-400 flex items-center justify-center font-bold mr-3">
                        CM
                      </div>
                      <div>
                        <div className="font-medium">Fernando López</div>
                        <div className="text-xs text-gray-400">Mediocampista • 28 años</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium">82</div>
                        <div className="text-xs text-gray-400">Media</div>
                      </div>
                      <div>
                        <div className="font-medium">3</div>
                        <div className="text-xs text-gray-400">Goles</div>
                      </div>
                      <div>
                        <div className="font-medium">7</div>
                        <div className="text-xs text-gray-400">Asist.</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-dark p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-md text-yellow-400 flex items-center justify-center font-bold mr-3">
                        GK
                      </div>
                      <div>
                        <div className="font-medium">Miguel Santos</div>
                        <div className="text-xs text-gray-400">Portero • 30 años</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium">80</div>
                        <div className="text-xs text-gray-400">Media</div>
                      </div>
                      <div>
                        <div className="font-medium">3</div>
                        <div className="text-xs text-gray-400">Imbatido</div>
                      </div>
                      <div>
                        <div className="font-medium">13</div>
                        <div className="text-xs text-gray-400">Paradas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Activity tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
                
                <div className="space-y-4">
                  {/* Some mock activities */}
                  <div className="p-3 border-b border-gray-800 flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 flex-shrink-0">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Participaste en el torneo "Copa Virtual 2025"</p>
                      <p className="text-sm text-gray-400 mt-1">Hace 3 días</p>
                    </div>
                  </div>
                  
                  <div className="p-3 border-b border-gray-800 flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 flex-shrink-0">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Realizaste una oferta por el jugador Carlos Martínez</p>
                      <p className="text-sm text-gray-400 mt-1">Hace 5 días</p>
                    </div>
                  </div>
                  
                  <div className="p-3 border-b border-gray-800 flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 flex-shrink-0">
                      <Star size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Subiste al nivel 5</p>
                      <p className="text-sm text-gray-400 mt-1">Hace 1 semana</p>
                    </div>
                  </div>
                  
                  <div className="p-3 flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 flex-shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Te uniste a La Virtual Zone</p>
                      <p className="text-sm text-gray-400 mt-1">Hace 3 semanas</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Estadísticas de Actividad</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-dark p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-1">Partidos</h4>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-gray-400 mt-1">7 victorias, 3 empates, 2 derrotas</p>
                  </div>
                  
                  <div className="bg-dark p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-1">Torneos</h4>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-gray-400 mt-1">1 copa, 2 ligas</p>
                  </div>
                  
                  <div className="bg-dark p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-1">Transacciones</h4>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-xs text-gray-400 mt-1">5 compras, 3 ventas</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Notificaciones</h3>
                
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start">
                    <Bell size={18} className="text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Recordatorio: Próximo partido en 2 días</p>
                      <p className="text-sm text-gray-400 mt-1">vs. Atlético Pixelado • 20/07/2025 • 20:00</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start">
                    <ShoppingCart size={18} className="text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Nueva oferta recibida</p>
                      <p className="text-sm text-gray-400 mt-1">Por Fernando López • €12M • De Atlético Pixelado</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start">
                    <Trophy size={18} className="text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Inscripciones abiertas: Copa Virtual</p>
                      <p className="text-sm text-gray-400 mt-1">Abierto hasta 01/08/2025 • 16 equipos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Community tab */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Mi Comunidad</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Clubes que sigues</h3>
                  
                  {following.clubs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {following.clubs.map(clubName => {
                        const club = clubs.find(c => c.name === clubName || c.slug === clubName);
                        if (!club) return null;
                        
                        return (
                          <a
                            key={club.id}
                            href={`/liga-master/club/${club.slug}`}
                            className="flex items-center p-3 bg-dark rounded-lg hover:bg-gray-800"
                          >
                            <img 
                              src={club.logo} 
                              alt={club.name} 
                              className="w-10 h-10 mr-3"
                            />
                            <div>
                              <p className="font-medium">{club.name}</p>
                              <p className="text-xs text-gray-400">
                                DT: {club.dt} • Pos: {club.season?.position || '?'}º
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-dark p-4 rounded-lg text-center">
                      <p className="text-gray-400 mb-3">No sigues a ningún club todavía.</p>
                      <a href="/liga-master" className="btn-outline text-sm">
                        Explorar clubes
                      </a>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Usuarios que sigues</h3>
                  
                  {following.users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Render followed users - mock for now */}
                      <div className="flex items-center p-3 bg-dark rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <User size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Carlos Vega</p>
                          <p className="text-xs text-gray-400">
                            DT • Rayo Digital FC
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-dark p-4 rounded-lg text-center">
                      <p className="text-gray-400 mb-3">No sigues a ningún usuario todavía.</p>
                      <a href="/usuarios" className="btn-outline text-sm">
                        Explorar usuarios
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Actividad de la Comunidad</h3>
                
                <div className="space-y-4">
                  <div className="p-3 border-b border-gray-800 flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mr-4 flex-shrink-0">
                      <img 
                        src="https://i.imgur.com/uZQt48s.png" 
                        alt="Rayo Digital FC" 
                        className="w-8 h-8"
                      />
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Rayo Digital FC</span> 
                        <span className="text-gray-400"> venció a </span>
                        <span className="font-medium">Atlético Pixelado</span>
                        <span className="text-gray-400"> por 3-2</span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Hace 2 días</p>
                    </div>
                  </div>
                  
                  <div className="p-3 border-b border-gray-800 flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mr-4 flex-shrink-0">
                      <img 
                        src="https://i.imgur.com/0JMOEVt.png" 
                        alt="Atlético Pixelado" 
                        className="w-8 h-8"
                      />
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Atlético Pixelado</span> 
                        <span className="text-gray-400"> fichó a </span>
                        <span className="font-medium">Ricardo Vega</span>
                        <span className="text-gray-400"> por </span>
                        <span className="text-primary">€15M</span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Hace 5 días</p>
                    </div>
                  </div>
                  
                  <div className="p-3 flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 flex-shrink-0">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <p>
                        <span className="text-gray-400">Se abrieron las inscripciones para el torneo </span>
                        <span className="font-medium">Copa Virtual 2025</span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Hace 1 semana</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Configuración de Cuenta</h2>
                
                <form className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Nombre de usuario
                        </label>
                        <input
                          type="text"
                          className="input w-full"
                          value={user.username}
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          El nombre de usuario no se puede cambiar
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          className="input w-full"
                          defaultValue={user.email}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Avatar (URL)
                        </label>
                        <input
                          type="text"
                          className="input w-full"
                          defaultValue={user.avatar || ''}
                          placeholder="https://ejemplo.com/mi-avatar.jpg"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Cambiar Contraseña</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Contraseña actual
                        </label>
                        <input
                          type="password"
                          className="input w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Nueva contraseña
                        </label>
                        <input
                          type="password"
                          className="input w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Confirmar nueva contraseña
                        </label>
                        <input
                          type="password"
                          className="input w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Notificaciones</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Correos electrónicos</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Notificaciones de mercado</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Notificaciones de partidos</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" className="btn-outline">
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary">
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-3 text-red-400">Zona Peligrosa</h3>
                <p className="text-gray-300 mb-4">
                  Estas acciones son irreversibles. Por favor, procede con precaución.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <button className="btn w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">
                      Descargar mis datos
                    </button>
                  </div>
                  
                  <div>
                    <button className="btn w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">
                      Eliminar mi cuenta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
 