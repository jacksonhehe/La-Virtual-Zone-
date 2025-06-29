import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, Settings, Trophy, Shield, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { calculateLevel } from '../../utils/helpers';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Close mobile menu when navigating
  useEffect(() => {
    const closeMenu = () => {
      setIsOpen(false);
      setUserMenuOpen(false);
    };
    
    window.addEventListener('popstate', closeMenu);
    
    return () => {
      window.removeEventListener('popstate', closeMenu);
    };
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setUserMenuOpen(false);
  };
  
  const userLevel = user ? calculateLevel(user.xp) : 0;
  
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <div className="bg-primary h-8 w-8 rounded flex items-center justify-center mr-2">
                  <Trophy size={20} className="text-white" />
                </div>
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
                to="/tienda"
                className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Tienda
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
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none"
                  >
                    <img 
                      src={user?.avatar} 
                      alt={user?.username}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="hidden md:flex md:flex-col md:ml-2 md:items-start">
                      <span className="text-white text-sm">{user?.username}</span>
                      <span className="text-xs text-primary-light">Nivel {userLevel}</span>
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

                  {user?.role === 'dt' && (
                    <Link
                      to="/dt-dashboard"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white block px-4 py-2 text-sm"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Trophy size={16} className="mr-2" />
                        <span>Mi Club</span>
                      </div>
                    </Link>
                  )}
                      
                      {user?.role === 'admin' && (
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
                        to="/tienda"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-4 py-2 text-sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <ShoppingCart size={16} className="mr-2" />
                          <span>Tienda</span>
                        </div>
                      </Link>
                      
                      <Link
                        to="/usuario"
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

                {user?.role === 'dt' && (
                  <Link
                    to="/dt-dashboard"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Mi Club
                  </Link>
                )}
                
                {user?.role === 'admin' && (
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
 