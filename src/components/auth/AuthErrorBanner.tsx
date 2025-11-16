import { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AUTO_DISMISS_MS = 6000;

const AuthErrorBanner = () => {
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  useEffect(() => {
    if (!authError) return;
    const timer = window.setTimeout(() => {
      clearAuthError();
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [authError, clearAuthError]);

  if (!authError) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-4 z-[2000] flex justify-center px-4">
      <div className="w-full max-w-xl rounded-xl border border-red-500/40 bg-red-600/90 text-white shadow-2xl backdrop-blur-lg">
        <div className="flex items-start gap-3 px-4 py-3">
          <AlertCircle className="mt-0.5 shrink-0" size={20} />
          <div className="flex-1 text-sm leading-relaxed">{authError}</div>
          <button
            type="button"
            onClick={clearAuthError}
            className="text-white/80 hover:text-white focus:outline-none"
            aria-label="Cerrar alerta de autenticación"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorBanner;
