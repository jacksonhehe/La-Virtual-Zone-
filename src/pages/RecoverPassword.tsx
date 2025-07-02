import { useState } from 'react';
import { AlertCircle, Mail } from 'lucide-react';
import { requestPasswordReset } from '../utils/authService';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError('No se pudo procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Revisa tu correo</h2>
          <p className="text-gray-400">Si la cuenta existe recibirás un enlace para restablecer tu contraseña.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="card border border-gray-800">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Recuperar Contraseña</h2>
              <p className="text-gray-400 mt-1">Ingresa tu correo para recibir un enlace</p>
            </div>
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-start">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  className="input w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="btn-primary w-full flex justify-center items-center"
                  disabled={loading}
                >
                  {loading ? <span className="loader w-5 h-5 mr-2" /> : <Mail size={18} className="mr-2" />}
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;
