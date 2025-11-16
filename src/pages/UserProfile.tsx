import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  User,
  Star,
  Shield,
  Award,
  Mail,
  Calendar,
  Users,
  Trophy,
  X,
  Send,
  Check,
  UserPlus,
  MapPin,
  Globe,
  Target,
  TrendingUp,
  Activity,
  BarChart3,
  Heart,
  AlertTriangle
} from 'lucide-react';
import { clubs } from '../data/mockData';
import { listUsers } from '../utils/authService';
import { useAuthStore } from '../store/authStore';
import { getSupabaseClient } from '../lib/supabase';
import { config } from '../lib/config';

// Helper functions
const ROLE_BADGE_CLASS: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/40',
  dt: 'bg-green-500/20 text-green-400 border-green-500/40'
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  dt: 'Director Técnico'
};

function getRoleBadgeClass(role: string): string {
  return ROLE_BADGE_CLASS[role] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/40';
}

function getRoleLabel(role: string): string {
  return ROLE_LABEL[role] ?? 'Usuario';
}

const normalizeRoles = (rawRoles: unknown, fallbackRole?: string): string[] => {
  const normalized = new Set<string>();

  const addRole = (value?: string) => {
    if (!value) return;
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;
    normalized.add(trimmed);
    if (trimmed === 'admin') {
      normalized.add('dt');
    }
  };

  if (Array.isArray(rawRoles)) {
    rawRoles.forEach((role) => {
      if (typeof role === 'string') {
        addRole(role);
      }
    });
  } else if (typeof rawRoles === 'string') {
    addRole(rawRoles);
  }

  if (fallbackRole) {
    addRole(fallbackRole);
  }

  return Array.from(normalized);
};

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Check if this is the current user's own profile
  const isOwnProfile =
    currentUser &&
    username &&
    currentUser.username.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);

        if (config.useSupabase) {
          // Consultar desde Supabase
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', username || '')
            .single();

          if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned
            console.error('Error fetching user from Supabase:', error);
            throw error;
          }

          if (data) {
            // Normalizar datos de Supabase
          const normalizedUser = {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role || 'user',
            roles: normalizeRoles((data as any).roles, data.role || 'user'),
            avatar:
              data.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  data.username
                )}&background=111827&color=fff&size=128`,
              clubId: data.club_id,
              club: data.club_id
                ? clubs.find((c) => c.id === data.club_id)?.name
                : undefined,
              createdAt: data.created_at,
              bio: data.bio,
              location: data.location,
              website: data.website,
              favoriteTeam: data.favorite_team,
              favoritePosition: data.favorite_position,
              followers: data.followers || 0,
              following: data.following || 0,
              stats: (data as any).stats || {
                wins: 0,
                draws: 0,
                losses: 0,
                titles: 0,
                mvps: 0
              },
              achievements: (data as any).achievements || [],
              reputation: (data as any).reputation
            };

            setUser(normalizedUser);
            setLoading(false);
            return;
          }
        }

        // Fallback a localStorage
        const users = listUsers();
        const foundUser = users.find(
          (u) =>
            u.username.toLowerCase() === (username || 'admin').toLowerCase()
        );

        if (foundUser) {
          // Ensure stats and achievements exist for users
          setUser({
            ...foundUser,
            roles: normalizeRoles((foundUser as any).roles, foundUser.role),
            stats: (foundUser as any).stats || {
              wins: 0,
              draws: 0,
              losses: 0,
              titles: 0,
              mvps: 0
            },
            achievements: (foundUser as any).achievements || []
          });
        } else {
          // Fallback a mock data para demo
          setUser({
            id: '1',
            username: username || 'admin',
            email: `${username}@virtualzone.com`,
            avatar: `https://ui-avatars.com/api/?name=${username}&background=111827&color=fff&size=128`,
            role: username === 'admin' ? 'admin' : 'dt',
            roles: normalizeRoles(null, username === 'admin' ? 'admin' : 'dt'),
            club:
              username === 'admin'
                ? 'Rayo Digital FC'
                : username === 'pixelmanager'
                ? 'Atlético Pixelado'
                : username === 'lagdefender'
                ? 'Defensores del Lag'
                : username === 'neonmanager'
                ? 'Neón FC'
                : '',
            createdAt: '2023-01-15',
            isActive: true,
            achievements: [
              {
                id: '1',
                name: 'Campeón Liga Master 2024',
                description: 'Ganador de la Liga Master temporada 2024',
                date: '2024-12-15'
              },
              {
                id: '2',
                name: 'Mejor DT',
                description: 'Votado como mejor DT de la temporada',
                date: '2024-12-20'
              }
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
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // En caso de error, intentar con localStorage
        const users = listUsers();
        const foundUser = users.find(
          (u) =>
            u.username.toLowerCase() === (username || 'admin').toLowerCase()
        );

        if (foundUser) {
          setUser({
            ...foundUser,
            roles: normalizeRoles((foundUser as any).roles, foundUser.role),
            stats: (foundUser as any).stats || {
              wins: 0,
              draws: 0,
              losses: 0,
              titles: 0,
              mvps: 0
            },
            achievements: (foundUser as any).achievements || []
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [username]);

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) {
      setMessageError('Por favor, escribe un mensaje');
      return;
    }

    if (messageText.length > 500) {
      setMessageError('El mensaje no puede tener más de 500 caracteres');
      return;
    }

    try {
      // Aquí iría la lógica para enviar el mensaje
      console.log('Enviando mensaje a', user.username, ':', messageText);

      // Simular envío exitoso
      alert(`Mensaje enviado exitosamente a ${user.username}`);

      // Limpiar y cerrar modal
      setMessageText('');
      setShowMessageModal(false);
      setMessageError(null);
    } catch (error: any) {
      setMessageError(error.message || 'Error al enviar el mensaje');
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    try {
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);

      // Actualizar el contador de seguidores del usuario
      setUser((prevUser: any) => ({
        ...prevUser,
        followers: newFollowingState
          ? (prevUser.followers || 0) + 1
          : Math.max(0, (prevUser.followers || 0) - 1)
      }));

      if (newFollowingState) {
        console.log(`Ahora sigues a ${user.username}`);
      } else {
        console.log(`Dejaste de seguir a ${user.username}`);
      }
    } catch (error: any) {
      console.error('Error al cambiar el estado de seguimiento:', error);
      alert('Error al actualizar el estado de seguimiento');
    }
  };

  // Estados especiales si está cargando o no se encuentra
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.18] mix-blend-soft-light"
          style={{
            backgroundImage: `radial-gradient(circle at 0 0, rgba(56,189,248,0.20) 0, transparent 55%),
                              radial-gradient(circle at 100% 0, rgba(129,140,248,0.22) 0, transparent 55%),
                              radial-gradient(circle at 0 100%, rgba(16,185,129,0.22) 0, transparent 55%),
                              radial-gradient(circle at 100% 100%, rgba(244,63,94,0.20) 0, transparent 55%)`
          }}
        />
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: '32px 32px'
          }}
        />
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="bg-dark-lighter/95 rounded-2xl px-8 py-6 border border-gray-700/60 shadow-2xl backdrop-blur-sm flex flex-col items-center">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary mb-4" />
            <p className="text-gray-300 text-sm">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !username) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.18] mix-blend-soft-light"
          style={{
            backgroundImage: `radial-gradient(circle at 0 0, rgba(56,189,248,0.20) 0, transparent 55%),
                              radial-gradient(circle at 100% 0, rgba(129,140,248,0.22) 0, transparent 55%),
                              radial-gradient(circle at 0 100%, rgba(16,185,129,0.22) 0, transparent 55%),
                              radial-gradient(circle at 100% 100%, rgba(244,63,94,0.20) 0, transparent 55%)`
          }}
        />
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: '32px 32px'
          }}
        />
        <div className="relative flex items-center justify-center min-h-screen px-4">
          <div className="max-w-lg w-full bg-dark-lighter/95 rounded-2xl border border-gray-700/60 shadow-2xl backdrop-blur-sm p-8 text-center">
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Usuario no encontrado
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              El usuario que estás buscando no existe, ha sido renombrado o fue eliminado.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/usuarios"
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-dark px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-primary/40 transform hover:scale-[1.03] text-sm"
              >
                Ver listado de usuarios
              </Link>
              <Link
                to="/"
                className="border-2 border-gray-600 hover:border-primary/40 text-gray-200 hover:text-primary px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-primary/5 hover:scale-[1.02] text-sm"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Find club
  const club = clubs.find((c) => c.name === user.club);

  // Derivar etiqueta legible del rol principal
  const isAdmin =
    user.role === 'admin' ||
    (Array.isArray((user as any).roles) &&
      (user as any).roles.includes('admin'));
  const isDt =
    user.role === 'dt' ||
    (Array.isArray((user as any).roles) &&
      (user as any).roles.includes('dt'));
  const roleLabelForHeader = isAdmin
    ? 'Administrador'
    : isDt
    ? 'Director Técnico'
    : 'Usuario';

  // Calcular estadísticas adicionales
  const totalMatches =
    (user.stats?.wins || 0) +
    (user.stats?.draws || 0) +
    (user.stats?.losses || 0);
  const winRate =
    totalMatches > 0
      ? ((user.stats?.wins || 0) / totalMatches * 100).toFixed(1)
      : 0;
  const createdAt = user.createdAt || user.joinDate || new Date().toISOString();

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Banner/Header simplificado */}
      <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-dark/80" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
            PERFIL PÚBLICO
          </p>
          <p className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-dark/80 border border-gray-600 text-gray-300">
            <User size={14} className="mr-2 text-primary" />
            {roleLabelForHeader}
          </p>
        </div>
      </div>

      <div className="relative container mx-auto px-4 pb-10 -mt-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Card principal del perfil */}
          <div className="bg-dark-lighter/95 rounded-2xl shadow-2xl border border-gray-700/60 backdrop-blur-sm overflow-hidden">
            {/* Header del perfil */}
            <div className="relative px-6 pt-6 pb-4 sm:px-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar simplificado */}
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-gray-600 object-cover"
                  />
                </div>

                {/* Información principal */}
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {user.username}
                    </h1>
                    <div className="flex gap-2 flex-wrap">
                      {(() => {
                        const roles =
                          Array.isArray((user as any).roles) &&
                          (user as any).roles.length
                            ? (user as any).roles
                            : [user.role];
                        return roles.map((r: string) => (
                          <span
                            key={r}
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold border shadow-md ${getRoleBadgeClass(
                              r
                            )}`}
                          >
                            {getRoleLabel(r)}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Bio y detalles adicionales */}
                  {((user as any).bio ||
                    (user as any).location ||
                    (user as any).website ||
                    (user as any).favoriteTeam ||
                    (user as any).favoritePosition) ? (
                    <>
                      {(user as any).bio && (
                        <p className="text-gray-300 mb-4 leading-relaxed max-w-2xl text-sm sm:text-base">
                          {(user as any).bio}
                        </p>
                      )}

                      {/* Información adicional */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {(user as any).location && (
                          <div className="flex items-center text-gray-300 text-xs sm:text-sm bg-dark/60 px-3 py-1.5 rounded-lg border border-gray-700/45">
                            <MapPin size={16} className="mr-2 text-primary" />
                            <span>{(user as any).location}</span>
                          </div>
                        )}
                        {(user as any).website && (
                          <a
                            href={(user as any).website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:text-primary/80 text-xs sm:text-sm bg-dark/60 px-3 py-1.5 rounded-lg border border-gray-700/45 hover:border-primary/40 transition-all"
                          >
                            <Globe size={16} className="mr-2" />
                            <span>
                              {(user as any).website.replace(/^https?:\/\//, '')}
                            </span>
                          </a>
                        )}
                        {(user as any).favoriteTeam && (
                          <div className="flex items-center text-gray-300 text-xs sm:text-sm bg-dark/60 px-3 py-1.5 rounded-lg border border-gray-700/45">
                            <Heart size={16} className="mr-2 text-red-400" />
                            <span>
                              Equipo favorito:{' '}
                              {(user as any).favoriteTeam}
                            </span>
                          </div>
                        )}
                        {(user as any).favoritePosition && (
                          <div className="flex items-center text-gray-300 text-xs sm:text-sm bg-dark/60 px-3 py-1.5 rounded-lg border border-gray-700/45">
                            <Target
                              size={16}
                              className="mr-2 text-secondary"
                            />
                            <span>
                              Posición favorita:{' '}
                              {(user as any).favoritePosition}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm mb-4 italic">
                      Este usuario aún no ha completado su información pública.
                    </p>
                  )}

                  {/* Stats rápidas simplificadas */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                      <Users size={18} className="text-primary mr-2" />
                      <div>
                        <div className="text-sm font-bold text-white">
                          {user.followers || 0}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          Seguidores
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                      <Users size={18} className="text-secondary mr-2" />
                      <div>
                        <div className="text-sm font-bold text-white">
                          {typeof user.following === 'number'
                            ? user.following
                            : (user.following?.users?.length || 0) +
                              (user.following?.clubs?.length || 0) +
                              (user.following?.players?.length || 0)}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          Siguiendo
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                      <Calendar size={18} className="text-green-400 mr-2" />
                      <div>
                        <div className="text-sm font-bold text-white">
                          {new Date(createdAt).toLocaleDateString('es-ES', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          Miembro desde
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones simplificadas */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {isOwnProfile ? (
                      <Link
                        to="/usuario?tab=profile&customize=1"
                        className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
                      >
                        <User size={16} className="mr-2" />
                        Editar perfil
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={handleFollowToggle}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm ${
                            isFollowing
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-primary hover:bg-primary/90 text-white'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <Check size={16} className="mr-2" />
                              Siguiendo
                            </>
                          ) : (
                            <>
                              <UserPlus size={16} className="mr-2" />
                              Seguir
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowMessageModal(true)}
                          disabled={!!isOwnProfile}
                          className="border border-primary/50 text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
                        >
                          <Mail size={16} className="mr-2" />
                          Mensaje
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de contenido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información del club */}
            {club && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Shield size={24} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Club actual
                    </h3>
                  </div>
                </div>

                <Link
                  to={`/liga-master/club/${club.name
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                  className="flex items-center mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="w-16 h-16 rounded-full mr-4 border-2 border-gray-600 object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg mb-1">
                      {club.name}
                    </h4>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Director Técnico
                    </p>
                  </div>
                  <div className="ml-3 text-xs text-gray-400">
                    <span className="px-3 py-1 rounded-full bg-gray-700">
                      Ver perfil
                    </span>
                  </div>
                </Link>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {club.reputation}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      Reputación
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-2xl font-bold text-secondary mb-1">
                      {club.titles?.length || 0}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      Títulos
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {(club.fanBase || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      Fans
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Estadísticas como DT */}
            {(user.role === 'dt' ||
              (Array.isArray((user as any).roles) &&
                (user as any).roles.includes('dt'))) &&
              user.stats && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        <BarChart3 size={24} className="text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        Estadísticas como DT
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {user.stats.wins || 0}
                      </div>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                        Victorias
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="text-2xl font-bold text-red-400 mb-1">
                        {user.stats.losses || 0}
                      </div>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                        Derrotas
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="text-2xl font-bold text-gray-300 mb-1">
                        {user.stats.draws || 0}
                      </div>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                        Empates
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">
                        {user.stats.titles || 0}
                      </div>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                        Títulos
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de barras visual para W/D/L */}
                  {totalMatches > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-700/60">
                      <div className="flex items-end gap-2 h-24">
                        <div className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg shadow-lg transition-all duration-500 hover:shadow-green-500/50"
                            style={{
                              height: `${((user.stats.wins || 0) / totalMatches) * 100}%`
                            }}
                          />
                          <span className="text-[11px] text-gray-400 mt-2 font-semibold">
                            V
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-gray-500 to-gray-300 rounded-t-lg shadow-lg transition-all duration-500 hover:shadow-gray-500/50"
                            style={{
                              height: `${((user.stats.draws || 0) / totalMatches) * 100}%`
                            }}
                          />
                          <span className="text-[11px] text-gray-400 mt-2 font-semibold">
                            E
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg shadow-lg transition-all duration-500 hover:shadow-red-500/50"
                            style={{
                              height: `${((user.stats.losses || 0) / totalMatches) * 100}%`
                            }}
                          />
                          <span className="text-[11px] text-gray-400 mt-2 font-semibold">
                            D
                          </span>
                        </div>
                      </div>
                      <div className="text-center mt-4 text-sm text-gray-400">
                        Total:{' '}
                        <span className="font-bold text-white">
                          {totalMatches}
                        </span>{' '}
                        partidos
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Logros */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Award size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Logros desbloqueados
                  </h3>
                </div>
                {user.achievements && user.achievements.length > 0 && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/25">
                    {user.achievements.length}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {user.achievements && user.achievements.length > 0 ? (
                  user.achievements.slice(0, 5).map((achievement: any, index: number) => (
                    <div
                      key={achievement.id || index}
                      className="flex items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 border border-primary/20">
                        <Trophy size={18} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm mb-1">
                          {achievement.name || achievement}
                        </p>
                        {achievement.description && (
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {achievement.description}
                          </p>
                        )}
                        {achievement.date && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(achievement.date).toLocaleDateString(
                              'es-ES',
                              { year: 'numeric', month: 'short' }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/30 flex items-center justify-center">
                      <Award size={32} className="text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">
                      No hay logros desbloqueados aún
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      ¡Comienza a jugar para desbloquear medallas!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Estilo de juego (solo DT) */}
            {(user.role === 'dt' ||
              (Array.isArray((user as any).roles) &&
                (user as any).roles.includes('dt'))) &&
              user.reputation && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Star size={24} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Estilo de juego
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center">
                        <Target size={18} className="text-primary mr-3" />
                        <span className="text-sm text-gray-300 font-semibold">
                          Estilo principal
                        </span>
                      </div>
                      <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/25">
                        {user.reputation}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center">
                        <BarChart3 size={18} className="text-secondary mr-3" />
                        <span className="text-sm text-gray-300 font-semibold">
                          Formación preferida
                        </span>
                      </div>
                      <span className="text-sm font-bold text-secondary px-3 py-1 bg-secondary/10 rounded-full border border-secondary/25">
                        4-3-3
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center">
                        <Activity size={18} className="text-green-400 mr-3" />
                        <span className="text-sm text-gray-300 font-semibold">
                          Partidos jugados
                        </span>
                      </div>
                      <span className="text-sm font-bold text-green-400 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/25">
                        {totalMatches}
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && !isOwnProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div
            className="absolute inset-0"
            onClick={() => {
              setShowMessageModal(false);
              setMessageError(null);
              setMessageText('');
            }}
          />
          <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Mail size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Enviar mensaje
                  </h3>
                  <p className="text-sm text-gray-400">
                    Mensaje privado a {user.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageError(null);
                  setMessageText('');
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Información del destinatario */}
              <div className="flex items-center mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-12 h-12 rounded-full mr-4 border-2 border-gray-500 object-cover"
                />
                <div>
                  <p className="font-bold text-white text-base">
                    {user.username}
                  </p>
                  <p className="text-sm text-gray-400">
                    El mensaje se enviará de forma privada
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-5">
                {messageError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle size={16} className="text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-red-300 text-sm">
                        {messageError}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Tu mensaje
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Escribe un mensaje para ${user.username}...`}
                    className="w-full px-4 py-3 bg-dark border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-200 text-sm"
                    rows={5}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[11px] text-gray-500">
                      Mensaje privado y seguro
                    </p>
                    <p
                      className={`text-[11px] font-semibold ${
                        messageText.length > 450
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {messageText.length}/500 caracteres
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMessageModal(false);
                      setMessageError(null);
                      setMessageText('');
                    }}
                    className="border border-gray-600 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
                  >
                    <Send size={16} className="mr-2" />
                    Enviar mensaje
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

