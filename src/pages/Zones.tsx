import { useAuthStore } from '../store/authStore';
import Zones from '../components/Zones';
import { Navigate } from 'react-router-dom';

const ZonesPage = () => {
  const { user, hasRole } = useAuthStore();

  // Verificar que el usuario esté autenticado y tenga rol de DT
  if (!user || !hasRole('dt')) {
    return <Navigate to="/login" replace />;
  }

  return <Zones />;
};

export default ZonesPage;
