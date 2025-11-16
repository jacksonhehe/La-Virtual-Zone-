import { useState } from 'react';
import { X, UserPlus, Mail, User, Shield, CheckCircle, AlertTriangle, Lock, KeyRound } from 'lucide-react';
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
  const [success, setSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) {
      return;
    }
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
    // Validación mínima de longitud de usuario
    if (u.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres');
      setUsernameError('Mínimo 3 caracteres');
      return;
    }
    // Validación de caracteres permitidos (letras, números, guion y guion bajo)
    const usernameOk = /^[a-zA-Z0-9_-]+$/.test(u);
    if (!usernameOk) {
      setError('El usuario solo puede contener letras, números, guion (-) y guion bajo (_)');
      setUsernameError('Caracteres no permitidos');
      return;
    }
    // Validación de formato básico de email
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m);
    if (!emailOk) {
      setError('Ingresa un correo válido');
      setEmailError('Correo inválido');
      return;
    }
    // Validación de duplicados (usuario/correo, case-insensitive)
    const existing = listUsers();
    const uLower = u.toLowerCase();
    const mLower = m.toLowerCase();
    if (existing.some(x => x.username.toLowerCase() === uLower)) {
      setError('El nombre de usuario ya existe');
      setUsernameError('Ya existe');
      return;
    }
    if (existing.some(x => x.email.toLowerCase() === mLower)) {
      setError('El correo ya está registrado');
      setEmailError('Ya registrado');
      return;
    }
    if (!roles || roles.length === 0) {
      setError('Selecciona al menos un rol');
      return;
    }
    if (!password) {
      setError('Es necesario definir una contraseña');
      setPasswordError('Requerido');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setPasswordError('Mínimo 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setConfirmPasswordError('No coinciden');
      return;
    }
    const primary: Role = roles.includes('admin') ? 'admin' : roles.includes('dt') ? 'dt' : 'user';
    setSubmitting(true);
    try {
      await onCreate({ username: u, email: m, role: primary, roles, password });
      setSuccess(true);
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error creando usuario desde el panel:', err);
      setError(err?.message || 'Error creando usuario');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700/50 flex flex-col max-h-[90vh]">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-green-600/20 via-green-500/10 to-transparent p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserPlus size={24} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Nuevo Usuario</h3>
                <p className="text-sm text-gray-400">Crea una nueva cuenta de usuario</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
              disabled={success || submitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="p-6 pb-4">
            <form id="new-user-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Mensajes de error/éxito mejorados */}
            {error && (
              <div className="p-4 bg-gradient-to-r from-red-500/20 to-red-600/10 border-l-4 border-red-500 rounded-lg shadow-lg">
                <div className="flex items-start">
                  <AlertTriangle size={20} className="text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-red-400 font-semibold mb-1">Error de validación</h5>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-green-600/10 border-l-4 border-green-500 rounded-lg shadow-lg">
                <div className="flex items-start">
                  <CheckCircle size={20} className="text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-green-400 font-semibold mb-1">¡Éxito!</h5>
                    <p className="text-green-300 text-sm">Usuario creado correctamente</p>
                  </div>
                </div>
              </div>
            )}

            {/* Card de Información de cuenta */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <User size={18} className="text-green-400" />
                <h4 className="text-lg font-semibold text-white">Información de Cuenta</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <User size={16} className="mr-2 text-gray-400" />
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    className={`input w-full ${usernameError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); if (usernameError) setUsernameError(null); if (error) setError(null); }}
                    disabled={success || submitting}
                    placeholder="ej: jugador123"
                  />
                  {usernameError && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      {usernameError}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Mínimo 3 caracteres, solo letras, números, - y _</p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Mail size={16} className="mr-2 text-gray-400" />
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className={`input w-full ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); if (error) setError(null); }}
                    disabled={success || submitting}
                    placeholder="usuario@ejemplo.com"
                  />
                  {emailError && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      {emailError}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Card de Seguridad */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border border-gray-700/60">
              <div className="flex items-center space-x-2 mb-4">
                <Lock size={18} className="text-yellow-400" />
                <h4 className="text-lg font-semibold text-white">Seguridad</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Lock size={16} className="mr-2 text-gray-400" />
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className={`input w-full ${passwordError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(null); if (error) setError(null); }}
                    disabled={success || submitting}
                    placeholder="Al menos 8 caracteres"
                  />
                  {passwordError && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      {passwordError}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Recomendado: combiná mayúsculas, minúsculas y números.</p>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <KeyRound size={16} className="mr-2 text-gray-400" />
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    className={`input w-full ${confirmPasswordError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (confirmPasswordError) setConfirmPasswordError(null); if (error) setError(null); }}
                    disabled={success || submitting}
                    placeholder="Repite la contraseña"
                  />
                  {confirmPasswordError && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Card de Roles */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={18} className="text-green-400" />
                <h4 className="text-lg font-semibold text-white">Permisos y Roles</h4>
              </div>
              
              <div className="space-y-3">
                {(['user','dt','admin'] as Role[]).map((r) => (
                  <label 
                    key={r} 
                    className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                      roles.includes(r)
                        ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20'
                        : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-500 bg-gray-600 border-gray-500 rounded focus:ring-green-500 focus:ring-2 mr-3"
                      checked={roles.includes(r)}
                      disabled={success || submitting}
                      onChange={(e) => {
                        if (submitting) return;
                        setRoles((prev) => {
                          if (e.target.checked) return Array.from(new Set([...prev, r]));
                          return prev.filter(x => x !== r);
                        });
                        if (error) setError(null);
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {r === 'admin' ? 'Administrador' : r === 'dt' ? 'Director Técnico' : 'Usuario'}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          r === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                          r === 'dt' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {r.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r === 'admin' ? 'Control total del sistema' : 
                         r === 'dt' ? 'Gestión de equipos y jugadores' : 
                         'Acceso básico a la plataforma'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            </form>
          </div>
        </div>

        {/* Footer fijo */}
        <div className="flex-shrink-0 border-t border-gray-700/50 bg-gray-900/50">
          <div className="p-6">
            <div className="flex space-x-3">
              <button
                type="button"
                className="flex-1 btn-outline hover:bg-gray-700 transition-all"
                onClick={onClose}
                disabled={success || submitting}
              >
                <X size={16} className="mr-2" />
                Cancelar
              </button>
              <button
                type="submit"
                form="new-user-form"
                className="flex-1 btn-primary bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/20 transition-all"
                disabled={success || submitting}
              >
                <UserPlus size={16} className="mr-2" />
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUserModal;
