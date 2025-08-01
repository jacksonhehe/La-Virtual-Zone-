import { Body, Controller, Get, Post, Req, Res, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SanitizationService } from '../common/services/sanitization.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: any) {
    // Sanitizar datos de entrada
    const sanitizedDto = this.sanitizationService.sanitizeObject(loginDto);
    const sanitizedEmail = this.sanitizationService.sanitizeEmail(sanitizedDto.email);
    
    const user = await this.authService.validateUser(sanitizedEmail, sanitizedDto.password);
    return this.authService.login(res, user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      // Sanitizar datos de entrada
      const sanitizedDto = this.sanitizationService.sanitizeObject(registerDto);
      const sanitizedEmail = this.sanitizationService.sanitizeEmail(sanitizedDto.email);
      
      return this.authService.register({
        ...sanitizedDto,
        email: sanitizedEmail,
      });
    } catch (error: any) {
      // Si el error es de validación de email, devolver un mensaje más claro
      if (error.message === 'Formato de email inválido') {
        throw new Error('El formato del email no es válido');
      }
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new Error('Token de refresco no encontrado');
    }
    return this.authService.refresh(res, token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    return this.authService.logout(res, req.user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER, Role.CLUB)
  async me(@Req() req: any) {
    // Solo devolver información básica del usuario
    return { 
      userId: req.user.sub, 
      role: req.user.role,
      // No incluir información sensible
    };
  }
}
