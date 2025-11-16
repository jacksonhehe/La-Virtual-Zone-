import { Users } from 'lucide-react';
import { panelSurfaceClass } from './helpers';

const CommunityTab = () => (
  <div className="space-y-6">
    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center gap-4 mb-6">
        <Users size={24} className="text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-white">Comunidad</h2>
          <p className="text-gray-400 text-sm">Próximamente podrás interactuar con el resto de la comunidad LVZ.</p>
        </div>
      </div>

      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <Users size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold text-white mb-3">Funcionalidad próximamente disponible</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Estamos trabajando en nuevas herramientas sociales: seguidores, chat, feed de actividad pública, grupos de clubes
          y más. Muy pronto podrás compartir tus logros y conectar con otros jugadores de La Virtual Zone.
        </p>
      </div>
    </div>
  </div>
);

export default CommunityTab;
