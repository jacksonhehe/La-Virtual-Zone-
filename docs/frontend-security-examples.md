# Ejemplos de Seguridad para el Frontend

## 1. Validación de Formularios

### Ejemplo: Formulario de Login con Validación

```typescript
// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email requerido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const validateForm = (data: LoginFormData): boolean => {
    try {
      loginSchema.parse(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    // Sanitizar datos antes de enviar
    const sanitizedData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const data = await response.json();
      // Manejar respuesta exitosa
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
};
```

## 2. Sanitización de Datos

### Utilidad de Sanitización

```typescript
// src/utils/sanitization.ts
export const sanitizeString = (input: string): string => {
  if (!input) return input;
  
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
};

export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    }
  }
  
  return sanitized;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## 3. Manejo Seguro de Tokens

### Hook para Autenticación

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Obtener token del localStorage de forma segura
  const getStoredToken = useCallback((): string | null => {
    try {
      return localStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }, []);

  // Guardar token de forma segura
  const setStoredToken = useCallback((token: string | null) => {
    try {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Error al guardar token:', error);
    }
  }, []);

  // Verificar token y obtener usuario
  const verifyToken = useCallback(async () => {
    const token = getStoredToken();
    
    if (!token) {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        });
        setAccessToken(token);
      } else {
        // Token inválido, limpiar
        setStoredToken(null);
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      setStoredToken(null);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, [getStoredToken, setStoredToken]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const data = await response.json();
      setStoredToken(data.accessToken);
      setAccessToken(data.accessToken);
      
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }, [setStoredToken]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setStoredToken(null);
      setAccessToken(null);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, [setStoredToken]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStoredToken(data.accessToken);
        setAccessToken(data.accessToken);
        return data.accessToken;
      } else {
        throw new Error('Error al refrescar token');
      }
    } catch (error) {
      console.error('Error al refrescar token:', error);
      logout();
      throw error;
    }
  }, [logout, setStoredToken]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return {
    ...authState,
    login,
    logout,
    refreshToken,
    accessToken,
  };
};
```

## 4. Interceptor para Requests HTTP

### Axios Interceptor

```typescript
// src/utils/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      withCredentials: true,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Agregar token si existe
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Sanitizar datos de entrada
        if (config.data) {
          config.data = this.sanitizeData(config.data);
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Si el token expiró, intentar refrescar
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await this.client.post('/auth/refresh');
            const newToken = refreshResponse.data.accessToken;
            
            localStorage.setItem('accessToken', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            return this.client(originalRequest);
          } catch (refreshError) {
            // Si el refresh falla, redirigir al login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/[<>]/g, '').trim();
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      for (const [key, value] of Object.entries(sanitized)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  // Métodos HTTP
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

## 5. Componente de Protección de Rutas

```typescript
// src/components/auth/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};
```

## 6. Utilidad para Validación de Contraseñas

```typescript
// src/utils/passwordValidation.ts
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};
```

## 7. Configuración de CSP en index.html

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  
  <!-- Content Security Policy -->
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; 
                 script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
                 style-src 'self' 'unsafe-inline'; 
                 img-src 'self' data: https:; 
                 font-src 'self'; 
                 connect-src 'self' http://localhost:3000;">
  
  <!-- Otros headers de seguridad -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  <meta http-equiv="X-XSS-Protection" content="1; mode=block">
  
  <title>La Virtual Zone</title>
</head>
<body>
  <noscript>Necesitas habilitar JavaScript para ejecutar esta aplicación.</noscript>
  <div id="root"></div>
</body>
</html>
```

## 8. Configuración de Vite para Seguridad

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Configuración de seguridad para desarrollo
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  build: {
    // Configuración de seguridad para producción
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          auth: ['react-router-dom'],
        },
      },
    },
    // Generar source maps solo en desarrollo
    sourcemap: process.env.NODE_ENV === 'development',
  },
  define: {
    // Variables de entorno
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000'),
  },
});
```

Estos ejemplos proporcionan una base sólida para implementar seguridad en el frontend de tu aplicación. Recuerda adaptarlos según las necesidades específicas de tu proyecto. 