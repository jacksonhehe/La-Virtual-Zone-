import { Injectable } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizationService {
  /**
   * Sanitiza texto HTML para prevenir XSS
   */
  sanitizeHtml(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      allowedAttributes: {
        'a': ['href', 'target']
      },
      allowedIframeHostnames: []
    });
  }

  /**
   * Sanitiza texto plano removiendo caracteres peligrosos
   */
  sanitizeText(text: string): string {
    if (!text) return text;
    
    return text
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .trim();
  }

  /**
   * Sanitiza un objeto completo
   */
  sanitizeObject<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = { ...obj };
    
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      }
    }

    return sanitized;
  }

  /**
   * Valida y sanitiza un email
   */
  sanitizeEmail(email: string): string {
    if (!email) return email;
    
    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized)) {
      throw new Error('Formato de email inválido');
    }
    
    return sanitized;
  }
} 