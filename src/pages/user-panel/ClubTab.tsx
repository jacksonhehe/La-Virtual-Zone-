import { AlertTriangle, Award, Clipboard, Trophy, Users } from 'lucide-react';

interface ClubTabProps {
  userClub: any;
}

const ClubTab = ({ userClub }: ClubTabProps) => {
  if (!userClub) {
    return (
      <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
        <div className="flex items-center mb-4 gap-3">
          <AlertTriangle size={24} className="text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold text-yellow-400">Club no encontrado</h2>
            <p className="text-gray-400 text-sm">No se pudo cargar la información de tu club.</p>
          </div>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-300 text-sm font-medium mb-2">Posibles causas:</p>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>No estás asociado a ningún club</li>
            <li>Problema con los datos del club</li>
            <li>El club fue eliminado o renombrado</li>
          </ul>
          <p className="text-gray-400 text-sm mt-3">
            Contacta al staff si crees que es un error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <img
            src={userClub.logo || '/default-club.svg'}
            alt={`Escudo de ${userClub.name}`}
            className="w-20 h-20 rounded-lg border-2 border-gray-600 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-club.svg';
            }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{userClub.name}</h1>
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                DT
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Fundado en {userClub.foundedYear || 'Año desconocido'}
            </p>
            <div className="flex gap-3">
              <a
                href={`/liga-master/club/${encodeURIComponent(userClub.name.toLowerCase().replace(/\s+/g, '-'))}`}
                className="bg-secondary hover:bg-secondary-light text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Ver Perfil
              </a>
              <a
                href={`/liga-master/club/${encodeURIComponent(userClub.name.toLowerCase().replace(/\s+/g, '-'))}/plantilla`}
                className="border border-primary/50 text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Plantilla
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <Trophy size={20} className="text-primary" />
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                €{(((userClub as any).budget || 0) / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-400 uppercase">Presupuesto</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <Award size={20} className="text-secondary" />
            <div className="text-right">
              <div className="text-xl font-bold text-secondary">{(userClub as any).season?.position || 'N/A'}</div>
              <div className="text-xs text-gray-400 uppercase">Posición</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <Users size={20} className="text-green-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-green-400">{(userClub as any).players?.length || 0}</div>
              <div className="text-xs text-gray-400 uppercase">Jugadores</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubTab;
