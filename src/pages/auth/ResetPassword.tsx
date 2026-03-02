import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';

type LinkStatus = 'checking' | 'valid' | 'invalid';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('checking');

  useEffect(() => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(search);

    const getParam = (key: string) => hashParams.get(key) || queryParams.get(key);

    const type = getParam('type');
    const accessToken = getParam('access_token');
    const refreshToken = getParam('refresh_token');
    const code = getParam('code');

    if (type !== 'recovery' && !code) {
      setFormError('El enlace de recuperación no es válido o ha expirado.');
      setLinkStatus('invalid');
      return;
    }

    const setRecoverySession = async () => {
      try {
        const client = getSupabaseClient();

        if (accessToken && refreshToken) {
          const { error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            throw error;
          }
        } else if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
        } else {
          throw new Error('El enlace de recuperación no contiene credenciales válidas.');
        }

        setLinkStatus('valid');

        if (typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo validar el enlace de recuperación.';
        setFormError(message);
        setLinkStatus('invalid');
      }
    };

    setRecoverySession();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!password || password.length < 8) {
      setFormError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (linkStatus === 'checking') {
      return (
        <div className="text-center text-gray-300">
          <span className="loader w-8 h-8 mx-auto mb-4"></span>
          <p>Validando enlace de recuperación...</p>
        </div>
      );
    }

    if (linkStatus === 'invalid') {
      return (
        <div>
          {formError && (
            <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>{formError}</p>
            </div>
          )}
          <p className="text-sm text-gray-400 text-center">
            Solicita un nuevo enlace desde{' '}
            <Link to="/recuperar-password" className="text-primary hover:text-primary-light">
              Recuperar contraseña
            </Link>
            .
          </p>
        </div>
      );
    }

    if (success) {
      return (
        <div className="text-center">
          <div className="mb-6 p-4 bg-green-500/20 text-green-400 rounded-lg flex items-start">
            <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Contraseña actualizada</p>
              <p className="text-sm mt-1">
                Tu contraseña se restableció correctamente. Ahora puedes iniciar sesión con tus nuevas credenciales.
              </p>
            </div>
          </div>
          <Link to="/login" className="btn-primary w-full flex justify-center items-center">
            Volver al inicio de sesión
          </Link>
        </div>
      );
    }

    return (
      <>
        {formError && (
          <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-start">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <p>{formError}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              className="input w-full"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu nueva contraseña"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="input w-full"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite tu nueva contraseña"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full flex justify-center items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loader w-5 h-5 mr-2"></span>
            ) : (
              <Lock size={18} className="mr-2" />
            )}
            {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            ¿No solicitaste este cambio?{' '}
            <Link to="/ayuda" className="text-primary hover:text-primary-light">
              Contáctanos
            </Link>
            .
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="card border border-gray-800">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Restablecer contraseña</h2>
              <p className="text-gray-400 mt-1">
                Define una nueva contraseña para tu cuenta de La Virtual Zone.
              </p>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
