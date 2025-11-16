import { Activity, Award, ShoppingCart, Trophy, Users } from 'lucide-react';
import { panelSurfaceClass } from './helpers';

const ActivityTab = () => (
  <div className="space-y-6">
    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center gap-4 mb-6">
        <Activity size={24} className="text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-white">Actividad Reciente</h2>
          <p className="text-gray-400 text-sm">Revisa tu historial de partidos, torneos y movimientos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <Trophy size={20} className="text-green-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-green-400">12</div>
              <div className="text-xs text-gray-400 uppercase">Partidos</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <Award size={20} className="text-blue-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-blue-400">3</div>
              <div className="text-xs text-gray-400 uppercase">Torneos</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <ShoppingCart size={20} className="text-purple-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-purple-400">8</div>
              <div className="text-xs text-gray-400 uppercase">Transacciones</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center mb-6 gap-3">
        <Activity size={20} className="text-primary" />
        <div>
          <h3 className="text-xl font-bold text-white">Historial de actividad</h3>
          <p className="text-gray-400 text-sm">Eventos y acciones más recientes en tu cuenta.</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4 border border-blue-500/30">
            <Users size={16} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">Te uniste a La Virtual Zone</p>
            <p className="text-xs text-gray-400 mt-1">Bienvenido a la comunidad gamer de la Liga Master.</p>
          </div>
          <span className="text-xs text-gray-500">Hace 3 semanas</span>
        </div>
      </div>
    </div>
  </div>
);

export default ActivityTab;
