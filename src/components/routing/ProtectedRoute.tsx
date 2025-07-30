import { useAuthStore } from '@/store/authStore';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allow: Array<'ADMIN' | 'DT' | 'USER'>;
  redirectTo?: string;
}

export default function ProtectedRoute({ allow, redirectTo }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toUpperCase() as 'ADMIN' | 'DT' | 'USER' | undefined;

  if (!role || !allow.includes(role)) {
    return <Navigate to={redirectTo || '/403'} replace />;
  }

  return <Outlet />;
}
