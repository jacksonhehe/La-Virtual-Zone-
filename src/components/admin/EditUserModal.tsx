import { useState } from 'react';
import { X, UserCog, Mail, User, Shield, CheckCircle, AlertTriangle, Ban, Clock } from 'lucide-react';
import { listUsers } from '../../utils/authService';

type Role = 'user' | 'dt' | 'admin';
type Status = 'active' | 'suspended' | 'banned';

interface EditUserModalProps {
  user: { id: string; username: string; email: string; role: Role; roles?: Role[]; status: Status; suspendedUntil?: string; suspendedReason?: string; banReason?: string };
  existingUsers?: Array<{ id: string; username: string; email: string }>;
  onClose: () => void;
  onSave: (data: { username: string; email: string; role: Role; roles: Role[]; status: Status; suspendedUntil?: string; suspendedReason?: string; banReason?: string }) => void;
}

const EditUserModal = ({ user, onClose, onSave, existingUsers }: EditUserModalProps) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [roles, setRoles] = useState<Role[]>(Array.isArray((user as any).roles) && (user as any).roles.length ? (user as any).roles as Role[] : [user.role]);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(user.status);
  const toYMD = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');
  const [suspendedUntil, setSuspendedUntil] = useState<string>(toYMD(user.suspendedUntil));
  const [suspendedReason, setSuspendedReason] = useState<string>(user.suspendedReason || '');
  const [banReason, setBanReason] = useState<string>(user.banReason || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUsernameError(null);
    setEmailError(null);

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
      setUsernameError('Mínimo 3 caracteres');
      return;
    }
    const usernameOk = /^[a-zA-Z0-9_-]+$/.test(u);
    if (!usernameOk) {
      setError('El usuario solo puede contener letras, números, guion (-) y guion bajo (_)');
      setUsernameError('Caracteres no permitidos');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m);
    if (!emailOk) {
      setError('Ingresa un correo válido');
      setEmailError('Correo inválido');
      return;
    }

    const existing = existingUsers ?? listUsers();
    const uLower = u.toLowerCase();
    const mLower = m.toLowerCase();
    if (existing.some(x => x.id !== user.id && x.username.toLowerCase() === uLower)) {
      setError('El nombre de usuario ya existe');
      setUsernameError('Ya existe');
      return;
    }
    if (existing.some(x => x.id !== user.id && x.email.toLowerCase() === mLower)) {
      setError('El correo ya está registrado');
      setEmailError('Ya registrado');
      return;
    }

    const primary: Role = roles.includes('admin') ? 'admin' : roles.includes('dt') ? 'dt' : 'user';
    const payload: {
      username: string;
      email: string;
      role: Role;
      roles: Role[];
      status: Status;
      suspendedUntil: string | null;
      suspendedReason: string | null;
      banReason: string | null;
    } = {
      username: u,
      email: m,
      role: primary,
      roles,
      status,
      suspendedUntil: null,
      suspendedReason: null,
      banReason: null
    };
    if (status === 'suspended') {
      payload.suspendedUntil = suspendedUntil ? new Date(suspendedUntil).toISOString() : null;
      payload.suspendedReason = suspendedReason ? suspendedReason : null;
      payload.banReason = null;
    } else if (status === 'banned') {
      payload.banReason = banReason ? banReason : null;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700/50 flex flex-col max-h-[90vh]">
        {/* Header con gradiente azul */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <UserCog size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Editar Usuario</h3>
                <p className="text-sm text-gray-400">Modifica la información del usuario</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="p-6 pb-4">
            <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Mensajes de error mejorados */}
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

            {/* Card de Información de cuenta */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <User size={18} className="text-blue-400" />
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

            {/* Card de Roles */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={18} className="text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Permisos y Roles</h4>
              </div>
              
              <div className="space-y-3">
                {(['user','dt','admin'] as Role[]).map((r) => (
                  <label 
                    key={r} 
                    className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                      roles.includes(r)
                        ? 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20'
                        : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2 mr-3"
                      checked={roles.includes(r)}
                      onChange={(e) => {
                        setRoles((prev) => {
                          if (e.target.checked) return Array.from(new Set([...prev, r]));
                          return prev.filter(x => x !== r);
                        });
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

            {/* Card de Estado */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle size={18} className="text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Estado de la Cuenta</h4>
              </div>
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  Estado del Usuario
                </label>
                <select 
                  className="input w-full"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as Status)}
                >
                  <option value="active">Activo</option>
                  <option value="suspended">Suspendido</option>
                  <option value="banned">Baneado</option>
                </select>
              </div>

              {/* Campos condicionales para suspensión */}
              {status === 'suspended' && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-4">
                  <div className="flex items-center text-yellow-400 mb-2">
                    <Clock size={16} className="mr-2" />
                    <span className="font-medium text-sm">Detalles de Suspensión</span>
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      Suspendido hasta
                    </label>
                    <input
                      type="date"
                      className="input w-full"
                      value={suspendedUntil}
                      onChange={(e) => setSuspendedUntil(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      Motivo de suspensión
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={suspendedReason}
                      onChange={(e) => setSuspendedReason(e.target.value)}
                      placeholder="Opcional: ej. Violación de términos"
                    />
                  </div>
                </div>
              )}

              {/* Campos condicionales para baneo */}
              {status === 'banned' && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-4">
                  <div className="flex items-center text-red-400 mb-2">
                    <Ban size={16} className="mr-2" />
                    <span className="font-medium text-sm">Detalles de Baneo</span>
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      Motivo de ban
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Opcional: ej. Conducta inapropiada"
                    />
                  </div>
                </div>
              )}
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
              >
                <X size={16} className="mr-2" />
                Cancelar
              </button>
              <button
                type="submit"
                form="edit-user-form"
                className="flex-1 btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all"
              >
                <CheckCircle size={16} className="mr-2" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
