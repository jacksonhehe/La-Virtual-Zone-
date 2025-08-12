import  { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Globe, User, ShoppingBag, TrendingUp, Activity, AlertCircle, CheckCircle, Clock, Star, Trophy, Target, Sun, Moon } from 'lucide-react'; 
import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { fetchClubs } from '../../../services/clubs';
import { fetchPlayers } from '../../../services/players';
import { fetchTransfers } from '../../../services/transfers';
import { fetchNews } from '../../../services/news';
import { fetchTournaments } from '../../../services/tournaments';
import { getAllProfiles } from '../../../services/profiles';
import type { Club, PlayerFlat, TransferWithDetails, NewsWithAuthor, Tournament, Profile } from '../../../types/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [players, setPlayers] = useState<PlayerFlat[]>([]);
  const [transfers, setTransfers] = useState<TransferWithDetails[]>([]);
  const [news, setNews] = useState<NewsWithAuthor[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDark, setIsDark] = useState(true);
  const [activitiesCount, setActivitiesCount] = useState(5);

  const usersChartRef = useRef<HTMLDivElement>(null);
  const positionsChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [clubsData, playersData, transfersData, newsData, tournamentsData, profilesData] = await Promise.all([
          fetchClubs(),
          fetchPlayers(),
          fetchTransfers(),
          fetchNews(),
          fetchTournaments(),
          getAllProfiles()
        ]);

        if (clubsData.error) throw new Error(clubsData.error.message);
        if (playersData.error) throw new Error(playersData.error.message);
        if (transfersData.error) throw new Error(transfersData.error.message);
        if (newsData.error) throw new Error(newsData.error.message);
        if (tournamentsData.error) throw new Error(tournamentsData.error.message);
        if (profilesData.error) throw new Error(profilesData.error.message);

        setClubs(clubsData.data || []);
        setPlayers(playersData.data || []);
        setTransfers(transfersData.data || []);
        setNews(newsData.data || []);
        setTournaments(tournamentsData.data || []);
        setProfiles(profilesData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadChart = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
    setIsDark(!isDark);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') ?? 'dark';
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-400 text-xl">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Distribución de posiciones de jugadores para PieChart
  const positionCounts: Record<string, number> = {};
  players.forEach(p => {
    positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
  });
  const pieData = Object.entries(positionCounts).map(([pos, value]) => ({ name: pos, value }));
  const pieColors = ['#8b5cf6', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#e11d48'];

  const kpiData = [
    { name: 'Ene', users: 4, revenue: 2400 },
    { name: 'Feb', users: 3, revenue: 1398 },
    { name: 'Mar', users: 2, revenue: 9800 },
    { name: 'Abr', users: 8, revenue: 3908 },
    { name: 'May', users: 12, revenue: 4800 },
    { name: 'Jun', users: 9, revenue: 3800 }
  ];

  const pendingTransfers = transfers.filter(t => t.status === 'pending').length;
  const recentActivities = news.slice(-activitiesCount);

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20' : 'bg-gradient-to-br from-gray-100 via-white to-gray-200'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden glass-card bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white p-2 rounded-full transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div> 
          <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl">
                  <Activity size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Dashboard Administrativo
                  </h1>
                  <p className="text-xl text-gray-300 mt-2">
                    Panel de control y gestión de La Virtual Zone
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-white">{profiles.length}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Users size={24} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-green-500/20 to-green-600/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Clubes</p>
                <p className="text-2xl font-bold text-white">{clubs.length}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <Trophy size={24} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Jugadores</p>
                <p className="text-2xl font-bold text-white">{players.length}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <User size={24} className="text-purple-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Transferencias Pendientes</p>
                <p className="text-2xl font-bold text-white">{pendingTransfers}</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-full">
                <ShoppingBag size={24} className="text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Growth Chart */}
          <div className="glass-card p-6" ref={usersChartRef}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Crecimiento de Usuarios</h3>
              <button
                onClick={() => downloadChart(usersChartRef, 'users-growth')}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Descargar
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Player Positions Chart */}
          <div className="glass-card p-6" ref={positionsChartRef}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Distribución de Posiciones</h3>
              <button
                onClick={() => downloadChart(positionsChartRef, 'player-positions')}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Descargar
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Actividad Reciente</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActivitiesCount(Math.max(5, activitiesCount - 5))}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Menos
              </button>
              <button
                onClick={() => setActivitiesCount(activitiesCount + 5)}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Más
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Activity size={16} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-400">
                    {activity.author?.username || 'Usuario'} • {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(activity.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
 