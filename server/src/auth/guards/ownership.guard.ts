import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id || request.params.userId;
    const resourceUserId = request.body?.userId;

    // Si no hay usuario autenticado, no permitir
    if (!user) {
      throw new ForbiddenException('Acceso denegado');
    }

    // Si el usuario es admin, permitir acceso a todo
    if (user.role === 'ADMIN') {
      return true;
    }

    // Verificar si el usuario está intentando acceder a sus propios recursos
    const targetUserId = resourceId || resourceUserId;
    
    if (targetUserId && parseInt(targetUserId) !== user.sub) {
      throw new ForbiddenException('No tienes permisos para acceder a este recurso');
    }

    return true;
  }
} 