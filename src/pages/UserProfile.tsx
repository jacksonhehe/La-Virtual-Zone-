import { useParams, Link } from 'react-router-dom';
import { Star, Shield, Award, Mail, Calendar, Users, ChevronRight, Trophy } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDataStore } from '../store/dataStore';
import { slugify } from '../utils/helpers';

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();

  const { clubs } = useDataStore();
  
  // Mock user for demo
  const user = {
    id: '1',
    username: username || 'admin',
    email: `${username}@virtualzone.com`,
    avatar: `https://ui-avatars.com/api/?name=${username}&background=111827&color=fff&size=128`,
    role: username === 'admin' ? 'admin' : 'dt',
    level: 30,
    xp: 8500,
    club: username === 'admin' ? 'Rayo Digital FC' : 
           username === 'pixelmanager' ? 'Atlético Pixelado' : 
           username === 'lagdefender' ? 'Defensores del Lag' : 
           username === 'neonmanager' ? 'Neón FC' : '',
    joinDate: '2023-01-15',
    isActive: true,
    achievements: [
      { id: '1', name: 'Campeón Liga Master 2024', description: 'Ganador de la Liga Master temporada 2024', date: '2024-12-15' },
      { id: '2', name: 'Mejor DT', description: 'Votado como mejor DT de la temporada', date: '2024-12-20' },
    ],
    stats: {
      wins: 24,
      draws: 8,
      losses: 6,
      titles: 2,
      mvps: 3
    },
    reputation: 'Ofensivo',
    followers: 32,
    following: 15
  };
  
  // Find club
  const club = clubs.find(c => c.name === user.club);
  
  if (!username) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Usuario no encontrado</h2>
        <p className="text-gray-400 mb-8">El usuario que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <PageHeader 
        title={`Perfil de ${user.username}`} 
        subtitle={`${user.role === 'admin' ? 'Administrador' : user.role === 'dt' ? 'Director Técnico' : 'Usuario'} de La Virtual Zone`}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="card p-6 text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 relative group">
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-full h-full rounded-full"
                />
                <div className="absolute top-0 right-0">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
              <p className="text-gray-400 mb-4">{user.email}</p>
              
              <div className="flex justify-center mb-4">
                <div className="flex items-center mr-4">
                  <Users size={16} className="text-gray-400 mr-1" />
                  <span className="text-sm">{user.followers} seguidores</span>
                </div>
                <div className="flex items-center">
                  <Users size={16} className="text-gray-400 mr-1" />
                  <span className="text-sm">Sigue a {user.following}</span>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <button className="btn-primary text-sm px-3 py-1 mr-2">Seguir</button>
                <button className="btn-outline text-sm px-3 py-1">Mensaje</button>
              </div>
              
              <div className="bg-dark-lighter rounded-lg p-3 mb-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-gray-400">Nivel {user.level}</span>
                  <span className="text-gray-400">{user.xp} XP</span>
                </div>
                <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${(user.xp / (user.level * 1000)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <span>Miembro desde {new Date(user.joinDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
                
                <div className="flex items-center">
                  <Mail size={16} className="text-gray-400 mr-2" />
                  <span>{user.email}</span>
                </div>
                
                {user.role === 'dt' && user.club && (
                  <div className="flex items-center">
                    <Shield size={16} className="text-gray-400 mr-2" />
                    <Link
                      to={`/liga-master/club/${slugify(user.club)}`}
                      className="text-primary hover:text-primary-light"
                    >
                      {user.club}
                    </Link>
                  </div>
                )}
                
                {user.role === 'dt' && (
                  <div className="flex items-center">
                    <Star size={16} className="text-gray-400 mr-2" />
                    <span>Estilo: {user.reputation}</span>
                  </div>
                )}
              </div>
            </div>
            
            {club && (
              <div className="card p-6 mb-6">
                <h3 className="font-bold mb-4 flex items-center">
                  <Shield size={18} className="text-primary mr-2" />
                  Club actual
                </h3>
                
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-3">
                    <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold">{club.name}</h4>
                    <p className="text-gray-400 text-sm">DT desde 2023</p>
                    <Link
                      to={`/liga-master/club/${club.slug}`}
                      className="text-primary hover:text-primary-light text-sm"
                    >
                      Ver perfil del club
                    </Link>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-dark-lighter p-2 rounded-lg">
                    <p className="text-lg font-bold">{club.position}°</p>
                    <p className="text-xs text-gray-400">Posición</p>
                  </div>
                  <div className="bg-dark-lighter p-2 rounded-lg">
                    <p className="text-lg font-bold">{club.points}</p>
                    <p className="text-xs text-gray-400">Puntos</p>
                  </div>
                  <div className="bg-dark-lighter p-2 rounded-lg">
                    <p className="text-lg font-bold">{club.wins}</p>
                    <p className="text-xs text-gray-400">Victorias</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 lg:col-span-3">
            <div className="card mb-8">
              <div className="p-4 bg-dark-lighter border-b border-gray-800">
                <h3 className="font-bold text-lg flex items-center">
                  <Award size={18} className="text-primary mr-2" />
                  Logros y estadísticas
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {user.role === 'dt' && (
                    <div className="bg-dark-lighter rounded-lg p-4">
                      <h4 className="font-bold mb-3">Estadísticas como DT</h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-500">{user.stats.wins}</p>
                          <p className="text-xs text-gray-400">Victorias</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-400">{user.stats.draws}</p>
                          <p className="text-xs text-gray-400">Empates</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-red-500">{user.stats.losses}</p>
                          <p className="text-xs text-gray-400">Derrotas</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-primary">{user.stats.titles}</p>
                          <p className="text-xs text-gray-400">Títulos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-yellow-500">{user.stats.mvps}</p>
                          <p className="text-xs text-gray-400">MVPs</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-dark-lighter rounded-lg p-4">
                    <h4 className="font-bold mb-3">Logros desbloqueados</h4>
                    <div className="space-y-3">
                      {user.achievements.map(achievement => (
                        <div key={achievement.id} className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                            <Trophy size={18} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{achievement.name}</p>
                            <p className="text-xs text-gray-400">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {user.role === 'dt' && (
                  <div>
                    <h4 className="font-bold mb-3">Historial de clubes</h4>
                    <div className="bg-dark-lighter rounded-lg p-4">
                      <div className="relative pl-6 pb-6">
                        <div className="absolute top-0 left-3 bottom-0 w-px bg-gray-700"></div>
                        <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs font-bold">1</span>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{club?.name}</p>
                          <p className="text-sm text-gray-400">2023 - Presente</p>
                          <p className="text-sm text-gray-300 mt-1">Campeón Liga Master 2024, Supercopa 2024</p>
                        </div>
                      </div>
                      
                      <div className="relative pl-6">
                        <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-xs font-bold">2</span>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">Virtual United</p>
                          <p className="text-sm text-gray-400">2022 - 2023</p>
                          <p className="text-sm text-gray-300 mt-1">Subcampeón Copa Virtual 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card mb-8">
              <div className="p-4 bg-dark-lighter border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center">
                  <Calendar size={18} className="text-primary mr-2" />
                  Actividad reciente
                </h3>
                <button className="text-primary hover:text-primary-light text-sm flex items-center">
                  Ver todo
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="border-l-2 border-primary pl-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Partido disputado</span>
                      <span className="text-xs text-gray-400">Hace 2 días</span>
                    </div>
                    <p className="text-gray-300">
                      {club?.name} 3-2 Atlético Pixelado
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-secondary pl-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Fichaje completado</span>
                      <span className="text-xs text-gray-400">Hace 1 semana</span>
                    </div>
                    <p className="text-gray-300">
                      Alex Consola ficha por {club?.name}
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-green-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Subió al nivel {user.level}</span>
                      <span className="text-xs text-gray-400">Hace 2 semanas</span>
                    </div>
                    <p className="text-gray-300">
                      Por ganar 3 partidos consecutivos
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card">
                <div className="p-4 bg-dark-lighter border-b border-gray-800">
                  <h3 className="font-bold">Comentarios y valoraciones</h3>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            size={16} 
                            fill={star <= 4 ? 'currentColor' : 'none'} 
                            className={star <= 4 ? 'text-yellow-500' : 'text-gray-600'} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm">4.0 (12 valoraciones)</span>
                    </div>
                    <button className="text-primary hover:text-primary-light text-sm">
                      Valorar
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-dark-lighter p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                            <img 
                              src="https://ui-avatars.com/api/?name=PM&background=10b981&color=fff&size=128" 
                              alt="pixelmanager"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium">pixelmanager</span>
                        </div>
                        <span className="text-xs text-gray-400">Hace 5 días</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Buen rival, partido muy disputado. Gran DT.
                      </p>
                    </div>
                    
                    <div className="bg-dark-lighter p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                            <img 
                              src="https://ui-avatars.com/api/?name=NM&background=c026d3&color=fff&size=128" 
                              alt="neonmanager"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium">neonmanager</span>
                        </div>
                        <span className="text-xs text-gray-400">Hace 2 semanas</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Excelente estrategia, me ganó justamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {user.role === 'dt' && (
                <div className="card">
                  <div className="p-4 bg-dark-lighter border-b border-gray-800">
                    <h3 className="font-bold">Estilo de juego</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-dark-lighter p-3 rounded-lg text-center">
                        <h4 className="font-medium mb-2">Ofensivo</h4>
                        <div className="w-full h-2 bg-dark rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">85%</p>
                      </div>
                      
                      <div className="bg-dark-lighter p-3 rounded-lg text-center">
                        <h4 className="font-medium mb-2">Posesión</h4>
                        <div className="w-full h-2 bg-dark rounded-full">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">70%</p>
                      </div>
                      
                      <div className="bg-dark-lighter p-3 rounded-lg text-center">
                        <h4 className="font-medium mb-2">Presión</h4>
                        <div className="w-full h-2 bg-dark rounded-full">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">60%</p>
                      </div>
                      
                      <div className="bg-dark-lighter p-3 rounded-lg text-center">
                        <h4 className="font-medium mb-2">Defensivo</h4>
                        <div className="w-full h-2 bg-dark rounded-full">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">40%</p>
                      </div>
                    </div>
                    
                    <div className="bg-dark-lighter p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Formación habitual</h4>
                      <p className="text-center text-xl font-bold">4-3-3</p>
                      <div className="flex justify-center mt-2">
                        <div className="text-xs text-gray-400">
                          Estilo ofensivo con extremos abiertos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-neon-red/20 text-neon-red';
    case 'dt': return 'bg-neon-green/20 text-neon-green';
    default: return 'bg-secondary/20 text-secondary';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'dt': return 'Director Técnico';
    default: return 'Usuario';
  }
};

export default UserProfile;
 