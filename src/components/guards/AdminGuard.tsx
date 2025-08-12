import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { profile, loading, isAdmin } = useProfile();
  const location = useLocation();

  if (loading) {
    // Mostrar loading mientras se verifica el perfil
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!profile || !isAdmin()) {
    // Redirigir a forbidden si no es admin
    return <Navigate to="/forbidden" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
