import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      await register(email, password, username);
      navigate('/usuario');
    } catch {
      setError('Error al registrarse');
    }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <User size={32} className="text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-6">Registro de Usuario</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-500 rounded-md p-3 mb-4">
          {error}
        </div>
      )}
      
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
              placeholder="Elige un nombre de usuario"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Correo electrónico</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={16} className="text-gray-500" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
        </div>
        
        <div className="mb-4">
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
              placeholder="Elige una contraseña segura"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">Confirmar contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CheckCircle size={16} className="text-gray-500" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Repite tu contraseña"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input type="checkbox" className="sr-only peer" required />
            <div className="w-5 h-5 mt-0.5 border border-gray-600 rounded-sm bg-dark-lighter peer-checked:bg-primary flex items-center justify-center">
              <CheckCircle size={14} className="hidden peer-checked:block text-white" />
            </div>
            <span className="ml-2 text-sm text-gray-400">
              Acepto los términos y condiciones y la política de privacidad
            </span>
          </label>
        </div>
        
        <button
          type="submit"
          className="btn-primary py-3 w-full"
        >
          Crear cuenta
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
 