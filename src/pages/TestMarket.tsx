import { useState } from 'react';
import { User, CheckCircle, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const TestMarket = () => {
  const { login, user, logout } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError('Por favor, ingresa un nombre de usuario');
      return;
    }
    
    try {
  await login(username, password || 'password'); // The password for test accounts is fixed
      setError(null);
      setLoginSuccess(true);
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setLoginSuccess(false);
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al iniciar sesión');
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="card-glass p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Test del Sistema de Mercado</h2>
          <p className="text-gray-300 mb-6">
            Esta página te permite probar el sistema de mercado de La Virtual Zone. Inicia sesión con una cuenta de DT para acceder a la funcionalidad completa.
          </p>
          
          {user ? (
            <div className="bg-dark p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User size={20} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user.username}</h3>
                    <p className="text-gray-400 text-sm">
                      {user.role === 'dt' ? 'Director Técnico' : 
                       user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      {user.club && ` • ${user.club}`}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="btn-outline"
                >
                  Cerrar Sesión
                </button>
              </div>
              
              {user.role === 'dt' ? (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start">
                  <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-400">¡Sesión de DT iniciada!</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Ahora puedes acceder al <a href="/liga-master/mercado" className="text-primary hover:underline">Mercado de Fichajes</a> para realizar ofertas por jugadores y gestionar las ofertas recibidas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start">
                  <AlertCircle size={20} className="text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-400">Funcionalidad limitada</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Tu cuenta no tiene rol de DT. Para acceder a la funcionalidad completa del mercado, inicia sesión con una cuenta de DT (ej: 'entrenador').
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-dark p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Iniciar Sesión</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-start">
                  <X size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              {loginSuccess && (
                <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg flex items-start">
                  <CheckCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                  <p>¡Inicio de sesión exitoso!</p>
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10 w-full"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
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
                    placeholder="La contraseña es 'password' para las cuentas de prueba"
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              </form>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Usuarios de prueba:</p>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li><span className="text-primary">entrenador</span> - Usuario con rol de DT (club: Neón FC)</li>
                  <li><span className="text-primary">usuario</span> - Usuario estándar sin club</li>
                  <li><span className="text-primary">admin</span> - Usuario con rol de administrador</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2">Nota: Para los usuarios de prueba, la contraseña es 'password'.</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="card-glass p-6">
          <h3 className="text-xl font-bold mb-4">Instrucciones de Prueba</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-primary mb-2">1. Inicia sesión con un DT</h4>
                <p className="text-gray-300 text-sm">
                  Usa el usuario <span className="text-primary">entrenador</span> con la contraseña <span className="text-primary">password</span> para iniciar sesión como DT de Neón FC.
                </p>
            </div>
            
            <div>
              <h4 className="font-bold text-primary mb-2">2. Ve al Mercado de Fichajes</h4>
              <p className="text-gray-300 text-sm mb-2">
                Dirígete a <a href="/liga-master/mercado" className="text-primary hover:underline">/liga-master/mercado</a> para acceder al mercado.
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm ml-2">
                <li>Busca jugadores transferibles</li>
                <li>Haz ofertas por jugadores de otros clubes</li>
                <li>Revisa las ofertas pendientes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-primary mb-2">3. Revisa la Plantilla de tu Club</h4>
              <p className="text-gray-300 text-sm">
                Ve a <a href="/liga-master/club/neón-fc" className="text-primary hover:underline">/liga-master/club/neón-fc</a> para ver tu plantilla actual y las finanzas del club.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-primary mb-2">4. Prueba Diferentes Roles</h4>
              <p className="text-gray-300 text-sm">
                Cierra sesión e inicia con diferentes usuarios para probar las distintas funcionalidades según el rol:
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm ml-2">
                <li>DT (entrenador): acceso completo al mercado</li>
                <li>Usuario (usuario): acceso limitado, solo visualización</li>
                <li>Admin (admin): capacidad de gestión del mercado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMarket;
 