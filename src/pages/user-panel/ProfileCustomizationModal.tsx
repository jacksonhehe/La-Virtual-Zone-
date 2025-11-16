import { FormEvent } from 'react';
import { Globe, Heart, MapPin, Settings, Star, Target, X } from 'lucide-react';
import { panelSurfaceClass } from './helpers';

interface ProfileFormState {
  bio: string;
  location: string;
  website: string;
  favoriteTeam: string;
  favoritePosition: string;
}

interface ProfileCustomizationModalProps {
  profileForm: ProfileFormState;
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileFormState>>;
  profileError: string | null;
  setProfileError: (error: string | null) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
}

const positions = [
  { value: '', label: 'Seleccionar posición' },
  { value: 'PT', label: 'Portero' },
  { value: 'DEC', label: 'Defensa Central' },
  { value: 'LI', label: 'Lateral Izquierdo' },
  { value: 'LD', label: 'Lateral Derecho' },
  { value: 'MCD', label: 'Mediocentro Defensivo' },
  { value: 'MC', label: 'Mediocentro' },
  { value: 'MO', label: 'Mediocampista Ofensivo' },
  { value: 'MDI', label: 'Medio Izquierdo' },
  { value: 'MDD', label: 'Medio Derecho' },
  { value: 'EXI', label: 'Extremo Izquierdo' },
  { value: 'EXD', label: 'Extremo Derecho' },
  { value: 'CD', label: 'Delantero Centro' },
  { value: 'SD', label: 'Segundo Delantero' }
];

const ProfileCustomizationModal = ({
  profileForm,
  setProfileForm,
  profileError,
  setProfileError,
  onClose,
  onSubmit
}: ProfileCustomizationModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div
      className="absolute inset-0"
      onClick={() => {
        onClose();
        setProfileError(null);
      }}
    />
    <div className={`relative ${panelSurfaceClass} w-full max-w-2xl overflow-hidden`}>
      <div className="relative bg-gradient-to-r from-primary/18 via-secondary/16 to-primary/18 p-5 sm:p-6 border-b border-gray-700/60">
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Settings size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Personalizar perfil</h3>
              <p className="text-xs sm:text-sm text-gray-300">Actualiza tu información pública y de jugador.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              setProfileError(null);
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        {profileError && (
          <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl">
            <p className="text-red-400 text-sm font-medium">{profileError}</p>
          </div>
        )}

        <div>
          <label className="flex items-center text-sm font-semibold text-gray-300 mb-2">
            <Star size={16} className="mr-2 text-yellow-400" />
            Biografía
          </label>
          <textarea
            value={profileForm.bio}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="Cuéntanos un poco sobre ti como jugador o DT..."
            className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all resize-none text-sm"
            rows={4}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{profileForm.bio.length}/200 caracteres</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-300 mb-2">
              <MapPin size={16} className="mr-2 text-blue-400" />
              Ubicación
            </label>
            <input
              type="text"
              value={profileForm.location}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Ciudad, País"
              className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
              maxLength={50}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-300 mb-2">
              <Globe size={16} className="mr-2 text-green-400" />
              Sitio web
            </label>
            <input
              type="url"
              value={profileForm.website}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="https://tusitioweb.com"
              className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-300 mb-2">
              <Heart size={16} className="mr-2 text-red-400" />
              Equipo favorito
            </label>
            <input
              type="text"
              value={profileForm.favoriteTeam}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, favoriteTeam: e.target.value }))}
              placeholder="Tu club del corazón"
              className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
              maxLength={50}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-300 mb-2">
              <Target size={16} className="mr-2 text-purple-400" />
              Posición favorita
            </label>
            <select
              value={profileForm.favoritePosition}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, favoritePosition: e.target.value }))}
              className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
            >
              {positions.map((position) => (
                <option key={position.value} value={position.value}>
                  {position.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-700/50">
          <button
            type="button"
            onClick={() => {
              onClose();
              setProfileError(null);
            }}
            className="border-2 border-gray-700 hover:bg-gray-700/60 text-gray-200 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-dark px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-primary/40 transform hover:scale-[1.03] text-sm"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default ProfileCustomizationModal;
