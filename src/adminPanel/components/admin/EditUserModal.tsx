import  { useState, useRef, useEffect } from 'react';
import { User } from '../../types/shared';

interface Props {
  user: User;
  onClose: () => void;
  onSave: (userData: User) => void;
}

const EditUserModal = ({ user, onClose, onSave }: Props) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Usuario requerido';
    if (!formData.email.trim()) newErrors.email = 'Email requerido';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      let avatar = user.avatar;
      if (avatarFile) {
        try {
          const { uploadImage } = await import('../../../lib/uploadImage');
          avatar = await uploadImage(avatarFile, 'avatars');
        } catch (err) {
          console.error(err);
        }
      }
      onSave({ ...user, ...formData, avatar });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
        tabIndex={-1}
      >
        <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              className={`input w-full ${errors.username ? 'border-red-500' : ''}`}
              placeholder="Usuario"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>
          <div>
            <input
              type="email"
              className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <select
            className="input w-full"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value as User['role']})}
          >
            <option value="user">Usuario</option>
            <option value="dt">DT</option>
            <option value="admin">Admin</option>
          </select>
          <select
            className="input w-full"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as User['status']})}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <div>
            <label className="block text-sm font-medium mb-1">Avatar</label>
            <input
              type="file"
              onChange={e => setAvatarFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>
          <div className="flex space-x-3 justify-end mt-6">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
 