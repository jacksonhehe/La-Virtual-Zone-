import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET') || 'your-super-secret-key-change-in-production',
      issuer: 'lvz-api',
      audience: 'lvz-client',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // Validar que el payload tenga la estructura correcta
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Token inválido');
    }

    // Verificar que el usuario aún existe en la base de datos
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        // No incluir password
      }
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar que el rol coincida
    if (user.role !== payload.role) {
      throw new UnauthorizedException('Token inválido - rol incorrecto');
    }

    return { 
      sub: user.id, 
      role: user.role,
      email: user.email,
      username: user.username,
    };
  }
}
