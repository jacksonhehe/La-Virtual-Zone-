import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // No revelar si el email existe o no
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    const { password, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email }
    });
    
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el username ya existe
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: registerDto.username }
    });
    
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Hash de la contraseña
    const saltRounds = 12; // Aumentar la seguridad
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username,
        password: hashedPassword,
        role: registerDto.role || 'USER',
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        // No incluir password en la respuesta
      }
    });

    return {
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }
    };
  }

  async login(res: any, user: any) {
    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });
    
    // Guardar refresh token en la base de datos
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Configurar cookie segura
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return { 
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }
    };
  }

  async refresh(res: any, token: string) {
    if (!token) {
      throw new UnauthorizedException('Token de refresco no proporcionado');
    }

    const stored = await this.prisma.refreshToken.findUnique({ 
      where: { token },
      include: { user: true }
    });
    
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }

    const user = stored.user;
    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });
    
    // Actualizar refresh token
    await this.prisma.refreshToken.update({ 
      where: { token }, 
      data: { 
        token: refreshToken, 
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      } 
    });

    // Configurar nueva cookie
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  async logout(res: any, userId: number) {
    // Invalidar refresh token
    await this.prisma.refreshToken.deleteMany({
      where: { userId }
    });

    // Limpiar cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { message: 'Sesión cerrada exitosamente' };
  }
}
