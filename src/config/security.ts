// Configuración de seguridad para el frontend

export const SECURITY_CONFIG = {
  // Configuración de autenticación
  AUTH: {
    // Tiempo de expiración del token (en minutos)
    TOKEN_EXPIRY_MINUTES: 15,
    // Tiempo antes de la expiración para refrescar el token (en minutos)
    REFRESH_BEFORE_EXPIRY_MINUTES: 1,
    // Máximo número de intentos de login fallidos
    MAX_LOGIN_ATTEMPTS: 5,
    // Tiempo de bloqueo después de intentos fallidos (en minutos)
    LOCKOUT_DURATION_MINUTES: 15,
  },

  // Configuración de validación
  VALIDATION: {
    // Longitud mínima de contraseña
    MIN_PASSWORD_LENGTH: 8,
    // Longitud máxima de contraseña
    MAX_PASSWORD_LENGTH: 128,
    // Longitud mínima de nombre de usuario
    MIN_USERNAME_LENGTH: 3,
    // Longitud máxima de nombre de usuario
    MAX_USERNAME_LENGTH: 50,
    // Longitud máxima de email
    MAX_EMAIL_LENGTH: 255,
    // Longitud máxima de comentarios
    MAX_COMMENT_LENGTH: 1000,
    // Longitud máxima de contenido de blog
    MAX_BLOG_CONTENT_LENGTH: 10000,
  },

  // Configuración de sanitización
  SANITIZATION: {
    // Permitir HTML en comentarios
    ALLOW_HTML_IN_COMMENTS: false,
    // Permitir HTML en contenido de blog
    ALLOW_HTML_IN_BLOG: true,
    // Permitir HTML en títulos
    ALLOW_HTML_IN_TITLES: false,
    // Permitir HTML en descripciones
    ALLOW_HTML_IN_DESCRIPTIONS: false,
    // Permitir HTML en nombres de usuario
    ALLOW_HTML_IN_USERNAMES: false,
  },

  // Configuración de rate limiting
  RATE_LIMITING: {
    // Máximo número de requests por minuto
    MAX_REQUESTS_PER_MINUTE: 60,
    // Máximo número de intentos de login por minuto
    MAX_LOGIN_ATTEMPTS_PER_MINUTE: 5,
    // Máximo número de comentarios por minuto
    MAX_COMMENTS_PER_MINUTE: 3,
  },

  // Configuración de CORS
  CORS: {
    // Orígenes permitidos
    ALLOWED_ORIGINS: [
      // Origen del backend legado eliminado. Mantener dominios conocidos.
      'http://localhost:5173',
      'https://lavirtualzone.com',
      'https://www.lavirtualzone.com',
    ],
  },

  // Configuración de CSP (Content Security Policy)
  CSP: {
    // Directivas de CSP
    DIRECTIVES: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:', 'http:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'", 'https:', 'wss:'],
      'media-src': ["'self'"],
      'object-src': ["'none'"],
      'frame-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
  },

  // Configuración de headers de seguridad
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  },

  // Configuración de logging
  LOGGING: {
    // Habilitar logging de seguridad
    ENABLE_SECURITY_LOGGING: true,
    // Nivel de logging
    LOG_LEVEL: 'warn',
    // Información sensible a no loguear
    SENSITIVE_FIELDS: ['password', 'token', 'secret', 'key', 'authorization'],
  },

  // Configuración de desarrollo
  DEVELOPMENT: {
    // Habilitar modo de desarrollo
    ENABLE_DEV_MODE: import.meta.env.DEV,
    // Mostrar errores detallados en desarrollo
    SHOW_DETAILED_ERRORS: import.meta.env.DEV,
    // Habilitar herramientas de desarrollo
    ENABLE_DEV_TOOLS: import.meta.env.DEV,
  },
};

// Función para obtener configuración según el entorno
export const getSecurityConfig = () => {
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    return {
      ...SECURITY_CONFIG,
      DEVELOPMENT: {
        ...SECURITY_CONFIG.DEVELOPMENT,
        ENABLE_DEV_MODE: false,
        SHOW_DETAILED_ERRORS: false,
        ENABLE_DEV_TOOLS: false,
      },
      LOGGING: {
        ...SECURITY_CONFIG.LOGGING,
        LOG_LEVEL: 'error',
      },
    };
  }
  
  return SECURITY_CONFIG;
};

// Función para validar configuración
export const validateSecurityConfig = () => {
  const config = getSecurityConfig();
  
  // Validar configuración de autenticación
  if (config.AUTH.TOKEN_EXPIRY_MINUTES < 1) {
    console.warn('Token expiry time is too short');
  }
  
  if (config.AUTH.MAX_LOGIN_ATTEMPTS < 1) {
    console.warn('Max login attempts is too low');
  }
  
  // Validar configuración de validación
  if (config.VALIDATION.MIN_PASSWORD_LENGTH < 6) {
    console.warn('Minimum password length is too short');
  }
  
  if (config.VALIDATION.MAX_PASSWORD_LENGTH > 256) {
    console.warn('Maximum password length is too high');
  }
  
  // Validar configuración de rate limiting
  if (config.RATE_LIMITING.MAX_REQUESTS_PER_MINUTE < 10) {
    console.warn('Rate limiting is too restrictive');
  }
  
  return true;
};

// Función para obtener headers de seguridad
export const getSecurityHeaders = () => {
  const config = getSecurityConfig();
  return config.SECURITY_HEADERS;
};

// Función para obtener directivas CSP
export const getCSPDirectives = () => {
  const config = getSecurityConfig();
  return config.CSP.DIRECTIVES;
};

// Función para validar origen
export const isAllowedOrigin = (origin: string): boolean => {
  const config = getSecurityConfig();
  return config.CORS.ALLOWED_ORIGINS.includes(origin);
};

// Función para verificar si estamos en producción
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
}; 