import { Award, Calendar, Settings, Shield, Trophy, User, Users, Mail } from 'lucide-react';
import { panelSurfaceClass } from './helpers';

interface ProfileTabProps {
  user: any;
  achievements: any[];
  mainRoleLabel: string;
  hasRole: (role: string) => boolean;
  onOpenCustomization: () => void;
}

const ProfileTab = ({ user, achievements, mainRoleLabel, hasRole, onOpenCustomization }: ProfileTabProps) => (
  <div className="space-y-8">
    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center gap-4 mb-6">
        <User size={24} className="text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
          <p className="text-gray-400 text-sm">Gestiona tu información personal y preferencias.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <Award size={20} className="text-yellow-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">{achievements.length}</div>
              <div className="text-xs text-gray-400 uppercase">Logros</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <Shield size={20} className="text-primary" />
            <div className="text-right">
              <div className="text-lg font-bold text-white">{mainRoleLabel}</div>
              <div className="text-xs text-gray-400 uppercase">Rol</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <Calendar size={20} className="text-secondary" />
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {(() => {
                  const created = new Date((user as any).createdAt || Date.now());
                  const now = new Date();
                  const diffMs = now.getTime() - created.getTime();
                  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
                  return diffMonths > 0 ? `${diffMonths}m` : 'Nuevo';
                })()}
              </div>
              <div className="text-xs text-gray-400 uppercase">En plataforma</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center mb-6 gap-3">
        <User size={20} className="text-primary" />
        <div>
          <h3 className="text-xl font-bold text-white">Información Personal</h3>
          <p className="text-gray-400 text-sm">Detalles básicos de tu cuenta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User size={16} className="text-primary mr-2" />
              <span className="text-gray-400 text-sm">Usuario</span>
            </div>
            <span className="font-medium text-white text-sm">{user.username}</span>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail size={16} className="text-secondary mr-2" />
              <span className="text-gray-400 text-sm">Correo</span>
            </div>
            <span className="font-medium text-white text-sm truncate max-w-[200px]">{user.email}</span>
          </div>
        </div>
      </div>
    </div>

    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award size={20} className="text-primary" />
          <div>
            <h3 className="text-xl font-bold text-white">Logros Desbloqueados</h3>
            <p className="text-gray-400 text-sm">Tus conquistas y reconocimientos.</p>
          </div>
        </div>
        {achievements.length > 0 && (
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded border border-primary/30">
            {achievements.length} logro{achievements.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.slice(0, 6).map((achievement: any, index: number) => (
            <div key={achievement || index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <Award size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-white text-sm">
                    {achievement === 'founder'
                      ? 'Fundador'
                      : achievement === 'first_win'
                      ? 'Primera Victoria'
                      : achievement === 'first_transfer'
                      ? 'Primer Fichaje'
                      : achievement.charAt(0).toUpperCase() + achievement.slice(1)}
                  </p>
                  <p className="text-xs text-gray-400">Logro desbloqueado</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 sm:py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700/30 flex items-center justify-center">
            <Award size={40} className="text-gray-600" />
          </div>
          <p className="text-gray-300 font-medium mb-2">No hay logros desbloqueados aún.</p>
          <p className="text-gray-500 text-sm">Juega, participa en eventos y compite para empezar a desbloquear medallas.</p>
        </div>
      )}
    </div>

    {!hasRole('dt') && (
      <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
        <div className="flex items-center mb-4 gap-3">
          <Trophy size={24} className="text-green-400" />
          <div>
            <h3 className="text-lg font-bold text-green-400">Solicitar Club</h3>
            <p className="text-gray-400 text-sm">Conviértete en Director Técnico</p>
          </div>
        </div>
        <p className="text-gray-300 mb-4 text-sm">
          Gestiona un club, realiza fichajes y compite en la Liga Master.
        </p>
        <div className="flex gap-3">
          <button className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
            Solicitar participación
          </button>
          <a href="/liga-master" className="border border-primary/50 text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
            Ver Liga Master
          </a>
        </div>
      </div>
    )}

    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center mb-6 gap-3">
        <Users size={20} className="text-primary" />
        <div>
          <h3 className="text-xl font-bold text-white">Perfil Público</h3>
          <p className="text-gray-400 text-sm">Cómo te ven otros usuarios</p>
        </div>
      </div>
      <p className="text-gray-300 mb-6 text-sm">
        Personaliza tu biografía, equipo favorito y más para conectar con la comunidad.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`/usuarios/${user.username}`}
          className="flex-1 bg-secondary hover:bg-secondary-light text-white px-4 py-3 rounded-lg font-medium text-sm text-center transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver mi perfil público
        </a>
        <button
          type="button"
          onClick={onOpenCustomization}
          className="flex-1 border border-primary/50 text-primary hover:bg-primary/10 px-4 py-3 rounded-lg font-medium text-sm transition-colors"
        >
          Personalizar perfil
        </button>
      </div>
    </div>
  </div>
);

export default ProfileTab;
