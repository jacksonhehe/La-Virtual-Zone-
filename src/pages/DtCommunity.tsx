import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter,
  Crown,
  Users,
  Briefcase,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import {
  sortDts,
  type Dt
} from '../utils/dtsUtils';
import { usePagination } from '../hooks/usePagination';
import { flagUrl } from '../utils/storage';

const DtCommunity = () => {
  const { clubs } = useDataStore();

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

  // Construye la ruta normalizada para las banderas almacenadas en Supabase y que fueron cargadas desde la carpeta Banderas
  const getFlagPath = (bandera: string) => {
    const nameWithoutExt = bandera.replace(/\.(svg|jpg|png)$/i, '').toLowerCase();
    const normalizedFilename = flagFilenameMap[nameWithoutExt] || `${nameWithoutExt}.jpg`;
    return flagUrl(normalizedFilename);
  };

  // Estado para la sección de DTs
  const [dts, setDts] = useState<Dt[]>([]);
  const [filteredDts, setFilteredDts] = useState<Dt[]>([]);
  const [loadingDts, setLoadingDts] = useState(false);
  const [errorDts, setErrorDts] = useState<string | null>(null);

  // Filtros para DTs
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedPais, setSelectedPais] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'club' | 'country'>('name');

  // Paginación
  const [perPage, setPerPage] = useState(12);

  // Cargar datos de DTs
  useEffect(() => {
    const loadDts = async () => {
      try {
        setLoadingDts(true);
        // Importar datos de DTs
        const dtsData = await import('../data/dts.json');
        const dtsList: Dt[] = dtsData.default;

        // Validar que cada clubId exista en los clubs
        const validDts = dtsList.filter(dt => {
          const clubExists = clubs.some(club => club.id === dt.clubId);
          if (!clubExists) {
            console.error(`DT ${dt.nombre} ${dt.apellido} tiene clubId ${dt.clubId} inválido`);
          }
          return clubExists;
        });

        setDts(validDts);
        // El efecto de filtrado se encargará de establecer filteredDts y displayedDts
      } catch (err) {
        console.error('Error loading DTs:', err);
        setErrorDts('Error al cargar los datos de DTs');
      } finally {
        setLoadingDts(false);
      }
    };

    loadDts();
  }, [clubs]);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    // Si no hay datos o clubs, inicializar vacío
    if (dts.length === 0 || clubs.length === 0) {
      setFilteredDts([]);
      return;
    }

    let filtered = dts.filter(dt => {
      // Filtros exactos
      const matchesClub = !selectedClub || dt.clubId === selectedClub;
      const matchesPais = !selectedPais || String(dt.pais || '').trim() === String(selectedPais).trim();

      return matchesClub && matchesPais;
    });

    // Aplicar ordenamiento
    filtered = sortDts(filtered, sortBy, clubs);

    setFilteredDts(filtered);
  }, [dts, selectedClub, selectedPais, sortBy, clubs]);

  // Paginación
  const pagination = usePagination({
    items: filteredDts,
    perPage: perPage,
    initialPage: 1
  });

  // Resetear paginación cuando cambian los filtros
  const lastFilterKey = useRef(`${selectedClub}-${selectedPais}-${sortBy}`);
  useEffect(() => {
    const currentFilterKey = `${selectedClub}-${selectedPais}-${sortBy}`;
    if (lastFilterKey.current !== currentFilterKey) {
      pagination.set(1);
      lastFilterKey.current = currentFilterKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClub, selectedPais, sortBy]);

  // Limpiar filtros
  const clearFilters = () => {
    setSelectedClub('');
    setSelectedPais('');
    setSortBy('name');
  };

  // Obtener opciones únicas para filtros
  const uniquePaises = dts.length > 0 ? [...new Set(dts.map(dt => dt.pais).filter(Boolean))].sort() : [];

  if (loadingDts) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando Comunidad DT...</p>
        </div>
      </div>
    );
  }

  if (errorDts) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{errorDts}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-dark px-4 py-2 rounded-lg font-semibold"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-gray-850/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/30 mb-8 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-2xl"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>

            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center space-x-5">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/20 shadow-lg">
                  <Crown size={36} className="text-primary drop-shadow-sm" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
                    DT's Oficiales LVZ
                  </h1>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed">
                    Comunidad de Directores Técnicos de La Virtual Zone
                  </p>
                </div>
              </div>
              <Link
                to="/liga-master"
                className="bg-gradient-to-r from-secondary/80 to-secondary/70 hover:from-secondary hover:to-secondary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-secondary/40 transform hover:scale-105 flex items-center border border-secondary/30"
              >
                <ArrowLeft size={18} className="mr-2" />
                Volver al Dashboard
              </Link>
            </div>

            {/* Contador dinámico */}
            <div className="relative z-10 grid grid-cols-2 gap-8">
              <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 backdrop-blur-sm">
                <div className="text-4xl font-bold text-primary mb-1">{filteredDts.length}</div>
                <div className="text-sm text-gray-400 font-medium">
                  {filteredDts.length === 1 ? 'DT encontrado' : 'DTs encontrados'}
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                <div className="text-4xl font-bold text-blue-400 mb-1">
                  {uniquePaises.length}
                </div>
                <div className="text-sm text-gray-400 font-medium">Países</div>
              </div>
            </div>
          </div>

          {/* Controles de filtros */}
          <div className="bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-gray-850/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/30 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3 rounded-2xl"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Filtros */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center">
                  <Filter size={16} className="mr-2 text-secondary" />
                  Club
                </label>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-700/60 border border-gray-600/60 rounded-xl text-white focus:border-secondary/60 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all duration-300 hover:border-gray-500/60 appearance-none"
                >
                  <option value="">Todos los clubes</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  País
                </label>
                <select
                  value={selectedPais}
                  onChange={(e) => setSelectedPais(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-700/60 border border-gray-600/60 rounded-xl text-white focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-gray-500/60 appearance-none"
                >
                  <option value="">Todos los países</option>
                  {uniquePaises.map(pais => (
                    <option key={pais} value={pais}>
                      {pais}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'club' | 'country')}
                  className="w-full px-4 py-4 bg-gray-700/60 border border-gray-600/60 rounded-xl text-white focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-gray-500/60 appearance-none"
                >
                  <option value="name">A-Z (Nombre)</option>
                  <option value="club">Club</option>
                  <option value="country">País</option>
                </select>
              </div>
            </div>

            {/* Chips de filtros activos */}
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedClub && (
                <span className="px-3 py-1 bg-secondary/20 text-secondary text-sm rounded-full flex items-center">
                  Club: {clubs.find(c => c.id === selectedClub)?.name}
                  <button
                    onClick={() => setSelectedClub('')}
                    className="ml-2 hover:text-secondary/80"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedPais && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center">
                  País: {selectedPais}
                  <button
                    onClick={() => setSelectedPais('')}
                    className="ml-2 hover:text-green-400/80"
                  >
                    ×
                  </button>
                </span>
              )}
              {(selectedClub || selectedPais) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm rounded-full hover:bg-gray-500/30 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Grid de DTs */}
          {filteredDts.length === 0 ? (
            <div className="bg-gradient-to-br from-dark-lighter to-dark-lighter/95 rounded-xl p-12 shadow-xl border border-gray-700/50 backdrop-blur-sm text-center">
              <Users size={64} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron DTs</h3>
              <p className="text-gray-400 mb-6">
                No hay directores técnicos que coincidan con los criterios de búsqueda.
              </p>
              <button
                onClick={clearFilters}
                className="bg-primary hover:bg-primary/90 text-dark px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {pagination.items.map((dt, index) => {
                const clubInfo = clubs.find(club => club.id === dt.clubId);
                return (
                  <div
                    key={dt.id}
                    className="group relative bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-gray-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-700/40 hover:border-primary/50 transition-all duration-500 hover:scale-[1.03] hover:shadow-primary/30 animate-fade-up overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/15 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-primary/25 group-hover:scale-150 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl translate-y-12 -translate-x-12 group-hover:bg-secondary/20 transition-all duration-700"></div>
                    
                    {/* Badge de verificado */}
                    {dt.verificado && (
                      <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-full p-2 border border-yellow-500/30 shadow-lg">
                        <Crown size={16} className="text-yellow-400" />
                      </div>
                    )}

                    {/* Avatar con mejor diseño */}
                    <div className="relative mb-6 flex justify-center">
                      <div className="relative">
                        {/* Anillo decorativo exterior */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-700 animate-spin-slow"></div>
                        
                        {/* Borde del avatar */}
                        <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-primary/40 group-hover:border-primary/70 transition-all duration-500 shadow-2xl group-hover:shadow-primary/50 relative z-10">
                          <img
                            src={`/Fotos_DT/${dt.avatar}`}
                            alt={`${dt.nombre} ${dt.apellido}`}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default-player.svg';
                            }}
                          />
                        </div>

                        {/* Halo effect mejorado */}
                        <div className="absolute inset-0 rounded-full bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10 scale-150"></div>
                      </div>
                    </div>

                    {/* Info mejorada */}
                    <div className="text-center relative z-10">
                      {/* Nombre */}
                      <h4 className="font-bold text-white text-xl mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-500">
                        {dt.nombre} {dt.apellido}
                      </h4>
                      
                      {/* Nickname */}
                      {dt.nickname && (
                        <div className="mb-4">
                          <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full border border-primary/30 text-primary text-xs font-semibold shadow-md">
                            @{dt.nickname}
                          </span>
                        </div>
                      )}

                      {/* Badge DT */}
                      <div className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-gray-700/60 to-gray-700/40 rounded-full border border-gray-600/40 mb-5 shadow-inner">
                        <Crown size={14} className="text-primary mr-2" />
                        <span className="text-gray-300 text-xs font-bold tracking-wide">DIRECTOR TÉCNICO</span>
                      </div>

                      {/* Club con mejor diseño */}
                      <div className="flex items-center justify-center mb-4 p-4 bg-gradient-to-br from-gray-700/40 to-gray-700/20 rounded-2xl border border-gray-600/30 group-hover:border-primary/40 group-hover:bg-gradient-to-br group-hover:from-gray-700/60 group-hover:to-gray-700/40 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                        <div className="flex items-center space-x-3 w-full">
                          <div className="relative">
                            <img
                              src={clubInfo?.logo || '/default-club.svg'}
                              alt={clubInfo?.name}
                              className="w-10 h-10 rounded-xl shadow-lg border-2 border-gray-600/30 group-hover:border-primary/50 transition-all duration-500 group-hover:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/default-club.svg';
                              }}
                            />
                            <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </div>
                          <Link
                            to={`/liga-master/club/${clubInfo?.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex-1 font-bold text-primary text-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-500 truncate hover:underline cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {clubInfo?.name || 'Sin club'}
                          </Link>
                        </div>
                      </div>

                      {/* País con mejor diseño */}
                      <div className="flex items-center justify-center p-3.5 bg-gradient-to-br from-gray-700/30 to-gray-700/15 rounded-xl border border-gray-600/20 group-hover:border-gray-500/40 group-hover:bg-gradient-to-br group-hover:from-gray-700/50 group-hover:to-gray-700/30 transition-all duration-500 shadow-md">
                        <div className="relative">
                          <img
                            src={getFlagPath(dt.bandera)}
                            alt={dt.pais}
                            className="h-7 w-auto rounded-lg mr-3 shadow-lg border-2 border-gray-600/30 group-hover:border-gray-500/50 transition-all duration-500 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default-club.svg';
                            }}
                          />
                        </div>
                        <span className="text-gray-300 text-sm font-semibold group-hover:text-white transition-colors duration-300">
                          {dt.pais}
                        </span>
                      </div>
                    </div>

                    {/* Acciones contextuales mejoradas */}
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0 relative z-10">
                      <div className="flex justify-center gap-3">
                        <Link
                          to={`/liga-master/club/${clubInfo?.name.toLowerCase().replace(/\s+/g, '-')}/plantilla`}
                          className="flex-1 bg-gradient-to-r from-primary/25 to-primary/15 hover:from-primary/35 hover:to-primary/25 text-primary px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border border-primary/30 hover:border-primary/50 shadow-lg hover:shadow-primary/30 flex items-center justify-center group/btn"
                          title="Ver plantilla"
                        >
                          <Users size={14} className="mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                          Plantilla
                        </Link>
                        <Link
                          to={`/liga-master/club/${clubInfo?.name.toLowerCase().replace(/\s+/g, '-')}/finanzas`}
                          className="flex-1 bg-gradient-to-r from-secondary/25 to-secondary/15 hover:from-secondary/35 hover:to-secondary/25 text-secondary px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border border-secondary/30 hover:border-secondary/50 shadow-lg hover:shadow-secondary/30 flex items-center justify-center group/btn"
                          title="Ver finanzas"
                        >
                          <Briefcase size={14} className="mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                          Finanzas
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 mb-8">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>
                      Mostrando {((pagination.page - 1) * perPage) + 1} - {Math.min(pagination.page * perPage, pagination.total)} de {pagination.total} DTs
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Selector de items por página */}
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        pagination.set(1);
                      }}
                      className="px-3 py-2 bg-gray-700/60 border border-gray-600/60 rounded-lg text-white text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value={12}>12 por página</option>
                      <option value={24}>24 por página</option>
                      <option value={48}>48 por página</option>
                    </select>

                    {/* Botones de navegación */}
                    <button
                      onClick={pagination.prev}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-dark-light border border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-lighter transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft size={18} />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => pagination.set(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              pagination.page === pageNum
                                ? 'bg-primary text-white'
                                : 'bg-dark-light border border-gray-800 text-gray-300 hover:bg-dark-lighter'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={pagination.next}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 bg-dark-light border border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-lighter transition-colors flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DtCommunity;

// Estilos CSS personalizados para mejorar la apariencia
const styles = `
  /* Estilos para los selectores */
  select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }

  /* Mejorar el scroll en WebKit */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.5);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.7);
  }

  /* Animación de entrada mejorada */
  @keyframes slideInFromBottom {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-fade-up {
    animation: slideInFromBottom 0.6s ease-out forwards;
    opacity: 0;
  }

  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
`;

// Inyectar estilos CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
