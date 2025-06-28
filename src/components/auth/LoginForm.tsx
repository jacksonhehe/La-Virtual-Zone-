import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Por favor, ingresa todos los campos');
      return;
    }
    
    try {
      login(username, password);
      toast.success('Inicio de sesión exitoso');
      navigate('/usuario');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Credenciales incorrectas');
      }
    }
  };

  const handleDemoLogin = () => {
    login('admin', 'password');
    toast.success('Inicio de sesión exitoso');
    navigate('/usuario');
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <LogIn size={32} className="text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">Nombre de usuario</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={16} className="text-gray-500" />
            </div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={16} className="text-gray-500" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Ingresa tu contraseña"
            />
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button
            type="submit"
            className="btn-primary py-3 w-full"
          >
            Iniciar Sesión
          </button>
          
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn-outline py-3 w-full"
          >
            Iniciar Sesión Demo
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="text-primary hover:text-primary-light">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
 