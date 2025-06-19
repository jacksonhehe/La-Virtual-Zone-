import  { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Settings,
  Users,
  Trophy,
  ShoppingCart,
  Calendar,
  FileText,
  Clipboard,
  BarChart,
  Edit,
  Plus,
  Trash,
  Check,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { processTransfer } from '../utils/transferService';
import { formatCurrency, getStatusBadge } from '../utils/helpers';
import { clubs, players } from '../data/mockData';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const {
    offers,
    marketStatus,
    updateMarketStatus,
    updateOfferStatus,
    tournaments,
    addTournament,
    updateTournaments
  } = useDataStore();

  const [newTournamentName, setNewTournamentName] = useState('');
  const [newTournamentType, setNewTournamentType] = useState<'league' | 'cup' | 'friendly'>('league');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  const handleAddTournament = (e: React.FormEvent) => {
    e.preventDefault();
    const tournament = {
      id: `tournament${Date.now()}`,
      name: newTournamentName,
      type: newTournamentType,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(newTournamentName)}&background=4f46e5&color=fff&size=128&bold=true`,
      startDate: newStartDate,
      endDate: newEndDate,
      status: 'upcoming' as const,
      teams: [],
      rounds: 0,
      matches: [],
      description: ''
    };
    addTournament(tournament);
    setNewTournamentName('');
    setNewTournamentType('league');
    setNewStartDate('');
    setNewEndDate('');
  };

  const handleEditTournament = (id: string) => {
    const t = tournaments.find(tour => tour.id === id);
    if (!t) return;
    const name = prompt('Nombre del torneo', t.name);
    if (!name) return;
    const updated = tournaments.map(tour =>
      tour.id === id ? { ...tour, name } : tour
    );
    updateTournaments(updated);
  };

  const handleDeleteTournament = (id: string) => {
    updateTournaments(tournaments.filter(tour => tour.id !== id));
  };

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen bg-dark">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-dark-light border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Settings size={20} className="text-primary mr-2" />
              Panel Admin
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Administración de La Virtual Zone
            </p>
          </div>
          
          <nav className="p-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Clipboard size={18} className="mr-3" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'users' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Users size={18} className="mr-3" />
              <span>Usuarios</span>
            </button>
            
            <button
              onClick={() => setActiveTab('clubs')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'clubs' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Trophy size={18} className="mr-3" />
              <span>Clubes</span>
            </button>
            
            <button
              onClick={() => setActiveTab('players')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'players' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Users size={18} className="mr-3" />
              <span>Jugadores</span>
            </button>
            
            <button
              onClick={() => setActiveTab('market')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'market' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <ShoppingCart size={18} className="mr-3" />
              <span>Mercado</span>
            </button>
            
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'tournaments' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Trophy size={18} className="mr-3" />
              <span>Torneos</span>
            </button>
            
            <button
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'news' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <FileText size={18} className="mr-3" />
              <span>Noticias</span>
            </button>
            
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'stats' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <BarChart size={18} className="mr-3" />
              <span>Estadísticas</span>
            </button>
            
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 ${activeTab === 'calendar' ? 'bg-primary text-white' : 'hover:bg-dark-lighter text-gray-300'}`}
            >
              <Calendar size={18} className="mr-3" />
              <span>Calendario</span>
            </button>
            
            <div className="border-t border-gray-800 my-2 pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center p-3 rounded-md text-left text-gray-400 hover:bg-dark-lighter"
              >
                <span>Volver al sitio</span>
              </button>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-grow p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-dark-light rounded-lg p-6 border border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Usuarios totales</p>
                  <h3 className="text-2xl font-bold">205</h3>
                  <p className="text-xs text-green-500 mt-1">+12 esta semana</p>
                </div>
                
                <div className="bg-dark-light rounded-lg p-6 border border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Clubes activos</p>
                  <h3 className="text-2xl font-bold">{clubs.length}</h3>
                  <p className="text-xs text-yellow-500 mt-1">3 sin DT asignado</p>
                </div>
                
                <div className="bg-dark-light rounded-lg p-6 border border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Transferencias</p>
                  <h3 className="text-2xl font-bold">27</h3>
                  <p className="text-xs text-green-500 mt-1">+8 esta semana</p>
                </div>
                
                <div className="bg-dark-light rounded-lg p-6 border border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Partidos jugados</p>
                  <h3 className="text-2xl font-bold">21</h3>
                  <p className="text-xs text-gray-400 mt-1">7 por jornada</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Actividad reciente</h3>
                <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <Users size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Nuevo usuario registrado</p>
                          <p className="text-sm text-gray-400">user2024 se ha registrado</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Hace 2 horas</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                          <ShoppingCart size={18} className="text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium">Fichaje completado</p>
                          <p className="text-sm text-gray-400">Rayo Digital FC ha fichado a un nuevo jugador</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Hace 5 horas</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                          <Trophy size={18} className="text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Partido finalizado</p>
                          <p className="text-sm text-gray-400">Rayo Digital FC 3-1 Neón FC</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Hace 1 día</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Estado del sistema</h3>
                  <div className="bg-dark-light rounded-lg border border-gray-800 p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Mercado de fichajes</span>
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          <span className="font-medium">Abierto</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Jornada actual</span>
                        <span className="font-medium">Jornada 3/38</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Temporada</span>
                        <span className="font-medium">2025</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Próxima jornada</span>
                        <span className="font-medium">5 de septiembre, 2025</span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <button className="btn-primary w-full">
                          Administrar estado del sistema
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Acciones rápidas</h3>
                  <div className="bg-dark-light rounded-lg border border-gray-800 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button className="btn-outline py-3 flex flex-col items-center justify-center">
                        <Users size={18} className="mb-1" />
                        <span className="text-sm">Gestionar usuarios</span>
                      </button>
                      
                      <button className="btn-outline py-3 flex flex-col items-center justify-center">
                        <ShoppingCart size={18} className="mb-1" />
                        <span className="text-sm">Abrir/cerrar mercado</span>
                      </button>
                      
                      <button className="btn-outline py-3 flex flex-col items-center justify-center">
                        <Trophy size={18} className="mb-1" />
                        <span className="text-sm">Crear torneo</span>
                      </button>
                      
                      <button className="btn-outline py-3 flex flex-col items-center justify-center">
                        <Calendar size={18} className="mb-1" />
                        <span className="text-sm">Registrar resultados</span>
                      </button>
                      
                      <button className="btn-outline py-3 flex flex-col items-center justify-center">
                        <FileText size={18} className="mb-1" />
                        <span className="text-sm">Crear noticia</span>
                      </button>
                      
                      <button className="btn-outline py-3 flex flex-col items-center justify-center">
                        <Settings size={18} className="mb-1" />
                        <span className="text-sm">Configuración</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
                <button className="btn-primary flex items-center">
                  <Plus size={16} className="mr-2" />
                  Nuevo usuario
                </button>
              </div>
              
              <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                        <th className="px-4 py-3 text-left">Usuario</th>
                        <th className="px-4 py-3 text-center">Correo</th>
                        <th className="px-4 py-3 text-center">Rol</th>
                        <th className="px-4 py-3 text-center">Club</th>
                        <th className="px-4 py-3 text-center">Estado</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800 hover:bg-dark-lighter">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                              <img src="https://ui-avatars.com/api/?name=Admin&background=111827&color=fff&size=128" alt="admin" />
                            </div>
                            <span className="font-medium">admin</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">admin@virtualzone.com</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-1 bg-neon-red/20 text-neon-red text-xs rounded-full">
                            Admin
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">Rayo Digital FC</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            Activo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-primary">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-500">
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      <tr className="border-b border-gray-800 hover:bg-dark-lighter">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                              <img src="https://ui-avatars.com/api/?name=PM&background=10b981&color=fff&size=128" alt="pixelmanager" />
                            </div>
                            <span className="font-medium">pixelmanager</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">pixel@virtualzone.com</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded-full">
                            DT
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">Atlético Pixelado</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            Activo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-primary">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-500">
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      <tr className="border-b border-gray-800 hover:bg-dark-lighter">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                              <img src="https://ui-avatars.com/api/?name=LD&background=f59e0b&color=fff&size=128" alt="lagdefender" />
                            </div>
                            <span className="font-medium">lagdefender</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">lag@virtualzone.com</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded-full">
                            DT
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">Defensores del Lag</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            Activo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-primary">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-500">
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      <tr className="border-b border-gray-800 hover:bg-dark-lighter">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                              <img src="https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=128" alt="user2024" />
                            </div>
                            <span className="font-medium">user2024</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">user@virtualzone.com</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                            Usuario
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">-</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            Activo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-primary">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-500">
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'clubs' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestión de Clubes</h2>
                <button className="btn-primary flex items-center">
                  <Plus size={16} className="mr-2" />
                  Nuevo club
                </button>
              </div>
              
              <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                        <th className="px-4 py-3 text-left">Club</th>
                        <th className="px-4 py-3 text-center">Fundación</th>
                        <th className="px-4 py-3 text-center">DT</th>
                        <th className="px-4 py-3 text-center">Presupuesto</th>
                        <th className="px-4 py-3 text-center">Estilo</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubs.map(club => (
                        <tr key={club.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                                <img src={club.logo} alt={club.name} />
                              </div>
                              <span className="font-medium">{club.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{club.foundedYear}</td>
                          <td className="px-4 py-3 text-center">{club.manager}</td>
                          <td className="px-4 py-3 text-center">
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            }).format(club.budget)}
                          </td>
                          <td className="px-4 py-3 text-center">{club.playStyle}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-primary">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-500">
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'players' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestión de Jugadores</h2>
                <button className="btn-primary flex items-center">
                  <Plus size={16} className="mr-2" />
                  Nuevo jugador
                </button>
              </div>
              
              <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                        <th className="px-4 py-3 text-left">Jugador</th>
                        <th className="px-4 py-3 text-center">Pos</th>
                        <th className="px-4 py-3 text-center">Media</th>
                        <th className="px-4 py-3 text-center">Edad</th>
                        <th className="px-4 py-3 text-center">Club</th>
                        <th className="px-4 py-3 text-center">Valor</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.slice(0, 5).map(player => (
                        <tr key={player.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-bold">{player.id}</span>
                              </div>
                              <div>
                                <div className="font-medium">{player.name}</div>
                                <div className="text-xs text-gray-400">{player.nationality}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{player.position}</td>
                          <td className="px-4 py-3 text-center font-medium">{player.overall}</td>
                          <td className="px-4 py-3 text-center">{player.age}</td>
                          <td className="px-4 py-3 text-center">{clubs.find(c => c.id === player.clubId)?.name}</td>
                          <td className="px-4 py-3 text-center font-medium">
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            }).format(player.transferValue)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-primary">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-500">
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Gestión de Mercado</h2>

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">Estado:</span>
                  <span className={marketStatus ? 'text-green-400' : 'text-red-400'}>
                    {marketStatus ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
                <button
                  onClick={() => updateMarketStatus(!marketStatus)}
                  className="btn-primary"
                >
                  {marketStatus ? 'Cerrar mercado' : 'Abrir mercado'}
                </button>
              </div>

              <div className="bg-dark-light rounded-lg border border-gray-800 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                      <th className="px-4 py-3 text-left">Jugador</th>
                      <th className="px-4 py-3 text-center">Vendedor</th>
                      <th className="px-4 py-3 text-center">Comprador</th>
                      <th className="px-4 py-3 text-center">Cantidad</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map(offer => (
                      <tr key={offer.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                        <td className="px-4 py-3">{offer.playerName}</td>
                        <td className="px-4 py-3 text-center">{offer.fromClub}</td>
                        <td className="px-4 py-3 text-center">{offer.toClub}</td>
                        <td className="px-4 py-3 text-center">{formatCurrency(offer.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={getStatusBadge(offer.status)}>{offer.status}</span>
                        </td>
                        <td className="px-4 py-3 text-center space-x-2">
                          {offer.status === 'pending' && (
                            <>
                              <button
                                className="btn-primary btn-sm"
                                onClick={() => {
                                  const res = processTransfer(offer.id);
                                  if (res) alert(res);
                                }}
                              >
                                <Check size={14} className="inline" />
                              </button>
                              <button
                                className="btn-secondary btn-sm"
                                onClick={() => updateOfferStatus(offer.id, 'rejected')}
                              >
                                <X size={14} className="inline" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Gestión de Torneos</h2>

              <form onSubmit={handleAddTournament} className="mb-6 grid md:grid-cols-4 gap-4">
                <input
                  type="text"
                  className="input"
                  placeholder="Nombre"
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                  required
                />
                <select
                  className="input"
                  value={newTournamentType}
                  onChange={(e) => setNewTournamentType(e.target.value as 'league' | 'cup' | 'friendly')}
                >
                  <option value="league">Liga</option>
                  <option value="cup">Copa</option>
                  <option value="friendly">Amistoso</option>
                </select>
                <input
                  type="date"
                  className="input"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  required
                />
                <input
                  type="date"
                  className="input"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary md:col-span-4">Crear Torneo</button>
              </form>

              <div className="bg-dark-light rounded-lg border border-gray-800 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                      <th className="px-4 py-3 text-left">Nombre</th>
                      <th className="px-4 py-3 text-center">Tipo</th>
                      <th className="px-4 py-3 text-center">Inicio</th>
                      <th className="px-4 py-3 text-center">Fin</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map(t => (
                      <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                        <td className="px-4 py-3">{t.name}</td>
                        <td className="px-4 py-3 text-center capitalize">{t.type}</td>
                        <td className="px-4 py-3 text-center">{t.startDate}</td>
                        <td className="px-4 py-3 text-center">{t.endDate}</td>
                        <td className="px-4 py-3 text-center space-x-2">
                          <button
                            className="p-1 text-gray-400 hover:text-primary"
                            onClick={() => handleEditTournament(t.id)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteTournament(t.id)}
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Gestión de Noticias</h2>
              <div className="bg-dark-light rounded-lg border border-gray-800 p-6 text-gray-300">
                Panel para crear y editar noticias de la liga.
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Estadísticas Generales</h2>
              <div className="bg-dark-light rounded-lg border border-gray-800 p-6 text-gray-300">
                Resumen estadístico de clubes y jugadores.
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Calendario de Partidos</h2>
              <div className="bg-dark-light rounded-lg border border-gray-800 p-6 text-gray-300">
                Gestión del calendario de encuentros y eventos.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
 