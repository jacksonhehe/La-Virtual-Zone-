import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useSecureAuth } from '../../hooks/useSecureAuth';
import { sanitizeText, sanitizeEmail } from '../../utils/sanitization';
import toast from 'react-hot-toast';

// Esquema de validación
const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof LoginSchema>;

interface SecureLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const SecureLoginForm: React.FC<SecureLoginFormProps> = ({
  onSuccess,
  redirectTo = '/',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useSecureAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});

  // Obtener la URL de redirección desde el estado de la ubicación o parámetros de URL
  const getRedirectPath = () => {
    const from = location.state?.from;
    const urlParams = new URLSearchParams(location.search);
    const redirect = urlParams.get('redirect');
    
    return redirect || from || redirectTo;
  };

  // Validar campo individual
  const validateField = (field: keyof LoginFormData, value: string) => {
    try {
      LoginSchema.shape[field].parse(value);
      return '';
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || '';
      }
      return '';
    }
  };

  // Manejar cambios en los campos
  const handleChange = (field: keyof LoginFormData, value: string) => {
    // Sanitizar entrada
    const sanitizedValue = field === 'email' 
      ? sanitizeEmail(value) 
      : sanitizeText(value);

    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Marcar como tocado
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar en tiempo real si el campo ha sido tocado
    if (touched[field]) {
      const fieldError = validateField(field, sanitizedValue);
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  // Manejar pérdida de foco
  const handleBlur = (field: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldError = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  // Validar formulario completo
  const validateForm = (): boolean => {
    try {
      LoginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LoginFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    clearError();
    
    // Validar formulario
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      await login(formData.email, formData.password);
      
      toast.success('¡Inicio de sesión exitoso!');
      
      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirigir
      navigate(getRedirectPath(), { replace: true });
    } catch (error) {
      // El error ya se maneja en el hook useSecureAuth
      console.error('Error en login:', error);
    }
  };

  // Manejar envío con Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          onKeyPress={handleKeyPress}
          className={`w-full px-4 py-3 bg-dark-light border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.email ? 'border-red-500' : 'border-gray-600 focus:border-primary'
          }`}
          placeholder="tu@email.com"
          required
          autoComplete="email"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          onKeyPress={handleKeyPress}
          className={`w-full px-4 py-3 bg-dark-light border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.password ? 'border-red-500' : 'border-gray-600 focus:border-primary'
          }`}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password}</p>
        )}
      </div>

      {/* Error general */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Iniciando sesión...
          </div>
        ) : (
          'Iniciar Sesión'
        )}
      </button>

      {/* Enlaces adicionales */}
      <div className="text-center space-y-2">
        <a
          href="/recuperar-password"
          className="text-sm text-primary hover:text-primary-light transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </a>
        <div className="text-sm text-gray-400">
          ¿No tienes cuenta?{' '}
          <a
            href="/registro"
            className="text-primary hover:text-primary-light transition-colors"
          >
            Regístrate aquí
          </a>
        </div>
      </div>
    </form>
  );
}; 