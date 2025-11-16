import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Settings, Users, Trophy, ShoppingCart, Calendar, FileText, Clipboard, BarChart, Activity } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = () => {
  const { isAuthenticated, hasRole } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated || !hasRole('admin')) {
    navigate('/login');
    return null;
  }

  const linkBase = 'w-full flex items-center p-3 rounded-md text-left transition-colors mb-1 hover:bg-dark-lighter text-gray-300';
  const linkActive = 'bg-primary text-white';

  return (
    <div className="min-h-screen bg-dark">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-64 bg-dark-light border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Settings size={20} className="text-primary mr-2" />
              Panel Admin
            </h2>
            <p className="text-xs text-gray-400 mt-1">Administración de La Virtual Zone</p>
          </div>

          <nav className="p-2">
            <NavLink to="." end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <Clipboard size={18} className="mr-3" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="usuarios" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <Users size={18} className="mr-3" />
              <span>Usuarios</span>
            </NavLink>

            <NavLink to="clubes" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <Trophy size={18} className="mr-3" />
              <span>Clubes</span>
            </NavLink>

            <NavLink to="jugadores" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <Users size={18} className="mr-3" />
              <span>Jugadores</span>
            </NavLink>

            <NavLink to="mercado" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <ShoppingCart size={18} className="mr-3" />
              <span>Mercado</span>
            </NavLink>

            <NavLink to="torneos" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <Trophy size={18} className="mr-3" />
              <span>Torneos</span>
            </NavLink>

            <NavLink to="partidos" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <Activity size={18} className="mr-3" />
              <span>Partidos</span>
            </NavLink>

            <NavLink to="noticias" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <FileText size={18} className="mr-3" />
              <span>Noticias</span>
            </NavLink>

            <NavLink to="estadisticas" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <BarChart size={18} className="mr-3" />
              <span>Estadísticas</span>
            </NavLink>

            <NavLink to="calendario" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
              <Calendar size={18} className="mr-3" />
              <span>Calendario</span>
            </NavLink>

            <div className="border-t border-gray-800 my-2 pt-2">
              <button onClick={() => navigate('/')} className="w-full flex items-center p-3 rounded-md text-gray-400 hover:bg-dark-lighter">
                <span>Volver al sitio</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="flex-grow p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

