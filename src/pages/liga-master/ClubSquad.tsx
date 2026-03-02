import  { useParams, Link } from 'react-router-dom';
import { Shield, ChevronLeft, Users, Database, ArrowDown, ArrowUp, Eye, ShoppingCart, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import PlayerStatsModal from '../../components/common/PlayerStatsModal';
import { formatCurrency } from '../../utils/format';
import { useEffect, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { togglePlayerTransferListing, updatePlayer } from '../../utils/playerService';
import { getTranslatedPosition, getPositionColor } from '../../utils/helpers';
import { calculateMarketValueByRating, calculateReleasePriceByRating } from '../../utils/marketRules';
import { fetchUsers, listUsers } from '../../utils/authService';

const ClubSquad = () => {
  const { clubName } = useParams<{ clubName: string }>();
  const [sortBy, setSortBy] = useState('overall');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [pendingTransferIds, setPendingTransferIds] = useState<string[]>([]);
  const [pendingReleaseIds, setPendingReleaseIds] = useState<string[]>([]);
  const [playerToRelease, setPlayerToRelease] = useState<any>(null);
  const [managerDisplayName, setManagerDisplayName] = useState<string>('Sin DT asignado');
  
  const { clubs, players, updatePlayers, updateClub } = useDataStore() as any;
  const { user, hasRole } = useAuthStore();

  // Find club by slug
  const club = clubs.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === clubName);

  // Check if current user is DT of this club
  const isCurrentUserDTOfClub = hasRole('dt') && user?.clubId === club?.id;

  useEffect(() => {
    if (!club) {
      setManagerDisplayName('Sin DT asignado');
      return;
    }

    let cancelled = false;
    const normalize = (value?: string) => String(value || '').trim().toLowerCase();

    const resolveManager = (users: any[]) => {
      const preferredByKey = new Map<string, string>();
      const adminFallbackByKey = new Map<string, string>();

      users.forEach((u) => {
        const roles = Array.isArray(u?.roles) && u.roles.length > 0 ? u.roles : [u?.role];
        const isDT = roles.includes('dt');
        if (!isDT || !u?.username) return;

        const isAdmin = roles.includes('admin') || u?.role === 'admin';
        const clubFromId = clubs.find((c: any) => normalize(c.id) === normalize(u?.clubId));
        const keys = [u?.clubId, u?.club, clubFromId?.name]
          .map((value) => normalize(String(value || '')))
          .filter(Boolean);

        keys.forEach((key) => {
          if (!isAdmin && !preferredByKey.has(key)) {
            preferredByKey.set(key, String(u.username));
            return;
          }

          if (isAdmin && !adminFallbackByKey.has(key)) {
            adminFallbackByKey.set(key, String(u.username));
          }
        });
      });

      const clubKeyId = normalize(club.id);
      const clubKeyName = normalize(club.name);
      const preferredManager = preferredByKey.get(clubKeyId) || preferredByKey.get(clubKeyName);
      if (preferredManager) return preferredManager;

      const adminManager = adminFallbackByKey.get(clubKeyId) || adminFallbackByKey.get(clubKeyName);
      if (adminManager) return adminManager;

      const rawManager = String((club as any).manager || '').trim();
      const normalizedManager = normalize(rawManager);
      const invalidManager = ['', '-', 'n/a', 'sin dt', 'sin dt asignado'].includes(normalizedManager);
      return invalidManager ? 'Sin DT asignado' : rawManager;
    };

    const loadManager = async () => {
      try {
        const users = await fetchUsers();
        if (!cancelled) setManagerDisplayName(resolveManager(users));
      } catch {
        const users = listUsers();
        if (!cancelled) setManagerDisplayName(resolveManager(users));
      }
    };

    void loadManager();
    return () => {
      cancelled = true;
    };
  }, [club, clubs]);
  
  if (!club) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Club no encontrado</h2>
        <p className="text-gray-400 mb-8">El club que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/liga-master" className="btn-primary">
          Volver a Liga Master
        </Link>
      </div>
    );
  }
  
  // Get club players
  const clubPlayers = players
    .filter(p => p.clubId === club.id)
    .sort((a, b) => {
      if (sortBy === 'overall') {
        return sortOrder === 'desc' ? b.overall - a.overall : a.overall - b.overall;
      } else if (sortBy === 'name') {
        return sortOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name);
      } else if (sortBy === 'age') {
        return sortOrder === 'desc' ? b.age - a.age : a.age - b.age;
      } else if (sortBy === 'value') {
        const av = (a as any).transferValue ?? (a as any).value ?? 0;
        const bv = (b as any).transferValue ?? (b as any).value ?? 0;
        return sortOrder === 'desc' ? bv - av : av - bv;
      } else if (sortBy === 'position') {
        return sortOrder === 'desc' 
          ? b.position.localeCompare(a.position) 
          : a.position.localeCompare(b.position);
      }
      return 0;
    });
  
  // Toggle sort order
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Open player stats modal
  const openPlayerStats = (player: any) => {
    setSelectedPlayer(player);
    setIsStatsModalOpen(true);
  };

  // Close player stats modal
  const closePlayerStats = () => {
    setSelectedPlayer(null);
    setIsStatsModalOpen(false);
  };

  // Handle transfer listing toggle
  const handleTransferToggle = async (playerId: string) => {
    if (pendingTransferIds.includes(playerId)) return;

    setPendingTransferIds((prev) => [...prev, playerId]);

    try {
      const updatedPlayer = await togglePlayerTransferListing(playerId);
      if (updatedPlayer) {
        await updatePlayers(
          (useDataStore.getState() as any).players.map((player: any) =>
            player.id === playerId
              ? { ...player, transferListed: updatedPlayer.transferListed, transferValue: updatedPlayer.transferValue }
              : player
          )
        );
      }
    } catch (error) {
      console.error('Error toggling transfer listing:', error);
    } finally {
      setPendingTransferIds((prev) => prev.filter((id) => id !== playerId));
    }
  };

  const openReleaseModal = (player: any) => {
    setPlayerToRelease(player);
  };

  const closeReleaseModal = () => {
    setPlayerToRelease(null);
  };

  const handleReleasePlayer = async () => {
    if (!playerToRelease || pendingReleaseIds.includes(playerToRelease.id) || !club) {
      return;
    }

    const playerId = playerToRelease.id;
    const instantReleasePrice = calculateReleasePriceByRating(playerToRelease.overall);

    setPendingReleaseIds((prev) => [...prev, playerId]);

    try {
      const releasedPlayer = {
        ...playerToRelease,
        clubId: 'libre',
        transferListed: true,
        transferValue: calculateMarketValueByRating(playerToRelease.overall),
      };

      const updatedPlayer = await updatePlayer(releasedPlayer);
      const updatedClub = {
        ...club,
        budget: (club.budget || 0) + instantReleasePrice,
      };

      await updateClub(updatedClub);
      await updatePlayers(
        (useDataStore.getState() as any).players.map((player: any) =>
          player.id === playerId ? updatedPlayer : player
        )
      );
      closeReleaseModal();
    } catch (error) {
      console.error('Error releasing player to market:', error);
    } finally {
      setPendingReleaseIds((prev) => prev.filter((id) => id !== playerId));
    }
  };
  
  // Group players by position
  const playersByPosition = {
    PT: clubPlayers.filter(p => ['PT'].includes(p.position)),
    DEF: clubPlayers.filter(p => ['DEC','LI','LD'].includes(p.position)),
    MED: clubPlayers.filter(p => ['MCD','MC','MO','MDI','MDD'].includes(p.position)),
    DEL: clubPlayers.filter(p => ['EXI','EXD','CD','SD'].includes(p.position))
  } as const;
  
  return (
    <div>
      <PageHeader 
        title={`Plantilla de ${club.name}`} 
        subtitle="Jugadores, estadisticas y formacion tactica del club."
        image="https://images.unsplash.com/photo-1761258772724-93af34d20241?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        {!isCurrentUserDTOfClub && (
          <div className="mb-6">
            <Link
              to={`/liga-master/club/${clubName}`}
              className="inline-flex items-center text-primary hover:text-primary-light"
            >
              <ChevronLeft size={16} className="mr-1" />
              <span>Volver al perfil del club</span>
            </Link>
          </div>
        )}
        
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4 border-2 border-primary/30 shadow-xl">
              <img src={(club as any).logo || (club as any).shield} alt={club.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{club.name}</h2>
              <p className="text-gray-400 text-lg">
                Director Técnico:{' '}
                {managerDisplayName === 'Sin DT asignado' ? (
                  <span className="text-gray-300 font-medium">{managerDisplayName}</span>
                ) : (
                  <Link
                    to={`/usuarios/${encodeURIComponent(managerDisplayName)}`}
                    className="text-primary hover:text-primary-light transition-colors duration-200 font-medium"
                  >
                    {managerDisplayName}
                  </Link>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 border border-slate-700/50 transition-all duration-200 hover:shadow-lg hover:scale-105">
              <Users size={28} className="text-primary mb-3" />
              <p className="text-gray-400 text-sm font-medium">Jugadores</p>
              <p className="text-3xl font-bold text-white">{clubPlayers.length}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 border border-slate-700/50 transition-all duration-200 hover:shadow-lg hover:scale-105">
              <Database size={28} className="text-primary mb-3" />
              <p className="text-gray-400 text-sm font-medium">Media global</p>
              <p className="text-3xl font-bold text-white">
                {clubPlayers.length ? Math.round(clubPlayers.reduce((sum, p) => sum + p.overall, 0) / clubPlayers.length) : 0}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 border border-slate-700/50 transition-all duration-200 hover:shadow-lg hover:scale-105">
              <Shield size={28} className="text-primary mb-3" />
              <p className="text-gray-400 text-sm font-medium">Valor del plantel</p>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(clubPlayers.reduce((sum, p) => sum + ((p as any).transferValue ?? (p as any).value ?? 0), 0))}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 border border-slate-700/50 transition-all duration-200 hover:shadow-lg hover:scale-105">
              <Users size={28} className="text-primary mb-3" />
              <p className="text-gray-400 text-sm font-medium">Edad promedio</p>
              <p className="text-3xl font-bold text-white">
                {Math.round(clubPlayers.reduce((sum, p) => sum + p.age, 0) / clubPlayers.length)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl mb-10">
          <div className="p-6 bg-slate-800/30 border-b border-slate-700/50">
            <h3 className="font-bold text-2xl flex items-center text-white">
              <Users size={24} className="mr-3 text-primary" />
              Plantilla Completa
              <span className="ml-3 px-3 py-1 bg-primary/20 text-primary text-sm font-semibold rounded-full">({clubPlayers.length} jugadores)</span>
            </h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Haz clic en el ícono <Eye size={14} className="inline mx-1 text-primary" /> junto al nombre de cada jugador para ver sus atributos, habilidades y estilos de juego completos.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50 text-xs uppercase text-slate-300 border-b border-slate-600/50 font-semibold">
                  <th className="px-4 py-3 text-left">
                    <button
                      className="flex items-center"
                      onClick={() => toggleSort('name')}
                    >
                      Jugador
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      className="flex items-center justify-center"
                      onClick={() => toggleSort('position')}
                    >
                      Pos
                      {sortBy === 'position' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">Dorsal</th>
                  <th className="px-4 py-3 text-center">
                    <button
                      className="flex items-center justify-center"
                      onClick={() => toggleSort('age')}
                    >
                      Edad
                      {sortBy === 'age' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      className="flex items-center justify-center"
                      onClick={() => toggleSort('overall')}
                    >
                      Media
                      {sortBy === 'overall' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">Nacionalidad</th>
                  <th className="px-4 py-3 text-center">Goles</th>
                  <th className="px-4 py-3 text-center">
                    <button
                      className="flex items-center justify-center"
                      onClick={() => toggleSort('value')}
                    >
                      Valor
                      {sortBy === 'value' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                  {isCurrentUserDTOfClub && (
                    <th className="px-4 py-3 text-center">Transferible</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {clubPlayers.map(player => (
                  <tr key={player.id} className="border-b border-slate-600/50 hover:bg-slate-700/30 transition-all duration-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold">{player.dorsal}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{player.name}</span>
                            <button
                              onClick={() => openPlayerStats(player)}
                              className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-xs transition-all duration-200 hover:scale-110 shadow-md hover:shadow-primary/20"
                              title="Ver estadísticas detalladas"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPositionColor(player.position)}`}>
                        {getTranslatedPosition(player.position)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{player.dorsal}</td>
                    <td className="px-4 py-3 text-center">{player.age}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getOverallColor(player.overall)}`}>
                        {player.overall}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{player.nationality}</td>
                    <td className="px-4 py-3 text-center">{player.goals}</td>
                    <td className="px-4 py-3 text-center font-medium">{formatCurrency(((player as any).transferValue ?? (player as any).value ?? 0) as number)}</td>
                    {isCurrentUserDTOfClub && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openReleaseModal(player)}
                            disabled={pendingReleaseIds.includes(player.id)}
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 shadow-md bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:shadow-red-500/20 ${
                              pendingReleaseIds.includes(player.id) ? 'opacity-60 cursor-wait hover:scale-100' : ''
                            }`}
                            title="Liberar jugador al mercado por precio instantaneo"
                          >
                            <AlertTriangle size={14} className="mr-2" />
                            Liberar
                          </button>
                          <button
                            onClick={() => handleTransferToggle(player.id)}
                            disabled={pendingTransferIds.includes(player.id)}
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 shadow-md ${
                              player.transferListed
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:shadow-green-500/20'
                                : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 hover:shadow-slate-500/20'
                            } ${pendingTransferIds.includes(player.id) ? 'opacity-60 cursor-wait hover:scale-100' : ''}`}
                            title={player.transferListed ? 'Quitar de lista de transferibles' : 'Poner en lista de transferibles'}
                          >
                            <ShoppingCart size={14} className="mr-2" />
                            {player.transferListed ? 'En venta' : 'No en venta'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        <div>
          <h3 className="text-3xl font-bold mb-8 text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Jugadores por posición</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-b border-slate-600/50">
                <h4 className="font-bold text-lg flex items-center text-yellow-400">
                  <span className="inline-block w-4 h-4 rounded-full bg-yellow-500 mr-3 shadow-lg"></span>
                  Porteros
                </h4>
              </div>
              
              <div className="p-4">
                {playersByPosition.PT.length > 0 ? (
                  <div className="space-y-3">
                    {playersByPosition.PT.map(player => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-bold">{player.dorsal}</span>
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-xs text-gray-400">{player.age} años</p>
                            </div>
                          </div>
                          <button
                            onClick={() => openPlayerStats(player)}
                            className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-xs transition-all duration-200 hover:scale-110 shadow-md hover:shadow-primary/20"
                            title="Ver estadísticas detalladas"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getOverallColor(player.overall)}`}>
                          {player.overall}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-2">No hay porteros</p>
                )}
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-b border-slate-600/50">
                <h4 className="font-bold text-lg flex items-center text-blue-400">
                  <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mr-3 shadow-lg"></span>
                  Defensas
                </h4>
              </div>
              
              <div className="p-4">
                {playersByPosition.DEF.length > 0 ? (
                  <div className="space-y-3">
                    {playersByPosition.DEF.map(player => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-bold">{player.dorsal}</span>
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-xs text-gray-400">{player.age} años</p>
                            </div>
                          </div>
                          <button
                            onClick={() => openPlayerStats(player)}
                            className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-xs transition-all duration-200 hover:scale-110 shadow-md hover:shadow-primary/20"
                            title="Ver estadísticas detalladas"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getOverallColor(player.overall)}`}>
                          {player.overall}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-2">No hay defensas</p>
                )}
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-green-500/10 to-green-500/5 border-b border-slate-600/50">
                <h4 className="font-bold text-lg flex items-center text-green-400">
                  <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-3 shadow-lg"></span>
                  Mediocampistas
                </h4>
              </div>
              
              <div className="p-4">
                {playersByPosition.MED.length > 0 ? (
                  <div className="space-y-3">
                    {playersByPosition.MED.map(player => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-bold">{player.dorsal}</span>
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-xs text-gray-400">{player.age} años</p>
                            </div>
                          </div>
                          <button
                            onClick={() => openPlayerStats(player)}
                            className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-xs transition-all duration-200 hover:scale-110 shadow-md hover:shadow-primary/20"
                            title="Ver estadísticas detalladas"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getOverallColor(player.overall)}`}>
                          {player.overall}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-2">No hay mediocampistas</p>
                )}
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-red-500/10 to-red-500/5 border-b border-slate-600/50">
                <h4 className="font-bold text-lg flex items-center text-red-400">
                  <span className="inline-block w-4 h-4 rounded-full bg-red-500 mr-3 shadow-lg"></span>
                  Delanteros
                </h4>
              </div>
              
              <div className="p-4">
                {playersByPosition.DEL.length > 0 ? (
                  <div className="space-y-3">
                    {playersByPosition.DEL.map(player => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-bold">{player.dorsal}</span>
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-xs text-gray-400">{player.age} años</p>
                            </div>
                          </div>
                          <button
                            onClick={() => openPlayerStats(player)}
                            className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-xs transition-all duration-200 hover:scale-110 shadow-md hover:shadow-primary/20"
                            title="Ver estadísticas detalladas"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getOverallColor(player.overall)}`}>
                          {player.overall}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-2">No hay delanteros</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player Stats Modal */}
        {selectedPlayer && (
          <PlayerStatsModal
            player={selectedPlayer}
            isOpen={isStatsModalOpen}
            onClose={closePlayerStats}
          />
        )}

        {playerToRelease && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeReleaseModal}
              aria-label="Cerrar modal"
            />
            <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-slate-900/95 shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Confirmar liberacion</h4>
                  <p className="text-xs text-slate-400">Esta accion enviara al jugador al mercado.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 mb-5">
                <p className="text-sm text-slate-300 mb-2">Jugador:</p>
                <p className="text-white font-semibold">{playerToRelease.name}</p>
                <p className="text-sm text-slate-300 mt-3 mb-1">Ingreso instantaneo:</p>
                <p className="text-lg font-bold text-emerald-300">
                  {formatCurrency(calculateReleasePriceByRating(playerToRelease.overall))}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeReleaseModal}
                  className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleReleasePlayer}
                  disabled={pendingReleaseIds.includes(playerToRelease.id)}
                  className={`px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors ${
                    pendingReleaseIds.includes(playerToRelease.id) ? 'opacity-60 cursor-wait' : ''
                  }`}
                >
                  {pendingReleaseIds.includes(playerToRelease.id) ? 'Liberando...' : 'Confirmar liberacion'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getOverallColor = (overall: number) => {
  if (overall >= 85) return 'bg-green-500/20 text-green-500';
  if (overall >= 80) return 'bg-blue-500/20 text-blue-400';
  if (overall >= 75) return 'bg-yellow-500/20 text-yellow-500';
  return 'bg-gray-500/20 text-gray-400';
};

export default ClubSquad;
 

