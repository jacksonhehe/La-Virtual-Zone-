import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      await login(username, password);
      navigate('/usuario');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al iniciar sesión');
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
              <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
              <p className="text-gray-400 mt-1">
                Ingresa a tu cuenta de La Virtual Zone
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-start">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-300">
                    Contraseña
                  </label>
                  <Link to="/recuperar-password" className="text-primary text-xs hover:text-primary-light">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  type="password"
                  className="input w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    <LogIn size={18} className="mr-2" />
                  )}
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ¿No tienes una cuenta?{' '}
                <Link to="/registro" className="text-primary hover:text-primary-light">
                  Regístrate
                </Link>
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="text-xs text-gray-500 text-center">
                <p>Para pruebas, puedes usar:</p>
                <p className="mt-1">Usuario: <span className="text-primary">usuario</span> / Contraseña: <span className="text-primary">cualquiera</span></p>
                <p className="mt-1">DT: <span className="text-primary">entrenador</span> / Contraseña: <span className="text-primary">cualquiera</span></p>
                <p className="mt-1">Admin: <span className="text-primary">admin</span> / Contraseña: <span className="text-primary">cualquiera</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
 