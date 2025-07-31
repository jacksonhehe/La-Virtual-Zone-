import { useState, useEffect, useCallback } from 'react';
import { secureAuthService, User, JWTPayload } from '../utils/secureAuthService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseSecureAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export const useSecureAuth = (): UseSecureAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Maneja errores de forma segura
   */
  const handleError = useCallback((error: unknown) => {
    let message = 'Error interno del servidor';
    
    if (error instanceof Error) {
      // Sanitizar mensajes de error
      const sanitizedMessage = error.message
        .replace(/database/i, 'servidor')
        .replace(/sql/i, 'base de datos')
        .replace(/connection/i, 'conexión')
        .replace(/internal/i, 'interno')
        .replace(/stack/i, '')
        .replace(/trace/i, '');
      
      message = sanitizedMessage || 'Error interno del servidor';
    }
    
    setState(prev => ({ ...prev, error: message, isLoading: false }));
  }, []);

  /**
   * Verifica la sesión actual
   */
  const checkSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (secureAuthService.isAuthenticated()) {
        const user = await secureAuthService.getCurrentUser();
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      }
      
      // Si no hay sesión válida, limpiar estado
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  /**
   * Login seguro
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = await secureAuthService.login(email, password);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  /**
   * Registro seguro
   */
  const register = useCallback(async (email: string, username: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = await secureAuthService.register(email, username, password);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  /**
   * Logout seguro
   */
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await secureAuthService.logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // En caso de error en logout, limpiar estado local de todas formas
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Refrescar información del usuario
   */
  const refreshUser = useCallback(async () => {
    try {
      const user = await secureAuthService.getCurrentUser();
      if (user) {
        setState(prev => ({ ...prev, user }));
      }
    } catch (error) {
      // Si no se puede obtener el usuario, asumir que la sesión expiró
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Verificar sesión al montar el componente
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Configurar listener para cambios de visibilidad (para detectar cuando el usuario regresa a la pestaña)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.isAuthenticated) {
        refreshUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isAuthenticated, refreshUser]);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };
};

// Hook para verificar roles
export const useRoleCheck = (requiredRoles: string[]) => {
  const { user, isAuthenticated } = useSecureAuth();
  
  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback(() => {
    return requiredRoles.some(role => hasRole(role));
  }, [requiredRoles, hasRole]);

  const hasAllRoles = useCallback(() => {
    return requiredRoles.every(role => hasRole(role));
  }, [requiredRoles, hasRole]);

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    userRole: user?.role,
    isAuthenticated,
  };
};

// Hook para verificar permisos específicos
export const usePermissionCheck = () => {
  const { user } = useSecureAuth();
  
  const can = useCallback((action: string, resource?: string) => {
    if (!user) return false;
    
    // Lógica de permisos basada en roles
    switch (action) {
      case 'read':
        return true; // Todos pueden leer
      
      case 'write':
        return ['admin', 'dt'].includes(user.role);
      
      case 'delete':
        return user.role === 'admin';
      
      case 'manage_users':
        return user.role === 'admin';
      
      case 'manage_tournaments':
        return ['admin', 'dt'].includes(user.role);
      
      case 'access_admin':
        return user.role === 'admin';
      
      default:
        return false;
    }
  }, [user]);

  return { can, userRole: user?.role };
}; 