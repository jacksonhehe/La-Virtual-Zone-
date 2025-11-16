import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, Settings, Trophy, Shield, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import type { TransferOffer } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { getStatusBadge } from '../../utils/helpers';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  accepted: 'bg-green-500/10 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-300 border-red-500/30',
  'counter-offer': 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  default: 'bg-gray-500/10 text-gray-300 border-gray-600/40'
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Record<string, boolean>>({});
  const { user, isAuthenticated, logout, hasRole } = useAuthStore();
  const { offers = [], clubs = [] } = useDataStore() as { offers: TransferOffer[]; clubs: any[] };
  const navigate = useNavigate();

  const dismissedStorageKey = user ? `vz_market_notifications_${user.id}` : null;

  useEffect(() => {
    if (!dismissedStorageKey) {
      setDismissedNotifications({});
      return;
    }
    try {
      const stored = localStorage.getItem(dismissedStorageKey);
      setDismissedNotifications(stored ? JSON.parse(stored) : {});
    } catch {
      setDismissedNotifications({});
    }
  }, [dismissedStorageKey]);

  const isDT = useMemo(() => {
    if (!user) return false;
    if (user.role === 'dt') return true;
    return Array.isArray((user as any)?.roles) && (user as any).roles.includes('dt');
  }, [user]);

  const userClub = useMemo(() => {
    if (!user) return null;
    if ((user as any)?.clubId) {
      const byId = clubs.find((club: any) => club.id === (user as any).clubId);
      if (byId) return byId;
    }
    if ((user as any)?.club) {
      const byName = clubs.find((club: any) => club.name === (user as any).club);
      if (byName) return byName;
    }
    return null;
  }, [user, clubs]);

  const clubName = userClub?.name;

  const myOffersAsBuyer = useMemo(() => {
    if (!isAuthenticated || !isDT || !clubName) return [];
    return (offers as TransferOffer[]).filter(offer => offer.toClub === clubName);
  }, [offers, isAuthenticated, isDT, clubName]);

  const myOffersAsSeller = useMemo(() => {
    if (!isAuthenticated || !isDT || !clubName) return [];
    return (offers as TransferOffer[]).filter(offer => offer.fromClub === clubName);
  }, [offers, isAuthenticated, isDT, clubName]);

  const actionableBuyer = myOffersAsBuyer.filter(offer => {
    if (offer.status === 'counter-offer') return true;
    if (offer.status === 'accepted') return !dismissedNotifications[offer.id];
    return false;
  });
  const actionableSeller = myOffersAsSeller.filter(offer => {
    if (offer.status === 'pending') return true;
    if (offer.status === 'accepted') return !dismissedNotifications[offer.id];
    return false;
  });

  const visibleBuyerOffers = myOffersAsBuyer.filter(
    offer => offer.status !== 'accepted' || !dismissedNotifications[offer.id]
  );
  const visibleSellerOffers = myOffersAsSeller.filter(
    offer => offer.status !== 'accepted' || !dismissedNotifications[offer.id]
  );
  const notificationCount = actionableBuyer.length + actionableSeller.length;
  const notificationBadge = notificationCount > 9 ? '9+' : String(notificationCount);
  const hasClubAccess = isDT && Boolean(clubName);
  const notificationHeaderText = notificationCount > 0 ? `${notificationCount} nuevas` : 'Sin novedades';

  const getStatusStyle = (status: string) => STATUS_STYLES[status] || STATUS_STYLES.default;

  const renderOfferNotification = (offer: TransferOffer, type: 'buyer' | 'seller') => {
    const counterClub = type === 'buyer' ? offer.fromClub : offer.toClub;
    const amount = offer.counterAmount ?? offer.amount;
    const badgeClass = getStatusStyle(offer.status);

    return (
      <div
        key={`${type}-${offer.id}`}
        className="bg-gray-800/60 border border-gray-700/60 rounded-lg p-3 space-y-1"
      >
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="text-gray-100 font-semibold">{offer.playerName}</span>
          <span>{formatDate(offer.date)}</span>
        </div>
        <p className="text-xs text-gray-400">
          {type === 'buyer' ? `Club vendedor: ${counterClub}` : `Club comprador: ${counterClub}`}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-white">{formatCurrency(amount)}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${badgeClass}`}>
            {getStatusBadge(offer.status)}
          </span>
        </div>
      </div>
    );
  };

  const renderNotificationsSection = (
    title: string,
    items: TransferOffer[],
    type: 'buyer' | 'seller',
    emptyText: string
  ) => (
    <div className="p-4 border-b border-gray-800 last:border-b-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-xs text-gray-400">{items.length}</span>
      </div>
      {items.length ? (
        <div className="space-y-3">
          {items.slice(0, 3).map(offer => renderOfferNotification(offer, type))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">{emptyText}</p>
      )}
    </div>
  );
  
  // Close mobile menu when navigating
  useEffect(() => {
    const closeMenu = () => {
      setIsOpen(false);
      setUserMenuOpen(false);
      setNotificationsOpen(false);
    };
    
    window.addEventListener('popstate', closeMenu);
    
    return () => {
      window.removeEventListener('popstate', closeMenu);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotificationsOpen(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!notificationsOpen || !isAuthenticated || !dismissedStorageKey) return;
    const acceptedOffers = [...myOffersAsBuyer, ...myOffersAsSeller]
      .filter(offer => offer.status === 'accepted' && !dismissedNotifications[offer.id])
      .map(offer => offer.id);

    if (!acceptedOffers.length) return;

    setDismissedNotifications(prev => {
      const next = { ...prev };
      let changed = false;
      acceptedOffers.forEach(id => {
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      });
      if (changed) {
        try {
          localStorage.setItem(dismissedStorageKey, JSON.stringify(next));
        } catch { /* ignore */ }
        return next;
      }
      return prev;
    });
  }, [notificationsOpen, isAuthenticated, dismissedStorageKey, myOffersAsBuyer, myOffersAsSeller, dismissedNotifications]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
  };
  
  
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="La Virtual Zone" className="h-8 w-8 mr-2" />
                <span className="text-white font-bold text-xl font-display">La Virtual Zone</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2">
              <Link 
                to="/liga-master"
                className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Liga Master
              </Link>
              <Link 
                to="/torneos"
                className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Torneos
              </Link>
              <Link 
                to="/blog"
                className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Blog
              </Link>
              <Link 
                to="/galeria"
                className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Galería
              </Link>
              
              <Link 
                to="/ayuda"
                className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Ayuda
              </Link>
            </div>
          </div>
          
          {/* User navigation */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(prev => !prev);
                    setUserMenuOpen(false);
                  }}
                  className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none transition-colors"
                  aria-label="Notificaciones del mercado"
                >
                  <Bell size={18} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                      {notificationBadge}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-semibold text-white">Notificaciones</p>
                      <span className="text-xs text-gray-400">{notificationHeaderText}</span>
                    </div>
                    {hasClubAccess ? (
                      <>
                        {renderNotificationsSection(
                          'Mis Ofertas',
                          visibleBuyerOffers,
                          'buyer',
                          'Todavia no has hecho ofertas.'
                        )}
                        {renderNotificationsSection(
                          'Ofertas Recibidas',
                          visibleSellerOffers,
                          'seller',
                          'Aun no recibes ofertas.'
                        )}
                        <div className="p-3 border-t border-gray-800 bg-gray-900/80">
                          <Link
                            to="/liga-master/mercado"
                            className="block text-center text-sm font-semibold text-primary hover:text-white transition-colors"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            Ir al Mercado de Fichajes
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 text-sm text-gray-400">
                        Asigna un club como DT para recibir notificaciones del mercado.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {isAuthenticated ? (
              <div className="relative">
                <div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center text-sm rounded-full focus:outline-none"
                  >
                    <img 
                      src={user?.avatar} 
                      alt={user?.username}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="hidden md:flex md:flex-col md:ml-2 md:items-start">
                      <span className="text-white text-sm">{user?.username}</span>
                    </div>
                    <ChevronDown size={16} className="ml-2 text-gray-400" />
                  </button>
                </div>
                
                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <Link
                        to="/usuario"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-4 py-2 text-sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <User size={16} className="mr-2" />
                          <span>Mi Perfil</span>
                        </div>
                      </Link>
                      
                      {hasRole('admin') && (
                        <Link
                          to="/admin"
                          className="text-gray-300 hover:bg-gray-700 hover:text-white block px-4 py-2 text-sm"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <Shield size={16} className="mr-2" />
                            <span>Panel Admin</span>
                          </div>
                        </Link>
                      )}
                      
                      
                      
                      <Link
                        to="/usuario?tab=settings"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-4 py-2 text-sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Settings size={16} className="mr-2" />
                          <span>Configuración</span>
                        </div>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block w-full text-left px-4 py-2 text-sm"
                      >
                        <div className="flex items-center">
                          <LogOut size={16} className="mr-2" />
                          <span>Cerrar Sesión</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-white bg-transparent hover:bg-gray-800 px-3 py-2 rounded-md text-sm"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="bg-primary hover:bg-primary-light text-white px-3 py-2 rounded-md text-sm"
                >
                  Crear Cuenta
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex md:hidden ml-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X size={24} aria-hidden="true" />
                ) : (
                  <Menu size={24} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/liga-master"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Liga Master
            </Link>
            <Link
              to="/torneos"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Torneos
            </Link>
            <Link
              to="/blog"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/galeria"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Galería
            </Link>
            <Link
              to="/tienda"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Tienda
            </Link>
            <Link
              to="/ayuda"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Ayuda
            </Link>
            
            {isAuthenticated && (
              <>
                <div className="border-t border-gray-700 my-2 pt-2"></div>
                
                <Link
                  to="/usuario"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Mi Perfil
                </Link>
                
                {hasRole('admin') && (
                  <Link
                    to="/admin"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Panel Admin
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <div className="border-t border-gray-700 my-2 pt-2"></div>
                
                <Link
                  to="/login"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                
                <Link
                  to="/registro"
                  className="bg-primary text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Crear Cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
 
