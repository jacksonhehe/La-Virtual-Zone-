import  { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Users, Globe, User, ShoppingBag, Award, FileText, MessageCircle, Activity, BarChart, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGlobalStore } from '../store/globalStore';
import { useAuth } from '../contexts/AuthContext';
import { useSidebarStore } from '../store/sidebarStore';

const SidebarAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { collapsed, toggle } = useSidebarStore();
  const { transfers } = useGlobalStore();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const pendingTransfers = transfers.filter(t => t.status === 'pending').length;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
    { name: 'Clubes', href: '/admin/clubes', icon: Globe },
    { name: 'Jugadores', href: '/admin/jugadores', icon: User },
    { name: 'Mercado', href: '/admin/mercado', icon: ShoppingBag, badge: pendingTransfers || undefined },
    { name: 'Torneos', href: '/admin/torneos', icon: Award },
    { name: 'Noticias', href: '/admin/noticias', icon: FileText },
    { name: 'Comentarios', href: '/admin/comentarios', icon: MessageCircle },
    { name: 'Actividad', href: '/admin/actividad', icon: Activity },
    { name: 'Estadísticas', href: '/admin/estadisticas', icon: BarChart },
    { name: 'Calendario', href: '/admin/calendario', icon: Calendar }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' && window.innerWidth < 768) {
        setIsOpen(!isOpen);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
           <div className={`
        fixed md:static top-0 left-0 h-full ${collapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-gray-800/95 to-gray-900/95 border-r border-gray-700/50 backdrop-blur-xl z-50 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">VZ</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold gradient-text">La Virtual Zone</h1>
                <p className="text-gray-400 text-sm">Panel de Administración</p>
              </div>
            )}
          </div>
          {/* Botón colapsar */}
          <button
            onClick={toggle}
            className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-700/50 transition-colors"
            aria-label="Collapse sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div> 
        
        <nav className="px-2 md:px-4 space-y-2 mt-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) =>
                `sidebar-link group relative ${isActive ? 'active border-l-4 border-purple-500' : ''}`
              }
              onClick={() => setIsOpen(false)}
              aria-label={item.name}
            >
              {/* Icon Container */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors">
                <item.icon size={18} />
              </div>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-800 text-gray-100 text-xs px-2 py-1 rounded-lg shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50">
                  {item.name}
                </span>
              )}

              {/* Text label for expanded mode */}
              {!collapsed && (
                <span className="font-medium transition-opacity duration-200">
                  {item.name}
                </span>
              )}

              {/* Badge */}
              {item.badge && item.badge > 0 && !collapsed && (
                <span className="ml-auto bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs rounded-full px-2.5 py-1 font-bold shadow-lg animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SidebarAdmin;
 