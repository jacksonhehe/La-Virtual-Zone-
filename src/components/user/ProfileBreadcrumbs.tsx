import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileBreadcrumbsProps {
  activeTab: string;
}

/**
 * Componente de breadcrumbs para la navegación en el perfil de usuario
 */
const ProfileBreadcrumbs = ({ activeTab }: ProfileBreadcrumbsProps) => {
  // Mapeo de tabs a nombres legibles
  const tabNames: Record<string, string> = {
    'profile': 'Mi Perfil',
    'club': 'Mi Club',
    'activity': 'Actividad',
    'community': 'Comunidad',
    'settings': 'Configuración'
  };

  return (
    <div className="flex items-center text-sm text-gray-400 mb-6 animate-fadeIn">
      <Link to="/" className="hover:text-primary transition-colors">
        Inicio
      </Link>
      <ChevronRight size={14} className="mx-2" />
      <Link to="/usuario" className="hover:text-primary transition-colors">
        Panel de Usuario
      </Link>
      {activeTab && (
        <>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-primary font-medium">{tabNames[activeTab] || activeTab}</span>
        </>
      )}
    </div>
  );
};

export default ProfileBreadcrumbs;