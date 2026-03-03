import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  User,
  Star,
  Shield,
  Award,
  Mail,
  Calendar,
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
import { listUsers } from '../../utils/authService';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { getSupabaseClient } from '../../lib/supabase';
import { config } from '../../lib/config';

const ROLE_BADGE_CLASS: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/40',
  dt: 'bg-green-500/20 text-green-400 border-green-500/40'
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  dt: 'Director Tecnico'
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
    if (trimmed === 'admin') normalized.add('dt');
  };

  if (Array.isArray(rawRoles)) {
    rawRoles.forEach((role) => {
      if (typeof role === 'string') addRole(role);
    });
  } else if (typeof rawRoles === 'string') {
    addRole(rawRoles);
  }

  if (fallbackRole) addRole(fallbackRole);
  return Array.from(normalized);
};

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const { clubs: storeClubs, standings } = useDataStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const isAuthenticated = Boolean(currentUser);
  const isOwnProfile =
    currentUser &&
    username &&
    currentUser.username.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);

        if (config.useSupabase) {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', username || '')
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user from Supabase:', error);
            throw error;
          }

          if (data) {
            setUser({
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
              club: (data as any).club_name || undefined,
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
            });
            setLoading(false);
            return;
          }
        }

        const users = listUsers();
        const foundUser = users.find(
          (u) => u.username.toLowerCase() === (username || 'admin').toLowerCase()
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
        } else {
          setUser({
            id: '1',
            username: username || 'admin',
            email: `${username}@virtualzone.com`,
            avatar: `https://ui-avatars.com/api/?name=${username}&background=111827&color=fff&size=128`,
            role: username === 'admin' ? 'admin' : 'dt',
            roles: normalizeRoles(null, username === 'admin' ? 'admin' : 'dt'),
            club: '',
            createdAt: '2023-01-15',
            isActive: true,
            achievements: [],
            stats: { wins: 0, draws: 0, losses: 0, titles: 0, mvps: 0 },
            reputation: 'Ofensivo',
            followers: 0,
            following: 0
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [username]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setMessageError('Debes iniciar sesion para enviar mensajes privados.');
      return;
    }
    if (!messageText.trim()) {
      setMessageError('Por favor, escribe un mensaje');
      return;
    }
    try {
      console.log('Enviando mensaje a', user.username, ':', messageText);
      alert(`Mensaje enviado exitosamente a ${user.username}`);
      setMessageText('');
      setShowMessageModal(false);
      setMessageError(null);
    } catch (error: any) {
      setMessageError(error.message || 'Error al enviar el mensaje');
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('Debes iniciar sesion para seguir a otros usuarios.');
      return;
    }
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    setUser((prevUser: any) => ({
      ...prevUser,
      followers: newFollowingState
        ? (prevUser.followers || 0) + 1
        : Math.max(0, (prevUser.followers || 0) - 1)
    }));
  };

  const handleOpenMessageModal = () => {
    if (!currentUser) {
      alert('Debes iniciar sesion para enviar mensajes privados.');
      return;
    }
    setShowMessageModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="bg-dark-light rounded-2xl px-8 py-6 border border-gray-700/60 shadow-lg flex flex-col items-center">
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
        <div className="relative flex items-center justify-center min-h-screen px-4">
          <div className="max-w-lg w-full bg-dark-light rounded-2xl border border-gray-700/60 shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-3 text-white">Usuario no encontrado</h2>
            <p className="text-gray-400 mb-6 text-sm">
              El usuario que estas buscando no existe o fue eliminado.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/usuarios"
                className="bg-primary hover:bg-primary/90 text-dark px-6 py-3 rounded-xl font-semibold transition-all text-sm"
              >
                Ver listado de usuarios
              </Link>
              <Link
                to="/"
                className="border-2 border-gray-600 hover:border-primary/40 text-gray-200 px-6 py-3 rounded-xl font-semibold transition-all text-sm"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const normalizeText = (value: string | undefined) => String(value || '').trim().toLowerCase();
  const club = storeClubs.find((c) => {
    if (user.clubId && c.id === user.clubId) return true;
    return normalizeText(c.name) === normalizeText(user.club);
  });

  const isAdmin =
    user.role === 'admin' ||
    (Array.isArray((user as any).roles) && (user as any).roles.includes('admin'));
  const isDt =
    user.role === 'dt' ||
    (Array.isArray((user as any).roles) && (user as any).roles.includes('dt'));
  const headerRole = isAdmin ? 'admin' : isDt ? 'dt' : 'user';
  const roleLabelForHeader = isAdmin ? 'Administrador' : isDt ? 'Director Tecnico' : 'Usuario';
  const rolesForBadges = (
    Array.isArray((user as any).roles) && (user as any).roles.length
      ? (user as any).roles
      : [user.role]
  )
    .filter((r: string) => r !== headerRole)
    .filter((r: string, index: number, arr: string[]) => arr.indexOf(r) === index);
  const standingEntry = club
    ? standings.find((entry) => entry.clubId === club.id || normalizeText(entry.clubName) === normalizeText(club.name))
    : null;
  const performanceStats = isDt && standingEntry
    ? {
        wins: standingEntry.won || 0,
        draws: standingEntry.drawn || 0,
        losses: standingEntry.lost || 0,
        titles: Array.isArray((club as any)?.titles) ? (club as any).titles.length : (user.stats?.titles || 0),
      }
    : {
        wins: user.stats?.wins || 0,
        draws: user.stats?.draws || 0,
        losses: user.stats?.losses || 0,
        titles: user.stats?.titles || 0,
      };
  const totalMatches = performanceStats.wins + performanceStats.draws + performanceStats.losses;
  const winRate = totalMatches > 0 ? ((performanceStats.wins / totalMatches) * 100).toFixed(1) : '0.0';
  const followingCount =
    typeof user.following === 'number'
      ? user.following
      : (user.following?.users?.length || 0) +
        (user.following?.clubs?.length || 0) +
        (user.following?.players?.length || 0);
  const createdAt = user.createdAt || user.joinDate || new Date().toISOString();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="relative container mx-auto px-4 pb-10 pt-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="bg-dark-light rounded-2xl border border-gray-700/70 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-emerald-500/10 px-6 py-7 sm:px-8 border-b border-gray-700/70">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="relative w-fit">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-gray-600 object-cover"
                  />
                  <span className="absolute -bottom-2 -right-2 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase rounded-full bg-gray-900 border border-gray-600 text-gray-200">
                    Publico
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.username}</h1>
                    <span className="text-sm text-gray-400">@{user.username}</span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
                      {roleLabelForHeader}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rolesForBadges.map((r: string) => (
                      <span
                        key={r}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getRoleBadgeClass(r)}`}
                      >
                        {getRoleLabel(r)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
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
                        disabled={!isAuthenticated}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm ${
                          isFollowing
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-primary hover:bg-primary/90 text-white'
                        } ${!isAuthenticated ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                        onClick={handleOpenMessageModal}
                        disabled={!isAuthenticated}
                        className={`border border-primary/50 text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm ${
                          !isAuthenticated ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        <Mail size={16} className="mr-2" />
                        Mensaje
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Seguidores</p>
                  <p className="text-xl font-bold text-white">{user.followers || 0}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Siguiendo</p>
                  <p className="text-xl font-bold text-white">{followingCount}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Partidos</p>
                  <p className="text-xl font-bold text-white">{totalMatches}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Win Rate</p>
                  <p className="text-xl font-bold text-emerald-400">{winRate}%</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Titulos</p>
                  <p className="text-xl font-bold text-yellow-400">{performanceStats.titles}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Desde</p>
                  <p className="text-xl font-bold text-white">
                    {new Date(createdAt).toLocaleDateString('es-ES', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-1 space-y-6">
              <div className="bg-gray-800/55 rounded-xl p-6 border border-gray-700/80">
                <div className="flex items-center mb-5">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <User size={18} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Sobre mi</h3>
                </div>
                {(user as any).bio ? (
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">{(user as any).bio}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic mb-4">Este usuario aun no completo su biografia publica.</p>
                )}
                <div className="space-y-2.5">
                  {(user as any).location && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin size={15} className="text-primary" />
                      <span>{(user as any).location}</span>
                    </div>
                  )}
                  {(user as any).website && (
                    <a
                      href={(user as any).website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors break-all"
                    >
                      <Globe size={15} />
                      <span>{(user as any).website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {(user as any).favoriteTeam && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Heart size={15} className="text-red-400" />
                      <span>Equipo favorito: {(user as any).favoriteTeam}</span>
                    </div>
                  )}
                  {(user as any).favoritePosition && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Target size={15} className="text-secondary" />
                      <span>Posicion favorita: {(user as any).favoritePosition}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar size={15} className="text-green-400" />
                    <span>
                      Miembro desde{' '}
                      {new Date(createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {club && (
                <div className="bg-gray-800/55 rounded-xl p-6 border border-gray-700/80">
                  <div className="flex items-center mb-5">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Shield size={18} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Club actual</h3>
                  </div>
                  <Link
                    to={`/liga-master/club/${club.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center mb-4 p-3 bg-gray-800/60 rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-colors"
                  >
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-12 h-12 rounded-lg mr-3 border border-gray-600 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{club.name}</h4>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide">Ver perfil del club</p>
                    </div>
                  </Link>
                </div>
              )}
            </section>

            <section className="lg:col-span-2 space-y-6">
              {isDt && (
                <div className="bg-gray-800/55 rounded-xl p-6 border border-gray-700/80">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        <BarChart3 size={18} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Rendimiento DT</h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-300 bg-emerald-500/10 flex items-center gap-1">
                      <TrendingUp size={13} />
                      {winRate}% victorias
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center">
                      <p className="text-2xl font-bold text-green-400">{performanceStats.wins}</p>
                      <p className="text-[11px] uppercase text-gray-400">Victorias</p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center">
                      <p className="text-2xl font-bold text-gray-300">{performanceStats.draws}</p>
                      <p className="text-[11px] uppercase text-gray-400">Empates</p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center">
                      <p className="text-2xl font-bold text-red-400">{performanceStats.losses}</p>
                      <p className="text-[11px] uppercase text-gray-400">Derrotas</p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{performanceStats.titles}</p>
                      <p className="text-[11px] uppercase text-gray-400">Titulos</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-800/55 rounded-xl p-6 border border-gray-700/80">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Award size={18} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Logros y medallas</h3>
                  </div>
                  {user.achievements?.length > 0 && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/25">
                      {user.achievements.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {user.achievements?.length > 0 ? (
                    user.achievements.slice(0, 5).map((achievement: any, index: number) => (
                      <div
                        key={achievement.id || index}
                        className="flex items-center p-3.5 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3 border border-primary/20">
                          <Trophy size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{achievement.name || achievement}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-700/30 flex items-center justify-center">
                        <Award size={26} className="text-gray-600" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">No hay logros aun</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showMessageModal && isAuthenticated && !isOwnProfile && (
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
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Mail size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Enviar mensaje</h3>
                  <p className="text-sm text-gray-400">Mensaje privado a {user.username}</p>
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
              <form onSubmit={handleSendMessage} className="space-y-5">
                {messageError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle size={16} className="text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-red-300 text-sm">{messageError}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tu mensaje</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Escribe un mensaje para ${user.username}...`}
                    className="w-full px-4 py-3 bg-dark border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-200 text-sm"
                    rows={5}
                    maxLength={500}
                  />
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
