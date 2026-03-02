import { FormEvent, useEffect, useRef, useState } from 'react';
import { Heart, MapPin, Settings, Star, Target, X } from 'lucide-react';
import { panelSurfaceClass } from './helpers';

interface ProfileFormState {
  bio: string;
  location: string;
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
}: ProfileCustomizationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const bioRef = useRef<HTMLTextAreaElement | null>(null);

  const closeModal = () => {
    if (isSubmitting) return;
    onClose();
    setProfileError(null);
  };

  useEffect(() => {
    bioRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await Promise.resolve(onSubmit(event));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closeModal} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-customization-title"
        className={`relative ${panelSurfaceClass} w-full max-w-2xl overflow-hidden`}
      >
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
                <h3 id="profile-customization-title" className="text-lg sm:text-xl font-bold text-white">
                  Personalizar perfil
                </h3>
                <p className="text-xs sm:text-sm text-gray-300">Actualiza tu información pública y de jugador.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              aria-label="Cerrar modal"
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
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
              ref={bioRef}
              value={profileForm.bio}
              onChange={(e) => {
                setProfileForm((prev) => ({ ...prev, bio: e.target.value }));
                setProfileError(null);
              }}
              placeholder="Cuéntanos un poco sobre ti como jugador o DT..."
              className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all resize-none text-sm"
              rows={4}
              maxLength={200}
              disabled={isSubmitting}
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
                onChange={(e) => {
                  setProfileForm((prev) => ({ ...prev, location: e.target.value }));
                  setProfileError(null);
                }}
                placeholder="Ciudad, País"
                className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
                maxLength={50}
                disabled={isSubmitting}
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
                onChange={(e) => {
                  setProfileForm((prev) => ({ ...prev, favoriteTeam: e.target.value }));
                  setProfileError(null);
                }}
                placeholder="Tu club del corazón"
                className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
                maxLength={50}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-semibold text-gray-300 mb-2">
                <Target size={16} className="mr-2 text-purple-400" />
                Posición favorita
              </label>
              <select
                value={profileForm.favoritePosition}
                onChange={(e) => {
                  setProfileForm((prev) => ({ ...prev, favoritePosition: e.target.value }));
                  setProfileError(null);
                }}
                className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
                disabled={isSubmitting}
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
              onClick={closeModal}
              disabled={isSubmitting}
              className="border-2 border-gray-700 hover:bg-gray-700/60 text-gray-200 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-dark px-5 py-2.5 rounded-xl font-semibold transition-colors duration-200 shadow-none hover:shadow-none focus:shadow-none text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCustomizationModal;
