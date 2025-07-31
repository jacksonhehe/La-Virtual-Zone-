import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSecureAuth, useRoleCheck } from '../../hooks/useSecureAuth';
import Spinner from '../ui/Spinner';

interface SecureProtectedRouteProps {
  requiredRoles?: string[];
  requireAuth?: boolean;
  redirectTo?: string;
  fallbackPath?: string;
  children?: React.ReactNode;
}

export const SecureProtectedRoute: React.FC<SecureProtectedRouteProps> = ({
  requiredRoles = [],
  requireAuth = true,
  redirectTo = '/login',
  fallbackPath = '/403',
  children,
}) => {
  const { isAuthenticated, isLoading, user } = useSecureAuth();
  const { hasAnyRole } = useRoleCheck(requiredRoles);
  const location = useLocation();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Si requiere autenticación y el usuario no está autenticado
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Si requiere roles específicos y el usuario no los tiene
  if (requiredRoles.length > 0 && !hasAnyRole()) {
    return (
      <Navigate 
        to={fallbackPath} 
        replace 
      />
    );
  }

  // Si todo está bien, renderizar el contenido
  return children ? <>{children}</> : <Outlet />;
};

// Componente específico para rutas de administración
export const AdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <SecureProtectedRoute 
      requiredRoles={['admin']} 
      fallbackPath="/403"
    >
      {children}
    </SecureProtectedRoute>
  );
};

// Componente específico para rutas de DT (Director Técnico)
export const DTRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <SecureProtectedRoute 
      requiredRoles={['admin', 'dt']} 
      fallbackPath="/403"
    >
      {children}
    </SecureProtectedRoute>
  );
};

// Componente para rutas que requieren autenticación pero sin roles específicos
export const AuthRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <SecureProtectedRoute 
      requireAuth={true}
      redirectTo="/login"
    >
      {children}
    </SecureProtectedRoute>
  );
};

// Componente para rutas públicas (sin autenticación requerida)
export const PublicRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <SecureProtectedRoute 
      requireAuth={false}
    >
      {children}
    </SecureProtectedRoute>
  );
};

// Hook para verificar acceso en componentes
export const useRouteAccess = () => {
  const { isAuthenticated, user } = useSecureAuth();
  const location = useLocation();

  const canAccess = (requiredRoles: string[] = []) => {
    if (!isAuthenticated) return false;
    if (requiredRoles.length === 0) return true;
    return requiredRoles.includes(user?.role || '');
  };

  const redirectToLogin = () => {
    return `/login?redirect=${encodeURIComponent(location.pathname)}`;
  };

  return {
    canAccess,
    redirectToLogin,
    isAuthenticated,
    userRole: user?.role,
  };
}; 