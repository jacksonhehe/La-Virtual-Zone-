import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { z } from 'zod';

const schema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm: z.string()
  })
  .refine(data => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm']
  });

const DefinirContrasena = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { password?: string; confirm?: string } = {};
      result.error.issues.forEach(issue => {
        const key = issue.path[0] as 'password' | 'confirm';
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (!token) {
      setError('Token inválido');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: form.password })
    if (!error) {
      navigate('/login')
    } else {
      setError(error.message)
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="card border border-gray-800">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Restablecer Contraseña</h2>
              <p className="text-gray-400 mt-1">Ingresa tu nueva contraseña</p>
            </div>
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-start">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  className="input w-full"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  className="input w-full"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                />
                {errors.confirm && <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>}
              </div>
              <div>
                <button type="submit" className="btn-primary w-full flex justify-center items-center">
                  <Lock size={18} className="mr-2" />Restablecer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefinirContrasena;
