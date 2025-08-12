import DOMPurify from 'dompurify';

// Configuración de DOMPurify
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'img', 'video', 'audio',
    'mark', 'del', 'ins', 'sub', 'sup'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'title', 'alt',
    'class', 'id', 'style',
    'src', 'width', 'height',
    'data-*' // Permitir atributos data-* para funcionalidad específica
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  WHOLE_DOCUMENT: false,
  RETURN_TRUSTED_TYPE: false,
  ADD_URI_SAFE_ATTR: ['target'],
  ALLOW_DATA_ATTR: false,
  USE_PROFILES: {
    html: true,
    svg: false,
    svgFilters: false,
    mathMl: false
  }
};

/**
 * Sanitiza texto HTML usando DOMPurify
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  try {
    return DOMPurify.sanitize(html, PURIFY_CONFIG);
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return '';
  }
};

/**
 * Sanitiza texto plano removiendo caracteres peligrosos
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .replace(/vbscript:/gi, '') // Remover vbscript:
    .replace(/data:/gi, '') // Remover data: URLs
    .trim();
};

/**
 * Sanitiza un objeto completo recursivamente
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = { ...obj };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    }
  }

  return sanitized;
};

/**
 * Sanitiza un array de objetos
 */
export const sanitizeArray = <T>(array: T[]): T[] => {
  if (!Array.isArray(array)) return [];
  
  return array.map(item => {
    if (typeof item === 'string') {
      return sanitizeText(item) as T;
    } else if (typeof item === 'object' && item !== null) {
      return sanitizeObject(item);
    }
    return item;
  });
};

/**
 * Valida y sanitiza un email
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Formato de email inválido');
  }
  
  return sanitized;
};

/**
 * Valida y sanitiza una URL
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  const sanitized = url.trim();
  
  // Verificar que sea una URL válida
  try {
    new URL(sanitized);
  } catch {
    throw new Error('URL inválida');
  }
  
  // Verificar que use un protocolo seguro
  if (!sanitized.startsWith('https://') && !sanitized.startsWith('http://')) {
    throw new Error('URL debe usar protocolo HTTP o HTTPS');
  }
  
  return sanitized;
};

/**
 * Sanitiza contenido para mostrar en dangerouslySetInnerHTML
 */
export const sanitizeForInnerHTML = (content: string): string => {
  if (!content) return '';
  
  // Primero sanitizar como texto
  const sanitizedText = sanitizeText(content);
  
  // Luego sanitizar como HTML si es necesario
  return sanitizeHtml(sanitizedText);
};

/**
 * Sanitiza atributos de elementos HTML
 */
export const sanitizeAttributes = (attributes: Record<string, string>): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(attributes)) {
    // Solo permitir atributos seguros
    const safeAttributes = [
      'class', 'id', 'style', 'title', 'alt', 'src', 'href',
      'width', 'height', 'target', 'rel', 'data-*'
    ];
    
    const isSafeAttribute = safeAttributes.some(attr => 
      key === attr || key.startsWith('data-')
    );
    
    if (isSafeAttribute) {
      sanitized[key] = sanitizeText(value);
    }
  }
  
  return sanitized;
};

/**
 * Sanitiza contenido de formularios
 */
export const sanitizeFormData = (formData: FormData): FormData => {
  const sanitized = new FormData();
  
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      sanitized.append(key, sanitizeText(value));
    } else {
      sanitized.append(key, value);
    }
  }
  
  return sanitized;
};

/**
 * Sanitiza parámetros de URL
 */
export const sanitizeUrlParams = (params: Record<string, string>): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    sanitized[key] = sanitizeText(value);
  }
  
  return sanitized;
};

/**
 * Verifica si una cadena contiene contenido peligroso
 */
export const containsDangerousContent = (text: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /vbscript:/i,
    /data:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(text));
};

/**
 * Escapa caracteres especiales para uso en HTML
 */
export const escapeHtml = (text: string): string => {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, char => escapeMap[char]);
};

/**
 * Sanitiza contenido para uso en atributos HTML
 */
export const sanitizeForAttribute = (text: string): string => {
  return escapeHtml(sanitizeText(text));
}; 