import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Megaphone,
  MessageSquare,
  Search,
  Users
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { sortDts, type Dt } from '../../utils/dtsUtils';
import { flagUrl } from '../../utils/storage';

type CommunityChannel = 'anuncios' | 'mercado' | 'fixture' | 'sanciones' | 'ayuda';
type CommunityLeague = 'A' | 'B' | 'C' | 'D' | 'General';
type CommunityPriority = 'Oficial' | 'Urgente' | 'Recordatorio';
type CommunitySection = 'canales' | 'directorio';

interface CommunityPost {
  id: string;
  channel: CommunityChannel;
  league: CommunityLeague;
  title: string;
  content: string;
  author: string;
  time: string;
  priority: CommunityPriority;
}

const postsSeed: CommunityPost[] = [
  {
    id: 'post-1',
    channel: 'anuncios',
    league: 'General',
    title: 'Cierre de inscripciones - Copa LVZ',
    content: 'Las inscripciones cierran el sabado 23:59. Revisen requisitos y plantilla habilitada antes de confirmar.',
    author: 'Administracion LVZ',
    time: 'Hoy 10:30',
    priority: 'Oficial'
  },
  {
    id: 'post-2',
    channel: 'fixture',
    league: 'D',
    title: 'Jornada 7 publicada',
    content: 'Ya estan cargados cruces y horarios de la Jornada 7. Coordinar disponibilidad en las proximas 24h.',
    author: 'Coordinacion Liga D',
    time: 'Hoy 12:10',
    priority: 'Recordatorio'
  },
  {
    id: 'post-3',
    channel: 'mercado',
    league: 'General',
    title: 'Mercado cierra en 48 horas',
    content: 'Se recomienda cerrar negociaciones pendientes y verificar presupuesto antes del bloqueo automatico.',
    author: 'Comite de Mercado',
    time: 'Hoy 13:05',
    priority: 'Urgente'
  },
  {
    id: 'post-4',
    channel: 'sanciones',
    league: 'B',
    title: 'Recordatorio de reporte post partido',
    content: 'Todo partido debe registrarse con captura y resultado final en menos de 12 horas para evitar observaciones.',
    author: 'Disciplina Liga B',
    time: 'Ayer 21:40',
    priority: 'Oficial'
  },
  {
    id: 'post-5',
    channel: 'ayuda',
    league: 'General',
    title: 'Guia de carga de resultados',
    content: 'Disponible nueva guia para carga de goles, asistencias y validacion de marcador en panel de partidos.',
    author: 'Soporte LVZ',
    time: 'Ayer 18:15',
    priority: 'Recordatorio'
  }
];

const channelConfig: Record<CommunityChannel, { label: string; icon: JSX.Element }> = {
  anuncios: { label: 'Anuncios', icon: <Megaphone size={15} /> },
  mercado: { label: 'Mercado', icon: <Briefcase size={15} /> },
  fixture: { label: 'Fixture', icon: <CalendarDays size={15} /> },
  sanciones: { label: 'Sanciones', icon: <AlertTriangle size={15} /> },
  ayuda: { label: 'Ayuda', icon: <MessageSquare size={15} /> }
};

const priorityClassMap: Record<CommunityPriority, string> = {
  Oficial: 'bg-blue-500/15 text-blue-300 border-blue-400/40',
  Urgente: 'bg-red-500/15 text-red-300 border-red-400/40',
  Recordatorio: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
};

