import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore'; 

const  Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
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
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-2xl shadow-2xl">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <LogIn size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Iniciar Sesión
              </h2>
              <p className="text-gray-400 mt-2">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Contraseña
                  </label>
                  <Link to="/recuperar-password" className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 pr-12"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div> 
              
                           <div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center shadow-lg"
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
                <Link to="/registro" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Regístrate
                </Link>
              </p>
            </div> 
            
                       <div className="mt-8 pt-6 border-t border-gray-700/50">
              <div className="text-xs text-gray-500 text-center space-y-2">
                <p className="font-medium">Cuentas de prueba:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-700/30 p-2 rounded-lg">
                    <p className="text-blue-400 font-medium">usuario</p>
                    <p>password</p>
                  </div>
                  <div className="bg-gray-700/30 p-2 rounded-lg">
                    <p className="text-purple-400 font-medium">entrenador</p>
                    <p>password</p>
                  </div>
                  <div className="bg-gray-700/30 p-2 rounded-lg">
                    <p className="text-red-400 font-medium">admin</p>
                    <p>password</p>
                  </div>
                </div>
              </div>
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
 