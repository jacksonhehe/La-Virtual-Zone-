import { useState } from 'react';
import { X, UserPlus, Mail, User, Shield, AlertTriangle, Lock, KeyRound } from 'lucide-react';
import { listUsers } from '../../utils/authService';

type Role = 'user' | 'dt' | 'admin';

interface NewUserModalProps {
  onClose: () => void;
  onCreate: (data: { username: string; email: string; role: Role; roles: Role[]; password: string }) => Promise<void>;
}

const NewUserModal = ({ onClose, onCreate }: NewUserModalProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<Role[]>(['user']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRole = (role: Role) => {
    setRoles(prev => (prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    const u = username.trim();
    const m = email.trim();
    if (!u || !m) {
      setError('Completa usuario y correo');
      if (!u) setUsernameError('Requerido');
      if (!m) setEmailError('Requerido');
      return;
    }
    if (u.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres');
      setUsernameError('Minimo 3 caracteres');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(u)) {
      setError('El usuario solo puede contener letras, numeros, - y _');
      setUsernameError('Caracteres no permitidos');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) {
      setError('Ingresa un correo valido');
      setEmailError('Correo invalido');
      return;
    }
    const existing = listUsers();
    const uLower = u.toLowerCase();
    const mLower = m.toLowerCase();
    if (existing.some(x => x.username.toLowerCase() === uLower)) {
      setError('El nombre de usuario ya existe');
      setUsernameError('Ya existe');
      return;
    }
    if (existing.some(x => x.email.toLowerCase() === mLower)) {
      setError('El correo ya esta registrado');
      setEmailError('Ya registrado');
      return;
    }
    if (!roles.length) {
      setError('Selecciona al menos un rol');
      return;
    }
    if (!password) {
      setError('Es necesario definir una contrasena');
      setPasswordError('Requerido');
      return;
    }
    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      setPasswordError('Minimo 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      setConfirmPasswordError('No coinciden');
      return;
    }

    const primary: Role = roles.includes('admin') ? 'admin' : roles.includes('dt') ? 'dt' : 'user';
    setIsSubmitting(true);
    try {
      await onCreate({ username: u, email: m, role: primary, roles, password });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error creando usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="absolute inset-0" onClick={() => (!isSubmitting ? onClose() : null)}></div>
      <div className="relative bg-dark-light rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3">
            <UserPlus size={20} className="text-primary" />
            <div>
              <h3 className="text-xl font-bold text-white">Nuevo usuario</h3>
              <p className="text-sm text-gray-400">Crea una cuenta para el sistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
            aria-label="Cerrar"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-900">
          {error && (
            <div className="p-4 bg-gray-800 border border-red-500/50 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle size={18} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-red-300 font-semibold mb-1">Error de validacion</h5>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <User size={18} className="text-primary" />
                <h4 className="text-lg font-semibold text-white">Informacion de cuenta</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <User size={14} className="mr-2 text-gray-400" />
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    className={`input w-full ${usernameError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={username}
                    onChange={e => { setUsername(e.target.value); setUsernameError(null); setError(null); }}
                    disabled={isSubmitting}
                    placeholder="ej: jugador123"
                  />
                  {usernameError && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      {usernameError}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Minimo 3 caracteres, letras, numeros, - y _</p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Mail size={14} className="mr-2 text-gray-400" />
                    Correo electronico
                  </label>
                  <input
                    type="email"
                    className={`input w-full ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(null); setError(null); }}
                    disabled={isSubmitting}
                    placeholder="usuario@ejemplo.com"
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      {emailError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={18} className="text-primary" />
                <h4 className="text-lg font-semibold text-white">Roles</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['user', 'dt', 'admin'] as Role[]).map(role => (
                  <label key={role} className="flex items-center space-x-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                    <input
                      type="checkbox"
                      checked={roles.includes(role)}
                      onChange={() => toggleRole(role)}
                      disabled={isSubmitting}
                      className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <div>
                      <p className="text-sm font-medium capitalize">{role}</p>
                      <p className="text-xs text-gray-500">
                        {role === 'admin' ? 'Acceso total' : role === 'dt' ? 'Rol entrenador' : 'Rol basico'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Lock size={18} className="text-primary" />
                <h4 className="text-lg font-semibold text-white">Seguridad</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <KeyRound size={14} className="mr-2 text-gray-400" />
                    Contrasena
                  </label>
                  <input
                    type="password"
                    className={`input w-full ${passwordError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordError(null); setError(null); }}
                    disabled={isSubmitting}
                    placeholder="Minimo 8 caracteres"
                  />
                  {passwordError && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      {passwordError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <KeyRound size={14} className="mr-2 text-gray-400" />
                    Confirmar contrasena
                  </label>
                  <input
                    type="password"
                    className={`input w-full ${confirmPasswordError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setConfirmPasswordError(null); setError(null); }}
                    disabled={isSubmitting}
                    placeholder="Repite la contrasena"
                  />
                  {confirmPasswordError && (
                    <p className="mt-1 text-xs text-red-400 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-outline flex-1 sm:flex-none"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </span>
                ) : (
                  'Crear usuario'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewUserModal;

