import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldOff, Ban } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const STATUS_COPY: Record<'suspended' | 'banned' | 'inactive', { title: string; description: string; icon: typeof AlertTriangle }> = {
  suspended: {
    title: 'Cuenta suspendida',
    description: 'Tu acceso se encuentra temporalmente bloqueado. Revisa los detalles y contáctanos si tienes dudas.',
    icon: AlertTriangle
  },
  banned: {
    title: 'Cuenta baneada',
    description: 'Tu cuenta fue bloqueada de forma indefinida. Puedes escribirnos si consideras que se trata de un error.',
    icon: Ban
  },
  inactive: {
    title: 'Cuenta inactiva',
    description: 'Esta cuenta no está activa en el sistema. Ponte en contacto con soporte para más información.',
    icon: ShieldOff
  }
};

const AccountStatusPage = () => {
  const navigate = useNavigate();
  const { accountBlock, clearAccountBlock, clearAuthError } = useAuthStore();

  useEffect(() => {
    if (!accountBlock) {
      navigate('/login', { replace: true });
    }
  }, [accountBlock, navigate]);

  if (!accountBlock) {
    return null;
  }

  const copy = STATUS_COPY[accountBlock.status] || STATUS_COPY.inactive;
  const Icon = copy.icon;

  const handleBackToLogin = () => {
    clearAccountBlock();
    clearAuthError();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-dark-lighter/80 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-xl p-8 space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center">
            <Icon size={32} />
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-500">ACCESO RESTRINGIDO</p>
          <h1 className="text-3xl font-extrabold text-white">{copy.title}</h1>
          <p className="text-gray-300">{copy.description}</p>
        </div>

        <div className="bg-dark/70 border border-gray-800 rounded-xl p-5 text-gray-200">
          <p className="font-semibold text-white mb-2">Detalle</p>
          <p className="text-sm leading-relaxed">{accountBlock.message}</p>
        </div>

        <div className="bg-dark/70 border border-gray-800 rounded-xl p-5">
          <p className="font-semibold text-white mb-2">¿Necesitás ayuda?</p>
          <p className="text-sm text-gray-400 mb-4">
            Escribinos a{' '}
            <a
              className="text-primary hover:text-primary-light font-semibold"
              href="mailto:soporte@lavirtualzone.com?subject=Cuenta%20bloqueada"
            >
              soporte@lavirtualzone.com
            </a>{' '}
            indicando tu usuario y el motivo del bloqueo.
          </p>
          <button
            onClick={handleBackToLogin}
            className="w-full btn-primary py-3 rounded-xl text-sm font-semibold"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountStatusPage;