const DtCommunity = () => {
  const { clubs, tournaments, marketStatus } = useDataStore();
  const { user } = useAuthStore();

  const [dts, setDts] = useState<Dt[]>([]);
  const [loadingDts, setLoadingDts] = useState(false);
  const [errorDts, setErrorDts] = useState<string | null>(null);

  const [section, setSection] = useState<CommunitySection>('canales');
  const [activeChannel, setActiveChannel] = useState<CommunityChannel>('anuncios');
  const [leagueFilter, setLeagueFilter] = useState<'all' | CommunityLeague>('all');
  const [postQuery, setPostQuery] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedPais, setSelectedPais] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'club' | 'country'>('name');

  const flagFilenameMap: Record<string, string> = {
    peru: 'peru.jpg',
    argentina: 'argentina.jpg',
    chile: 'chile.png',
    colombia: 'colombia.png',
    uruguay: 'uruguay.png',
    brasil: 'brasil.jpg',
    mexico: 'mexico.jpg',
    espana: 'espana.png',
    venezuela: 'venezuela.png',
    bolivia: 'bolivia.png',
    ecuador: 'ecuador.png',
    paraguay: 'paraguay.png'
  };

  useEffect(() => {
    const loadDts = async () => {
      try {
        setLoadingDts(true);
        const dtsData = await import('../../data/dts.json');
        const dtsList: Dt[] = dtsData.default;

        const validDts = dtsList.filter((dt) => clubs.some((club) => club.id === dt.clubId));
        setDts(validDts);
      } catch (err) {
        console.error('Error loading DTs:', err);
        setErrorDts('Error al cargar los datos de DTs');
      } finally {
        setLoadingDts(false);
      }
    };

    loadDts();
  }, [clubs]);

  const getFlagPath = (bandera: string) => {
    const normalized = String(bandera || '').replace(/\.(svg|jpg|png)$/i, '').toLowerCase();
    const filename = flagFilenameMap[normalized] || `${normalized}.jpg`;
    return flagUrl(filename);
  };

  const slugify = (value?: string) => (value ? value.toLowerCase().replace(/\s+/g, '-') : '');

  const myClub = useMemo(() => clubs.find((club) => club.id === user?.clubId), [clubs, user?.clubId]);

  const nextRound = useMemo(() => {
    const liga = tournaments.find((t) => t.id === 'tournament1');
    if (!liga?.matches?.length) return 'Sin datos';

    const upcoming = liga.matches
      .filter((m) => m.status === 'scheduled' || m.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return upcoming ? `Jornada ${upcoming.round}` : 'Sin pendientes';
  }, [tournaments]);

  const filteredPosts = useMemo(() => {
    const query = postQuery.trim().toLowerCase();

    return postsSeed.filter((post) => {
      const matchesChannel = post.channel === activeChannel;
      const matchesLeague = leagueFilter === 'all' || post.league === leagueFilter;
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query);

      return matchesChannel && matchesLeague && matchesQuery;
    });
  }, [activeChannel, leagueFilter, postQuery]);

  const filteredDts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    let filtered = dts.filter((dt) => {
      const matchesClub = !selectedClub || dt.clubId === selectedClub;
      const matchesPais = !selectedPais || String(dt.pais || '').trim() === String(selectedPais).trim();
      const fullName = `${dt.nombre} ${dt.apellido}`.trim().toLowerCase();
      const nickname = String(dt.nickname || '').trim().toLowerCase();
      const matchesQuery = !normalizedQuery || fullName.includes(normalizedQuery) || nickname.includes(normalizedQuery);

      return matchesClub && matchesPais && matchesQuery;
    });

    filtered = sortDts(filtered, sortBy, clubs);
    return filtered;
  }, [dts, searchQuery, selectedClub, selectedPais, sortBy, clubs]);

  const uniquePaises = useMemo(() => {
    return dts.length > 0 ? [...new Set(dts.map((dt) => dt.pais).filter(Boolean))].sort() : [];
  }, [dts]);

  if (loadingDts) {
    return (
      <div className="min-h-screen bg-dark">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-8 animate-pulse space-y-4">
            <div className="h-8 w-64 bg-slate-700/70 rounded" />
            <div className="h-4 w-96 bg-slate-700/60 rounded" />
            <div className="h-40 bg-slate-700/50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (errorDts) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{errorDts}</p>
          <button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90 text-dark px-4 py-2 rounded-lg font-semibold">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs uppercase tracking-wide">
                Centro Operativo
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Comunidad DT</h1>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl">
                Anuncios oficiales, coordinacion por liga y soporte para gestionar cada jornada.
              </p>
            </div>
            <Link
              to="/liga-master"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver al dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Estado mercado</p>
              <p className={`text-lg font-bold ${marketStatus ? 'text-emerald-300' : 'text-rose-300'}`}>{marketStatus ? 'Abierto' : 'Cerrado'}</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Proxima referencia</p>
              <p className="text-lg font-bold text-cyan-300">{nextRound}</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Mi club</p>
              <p className="text-lg font-bold text-white">{myClub?.name || 'Sin club asignado'}</p>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          <button
            onClick={() => setSection('canales')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              section === 'canales' ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Canales
          </button>
          <button
            onClick={() => setSection('directorio')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              section === 'directorio' ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Directorio DTs
          </button>
        </section>

        {section === 'canales' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <aside className="lg:col-span-3 rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4 space-y-2 h-fit">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Canales</p>
              {(Object.keys(channelConfig) as CommunityChannel[]).map((channel) => (
                <button
                  key={channel}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors flex items-center justify-between ${
                    activeChannel === channel
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'bg-slate-900/30 border-slate-700 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    {channelConfig[channel].icon}
                    {channelConfig[channel].label}
                  </span>
                  <span className="text-xs text-slate-400">{postsSeed.filter((post) => post.channel === channel).length}</span>
                </button>
              ))}
            </aside>

            <main className="lg:col-span-6 rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4 md:p-5 space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold text-white">{channelConfig[activeChannel].label}</h2>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={leagueFilter}
                    onChange={(e) => setLeagueFilter(e.target.value as 'all' | CommunityLeague)}
                    className="px-3 py-2 bg-slate-900/40 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary"
                  >
                    <option value="all">Todas las ligas</option>
                    <option value="General">General</option>
                    <option value="A">Liga A</option>
                    <option value="B">Liga B</option>
                    <option value="C">Liga C</option>
                    <option value="D">Liga D</option>
                  </select>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      value={postQuery}
                      onChange={(e) => setPostQuery(e.target.value)}
                      placeholder="Buscar aviso"
                      className="pl-9 pr-3 py-2 bg-slate-900/40 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredPosts.length === 0 && (
                  <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-6 text-center text-slate-400">
                    No hay publicaciones para los filtros seleccionados.
                  </div>
                )}
                {filteredPosts.map((post) => (
                  <article key={post.id} className="rounded-xl border border-slate-700/70 bg-slate-900/35 p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs rounded-full border font-semibold ${priorityClassMap[post.priority]}`}>{post.priority}</span>
                      <span className="px-2.5 py-1 text-xs rounded-full border border-slate-600 text-slate-300">Liga {post.league}</span>
                      <span className="text-xs text-slate-500">{post.time}</span>
                    </div>
                    <h3 className="text-white font-semibold text-base">{post.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{post.content}</p>
                    <p className="text-xs text-slate-500">Publicado por {post.author}</p>
                  </article>
                ))}
              </div>
            </main>

            <aside className="lg:col-span-3 rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4 space-y-4 h-fit">
              <div>
                <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">Panel rapido</h3>
                <div className="space-y-2">
                  <div className="rounded-lg border border-slate-700 bg-slate-900/35 p-3">
                    <p className="text-xs text-slate-400 mb-1">Cierre de mercado</p>
                    <p className={`font-semibold ${marketStatus ? 'text-emerald-300' : 'text-rose-300'}`}>{marketStatus ? 'Mercado habilitado' : 'Mercado bloqueado'}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-900/35 p-3">
                    <p className="text-xs text-slate-400 mb-1">Proxima jornada</p>
                    <p className="font-semibold text-cyan-300">{nextRound}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-900/35 p-3">
                    <p className="text-xs text-slate-400 mb-1">Moderacion</p>
                    <p className="font-semibold text-white">Canal oficial activo</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">Accesos utiles</h3>
                <div className="space-y-2">
                  <Link to="/liga-master/fixture" className="block px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/35 text-slate-200 hover:border-primary/40">
                    Fixture y resultados
                  </Link>
                  <Link to="/liga-master/mercado" className="block px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/35 text-slate-200 hover:border-primary/40">
                    Mercado de fichajes
                  </Link>
                  <Link to="/liga-master/reglamento" className="block px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/35 text-slate-200 hover:border-primary/40">
                    Reglamento
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        )}

        {section === 'directorio' && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Buscar DT</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nombre o @nickname"
                    className="w-full px-3 py-2 bg-slate-900/40 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Club</label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/40 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-primary"
                  >
                    <option value="">Todos los clubes</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Pais</label>
                  <select
                    value={selectedPais}
                    onChange={(e) => setSelectedPais(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/40 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-primary"
                  >
                    <option value="">Todos los paises</option>
                    {uniquePaises.map((pais) => (
                      <option key={pais} value={pais}>
                        {pais}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'club' | 'country')}
                    className="w-full px-3 py-2 bg-slate-900/40 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-primary"
                  >
                    <option value="name">Nombre</option>
                    <option value="club">Club</option>
                    <option value="country">Pais</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredDts.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-8 text-center">
                <Users size={40} className="mx-auto text-slate-500 mb-3" />
                <p className="text-slate-300">No se encontraron DTs con esos filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDts.map((dt) => {
                  const clubInfo = clubs.find((club) => club.id === dt.clubId);
                  const clubSlug = slugify(clubInfo?.name);
                  const squadPath = clubSlug ? `/liga-master/club/${clubSlug}/plantilla` : '/liga-master';
                  const financesPath = clubSlug ? `/liga-master/club/${clubSlug}/finanzas` : '/liga-master';

                  return (
                    <article key={dt.id} className="rounded-xl border border-slate-700/70 bg-slate-800/45 p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={`/Fotos_DT/${dt.avatar}`}
                          alt={`${dt.nombre} ${dt.apellido}`}
                          className="w-14 h-14 rounded-full border border-slate-600 object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/default-player.svg';
                          }}
                        />
                        <div>
                          <p className="font-semibold text-white leading-tight">{dt.nombre} {dt.apellido}</p>
                          <p className="text-xs text-primary">@{dt.nickname || 'sin-nick'}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <img
                            src={clubInfo?.logo || '/default-club.svg'}
                            alt={`Escudo de ${clubInfo?.name || 'club'}`}
                            className="h-8 w-8 rounded-lg border border-slate-600 bg-slate-900 object-contain p-0.5"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default-club.svg';
                            }}
                          />
                          <span className="truncate font-semibold text-white">{clubInfo?.name || 'Sin club'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <img
                            src={getFlagPath(dt.bandera)}
                            alt={dt.pais}
                            className="h-4 w-6 rounded border border-slate-600 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default-club.svg';
                            }}
                          />
                          <span>{dt.pais}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Link to={squadPath} className="px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-semibold text-center hover:bg-primary/20">
                          Plantilla
                        </Link>
                        <Link to={financesPath} className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/40 text-slate-200 text-xs font-semibold text-center hover:border-primary/30">
                          Finanzas
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default DtCommunity;
