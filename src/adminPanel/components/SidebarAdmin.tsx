import  { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Users, Globe, User, ShoppingBag, Award, FileText, MessageCircle, Activity, BarChart, Calendar } from 'lucide-react';
import { useGlobalStore } from '../store/globalStore';
import { useAuth } from '../contexts/AuthContext';

const SidebarAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
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
        fixed md:static top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-800/95 to-gray-900/95 border-r border-gray-700/50 backdrop-blur-xl z-50 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">VZ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">La Virtual Zone</h1>
              <p className="text-gray-400 text-sm">Panel de Administración</p>
            </div>
          </div>
        </div> 
        
               <nav className="px-4 space-y-2 mt-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setIsOpen(false)}
              aria-label={item.name}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors">
                <item.icon size={18} />
              </div>
              <span className="font-medium">{item.name}</span>
              {item.badge && item.badge > 0 && (
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
 