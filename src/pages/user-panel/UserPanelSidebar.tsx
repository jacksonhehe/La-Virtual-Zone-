import { Clipboard, LogOut, Settings, Shield, Trophy, User, Users } from 'lucide-react';
import { getRoleClass, getRoleLabel, panelSurfaceClass } from './helpers';

interface UserPanelSidebarProps {
  user: any;
  roles: string[];
  mainRoleLabel: string;
  hasRole: (role: string) => boolean;
  userClub: any;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateAdmin: () => void;
  logout: () => void;
  imagePreview: string | null;
}

const tabs: Array<{ key: string; label: string; icon: typeof User }> = [
  { key: 'profile', label: 'Mi Perfil', icon: User },
  { key: 'club', label: 'Mi Club', icon: Trophy },
  { key: 'activity', label: 'Actividad', icon: Clipboard },
  { key: 'community', label: 'Comunidad', icon: Users },
  { key: 'settings', label: 'Configuración', icon: Settings }
];

const UserPanelSidebar = ({
  user,
  roles,
  mainRoleLabel,
  hasRole,
  userClub,
  activeTab,
  onSelectTab,
  onNavigateAdmin,
  logout,
  imagePreview
}: UserPanelSidebarProps) => {
  const visibleTabs = tabs.filter((tab) => (tab.key === 'club' ? hasRole('dt') : true));

  return (
    <aside className="lg:w-80 shrink-0 space-y-6">
      <section className={`${panelSurfaceClass} p-6`}>
        <div className="text-center">
          <div className="mx-auto w-24 h-24 mb-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full border-2 border-gray-600 object-cover"
              />
            ) : user.avatar ? (
              <img
                src={user.avatar}
                alt={`Avatar de ${user.username}`}
                className="w-24 h-24 rounded-full border-2 border-gray-600 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{user.username}</h2>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">{mainRoleLabel}</p>

          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            {roles.map((role) => (
              <span key={role} className={`px-2 py-1 rounded text-xs font-medium border ${getRoleClass(role)}`}>
                {getRoleLabel(role)}
              </span>
            ))}
          </div>

          {hasRole('dt') && userClub && (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-center gap-3">
                <img
                  src={userClub.logo}
                  alt={`Escudo de ${userClub.name}`}
                  className="w-8 h-8 rounded border border-gray-600"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-club.svg';
                  }}
                />
                <div className="text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Club asignado</p>
                  <span className="font-medium text-green-400 text-sm">{userClub.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <nav className={`${panelSurfaceClass} p-2`}>
        <ul className="space-y-1">
          {visibleTabs.map(({ key, label, icon: Icon }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelectTab(key)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeTab === key
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} className="mr-3" />
                <span className="font-medium text-sm">{label}</span>
              </button>
            </li>
          ))}

          {hasRole('admin') && (
            <li>
              <button
                type="button"
                onClick={onNavigateAdmin}
                className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Shield size={18} className="mr-3" />
                <span className="font-medium text-sm">Panel de Admin</span>
              </button>
            </li>
          )}
        </ul>
      </nav>

      <section className={`${panelSurfaceClass} p-2`}>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </section>
    </aside>
  );
};

export default UserPanelSidebar;
