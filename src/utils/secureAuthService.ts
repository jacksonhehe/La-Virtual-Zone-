import { jwtDecode } from 'jwt-decode';
import { z } from 'zod';

// Esquemas de validación
const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
});

// Tipos
export interface JWTPayload {
  sub: string;
  role: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Clase para manejo seguro de autenticación
class SecureAuthService {
  private accessToken: string | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Intentar restaurar la sesión al inicializar
    this.restoreSession();
  }

  /**
   * Sanitiza datos de entrada
   */
  private sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Valida y sanitiza datos de login
   */
  private validateLoginData(data: unknown) {
    const sanitizedData = {
      email: this.sanitizeInput((data as any).email || ''),
      password: (data as any).password || '',
    };
    return LoginSchema.parse(sanitizedData);
  }

  /**
   * Valida y sanitiza datos de registro
   */
  private validateRegisterData(data: unknown) {
    const sanitizedData = {
      email: this.sanitizeInput((data as any).email || ''),
      username: this.sanitizeInput((data as any).username || ''),
      password: (data as any).password || '',
    };
    return RegisterSchema.parse(sanitizedData);
  }

  /**
   * Realiza una petición HTTP segura
   */
  private async secureRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Incluir cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Agregar token si existe
    if (this.accessToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, intentar refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Reintentar la petición original
            return this.secureRequest(endpoint, options);
          }
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la petición');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(this.sanitizeErrorMessage(error.message));
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Sanitiza mensajes de error para no revelar información sensible
   */
  private sanitizeErrorMessage(message: string): string {
    const sensitivePatterns = [
      /database/i,
      /sql/i,
      /connection/i,
      /internal/i,
      /stack/i,
      /trace/i,
    ];

    if (sensitivePatterns.some(pattern => pattern.test(message))) {
      return 'Error interno del servidor';
    }

    return message;
  }

  /**
   * Decodifica y valida un JWT
   */
  private decodeAndValidateToken(token: string): JWTPayload | null {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      
      // Verificar que el token no haya expirado
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null;
      }

      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Configura el timeout para refresh del token
   */
  private setupRefreshTimeout(exp: number) {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const timeUntilExpiry = (exp * 1000) - Date.now() - (60 * 1000); // Refresh 1 minuto antes
    
    if (timeUntilExpiry > 0) {
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken();
      }, timeUntilExpiry);
    }
  }

  /**
   * Restaura la sesión desde localStorage (solo para desarrollo)
   */
  private restoreSession() {
    if (import.meta.env.DEV) {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        const payload = this.decodeAndValidateToken(storedToken);
        if (payload) {
          this.accessToken = storedToken;
          this.setupRefreshTimeout(payload.exp);
        } else {
          localStorage.removeItem('accessToken');
        }
      }
    }
  }

  /**
   * Login seguro
   */
  async login(email: string, password: string): Promise<User> {
    const validatedData = this.validateLoginData({ email, password });
    
    const response = await this.secureRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    });

    this.accessToken = response.accessToken;
    
    // Decodificar y validar el token
    const payload = this.decodeAndValidateToken(response.accessToken);
    if (!payload) {
      throw new Error('Token inválido recibido del servidor');
    }

    // Configurar refresh automático
    this.setupRefreshTimeout(payload.exp);

    // En desarrollo, guardar token en localStorage para persistencia
    if (import.meta.env.DEV) {
      localStorage.setItem('accessToken', response.accessToken);
    }

    return response.user;
  }

  /**
   * Registro seguro
   */
  async register(email: string, username: string, password: string): Promise<User> {
    const validatedData = this.validateRegisterData({ email, username, password });
    
    const response = await this.secureRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    });

    this.accessToken = response.accessToken;
    
    const payload = this.decodeAndValidateToken(response.accessToken);
    if (!payload) {
      throw new Error('Token inválido recibido del servidor');
    }

    this.setupRefreshTimeout(payload.exp);

    if (import.meta.env.DEV) {
      localStorage.setItem('accessToken', response.accessToken);
    }

    return response.user;
  }

  /**
   * Refresh del token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await this.secureRequest<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
      });

      this.accessToken = response.accessToken;
      
      const payload = this.decodeAndValidateToken(response.accessToken);
      if (payload) {
        this.setupRefreshTimeout(payload.exp);
        
        if (import.meta.env.DEV) {
          localStorage.setItem('accessToken', response.accessToken);
        }
        
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Logout seguro
   */
  async logout(): Promise<void> {
    try {
      await this.secureRequest('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Continuar con la limpieza local incluso si el logout del servidor falla
    } finally {
      this.clearSession();
    }
  }

  /**
   * Limpia la sesión local
   */
  private clearSession(): void {
    this.accessToken = null;
    
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }

    // Limpiar localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  }

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.secureRequest<User>('/auth/me');
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Obtiene el token actual (solo para uso interno)
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Decodifica el token para obtener información del usuario
   */
  getTokenPayload(): JWTPayload | null {
    if (!this.accessToken) return null;
    return this.decodeAndValidateToken(this.accessToken);
  }
}

// Instancia singleton
export const secureAuthService = new SecureAuthService();

// Funciones de conveniencia
export const login = (email: string, password: string) => secureAuthService.login(email, password);
export const register = (email: string, username: string, password: string) => secureAuthService.register(email, username, password);
export const logout = () => secureAuthService.logout();
export const getCurrentUser = () => secureAuthService.getCurrentUser();
export const isAuthenticated = () => secureAuthService.isAuthenticated();
export const getTokenPayload = () => secureAuthService.getTokenPayload(); 