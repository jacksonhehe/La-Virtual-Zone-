import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { resetPassword } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('El correo electrónico no es válido');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al enviar el correo de recuperación');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="card border border-gray-800">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Recuperar Contraseña</h2>
              <p className="text-gray-400 mt-1">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
              </p>
            </div>

            {success ? (
              <div className="text-center">
                <div className="mb-6 p-4 bg-green-500/20 text-green-400 rounded-lg flex items-start">
                  <CheckCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Correo enviado</p>
                    <p className="text-sm mt-1">
                      Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
                      Revisa tu bandeja de entrada y sigue las instrucciones.
                    </p>
                  </div>
                </div>

                <Link to="/login" className="btn-primary w-full flex justify-center items-center">
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-start">
                    <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      className="input w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="btn-primary w-full flex justify-center items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loader w-5 h-5 mr-2"></span>
                      ) : (
                        <Mail size={18} className="mr-2" />
                      )}
                      {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    ¿Recordaste tu contraseña?{' '}
                    <Link to="/login" className="text-primary hover:text-primary-light">
                      Inicia sesión
                    </Link>
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-xs text-gray-500 text-center">
                    Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;
