import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, params } = request;
    const startTime = Date.now();

    // Definir acciones críticas que requieren auditoría
    const criticalActions = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const isCriticalAction = criticalActions.includes(method);

    if (isCriticalAction) {
      console.log(`[AUDIT] ${new Date().toISOString()} - ${method} ${url}`);
      console.log(`[AUDIT] User: ${user?.sub || 'anonymous'} (${user?.role || 'none'})`);
      
      if (Object.keys(body || {}).length > 0) {
        // Log del body sin información sensible
        const sanitizedBody = this.sanitizeBody(body);
        console.log(`[AUDIT] Body: ${JSON.stringify(sanitizedBody)}`);
      }
      
      if (Object.keys(params || {}).length > 0) {
        console.log(`[AUDIT] Params: ${JSON.stringify(params)}`);
      }
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          if (isCriticalAction) {
            const duration = Date.now() - startTime;
            console.log(`[AUDIT] Success - Duration: ${duration}ms`);
          }
        },
        error: (error) => {
          if (isCriticalAction) {
            const duration = Date.now() - startTime;
            console.error(`[AUDIT] Error - Duration: ${duration}ms - ${error.message}`);
          }
        }
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
} 