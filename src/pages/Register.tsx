import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
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
      await register(email, username, password);
      navigate('/usuario');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al registrar la cuenta');
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
              <h2 className="text-2xl font-bold">Crear Cuenta</h2>
              <p className="text-gray-400 mt-1">
                Únete a La Virtual Zone y comienza tu carrera como DT
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-start">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="input w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="input w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full flex justify-center items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loader w-5 h-5 mr-2"></span>
                  ) : (
                    <User size={18} className="mr-2" />
                  )}
                  {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-primary hover:text-primary-light">
                  Inicia sesión
                </Link>
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Al registrarte, aceptas nuestros{' '}
                <Link to="/terminos" className="text-primary hover:text-primary-light">
                  Términos y Condiciones
                </Link>{' '}
                y{' '}
                <Link to="/privacidad" className="text-primary hover:text-primary-light">
                  Política de Privacidad
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
 