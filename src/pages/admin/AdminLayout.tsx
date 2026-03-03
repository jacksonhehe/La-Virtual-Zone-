import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  BarChart,
  Calendar,
  Clipboard,
  FileText,
  Menu,
  Shield,
  Settings,
  ShoppingCart,
  Trophy,
  UserPlus,
  Users,
  X,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = () => {
  const { isAuthenticated, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [compactNav, setCompactNav] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !hasRole('admin')) {
      navigate('/login');
    }
  }, [isAuthenticated, hasRole, navigate]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location]);

  const linkBase =
    'relative w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors mb-1 border';

  const navItems = useMemo(
    () => ({
      gestion: [
        { to: '.', icon: <Clipboard size={18} />, label: 'Dashboard', end: true },
        { to: 'usuarios', icon: <Users size={18} />, label: 'Usuarios' },
        { to: 'clubes', icon: <Shield size={18} />, label: 'Clubes' },
        { to: 'jugadores', icon: <UserPlus size={18} />, label: 'Jugadores' },
        { to: 'mercado', icon: <ShoppingCart size={18} />, label: 'Mercado' }
      ],
      competicion: [
        { to: 'torneos', icon: <Trophy size={18} />, label: 'Torneos' },
        { to: 'partidos', icon: <Activity size={18} />, label: 'Partidos' },
        { to: 'calendario', icon: <Calendar size={18} />, label: 'Calendario' }
      ],
      contenido: [
        { to: 'noticias', icon: <FileText size={18} />, label: 'Noticias' },
        { to: 'estadisticas', icon: <BarChart size={18} />, label: 'Estadisticas' }
      ]
    }),
    []
  );

  const renderNav = (onNavigate?: () => void) => {
    const groups: { title: string; key: keyof typeof navItems }[] = [
      { title: 'Gestion', key: 'gestion' },
      { title: 'Competicion', key: 'competicion' },
      { title: 'Contenido', key: 'contenido' }
    ];

    return (
      <nav className="px-2 py-3 space-y-1">
        {groups.map(group => (
          <div key={group.key} className="mb-3">
            {!compactNav && <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray-500/80 px-2 mb-2">{group.title}</div>}
            {compactNav && <div className="h-px bg-gray-700/70 my-3 mx-2" aria-hidden />}
            {(navItems as any)[group.key].map((item: any) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                className={({ isActive }) =>
                  `${linkBase} ${compactNav ? 'justify-center px-0 py-2.5' : 'justify-start px-3'} ${
                    isActive
                      ? compactNav
                        ? 'border-gray-600/70 bg-dark-lighter text-gray-100'
                        : 'border-primary/30 bg-primary/10 text-gray-100'
                      : 'border-transparent text-gray-300 hover:bg-dark-lighter hover:border-gray-700/70'
                  }`
                }
                onClick={() => onNavigate?.()}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`mr-3 flex items-center justify-center rounded-lg ${
                        compactNav ? 'bg-gray-800/40 p-1.5 text-gray-200' : 'text-gray-300'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!compactNav && <span>{item.label}</span>}
                    {isActive && !compactNav && (
                      <span aria-hidden className="absolute left-0 top-0 h-full w-0.5 bg-primary/80 rounded-r"></span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    );
  };

  const renderBackButton = (onNavigate?: () => void) => (
    <button
      onClick={() => {
        navigate('/');
        onNavigate?.();
      }}
      className={`w-full flex items-center rounded-md text-gray-400 hover:bg-dark-lighter ${
        compactNav ? 'justify-center p-2' : 'justify-start p-3'
      }`}
      title="Volver al sitio"
    >
      <ArrowLeft size={16} className={compactNav ? '' : 'mr-2'} />
      {!compactNav && <span>Volver al sitio</span>}
    </button>
  );

  if (!isAuthenticated || !hasRole('admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="md:hidden sticky top-0 z-40 bg-dark border-b border-gray-800/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center text-white">
            <Settings size={20} className="text-primary mr-2" />
            <div>
              <p className="text-sm text-gray-400">Panel Admin</p>
              <p className="text-xs text-gray-500">Administracion de La Virtual Zone</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 rounded-lg border border-gray-700/70 text-gray-200 hover:bg-dark-lighter"
            aria-label={isMobileNavOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {isMobileNavOpen && (
          <div className="border-t border-gray-800/60 bg-dark-light">
            {renderNav(() => setIsMobileNavOpen(false))}
            <div className="border-t border-gray-800/60 px-2 py-2">{renderBackButton(() => setIsMobileNavOpen(false))}</div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row">
        <div
          className={`hidden md:flex ${compactNav ? 'md:w-16' : 'md:w-64'} bg-dark-light border-r border-gray-800/60 md:sticky md:top-0 md:h-screen transition-all duration-200`}
        >
          <div className="w-full h-full flex flex-col">
            <div className="p-4 border-b border-gray-800/60 space-y-3">
              <div className={compactNav ? 'flex items-center justify-center' : 'flex items-center justify-between'}>
                {compactNav ? (
                  <button
                    className="p-2 rounded-lg border border-gray-700/70 text-gray-300 hover:bg-dark-lighter"
                    onClick={() => setCompactNav(!compactNav)}
                    aria-label={compactNav ? 'Expandir sidebar' : 'Compactar sidebar'}
                    title={compactNav ? 'Expandir' : 'Compactar'}
                  >
                    {compactNav ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
                  </button>
                ) : (
                  <>
                    <div className="flex items-center">
                      <Settings size={20} className="text-primary mr-2" />
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center">Panel Admin</h2>
                        <p className="text-xs text-gray-400 mt-1">Administracion de La Virtual Zone</p>
                      </div>
                    </div>
                    <button
                      className="p-2 rounded-lg border border-gray-700/70 text-gray-300 hover:bg-dark-lighter"
                      onClick={() => setCompactNav(!compactNav)}
                      aria-label={compactNav ? 'Expandir sidebar' : 'Compactar sidebar'}
                      title={compactNav ? 'Expandir' : 'Compactar'}
                    >
                      {compactNav ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto admin-sidebar-scroll">{renderNav()}</div>
            <div className="border-t border-gray-800/60 p-2">{renderBackButton()}</div>
          </div>
        </div>

        <div className="flex-grow p-6 md:p-8 w-full max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;


