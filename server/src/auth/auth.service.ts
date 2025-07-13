import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
const bcrypt = require('bcryptjs');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await (this.prisma as any).user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException();
    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }

  async login(res: any, user: any) {
    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });
    await (this.prisma as any).session.create({
      data: {
        userId: user.id,
        refreshHash: await bcrypt.hash(refreshToken, 10),
      },
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/auth/refresh',
    });
    return { accessToken };
  }

  async refresh(res: any, token: string) {
    if (!token) throw new UnauthorizedException();
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException();
    }
    const sessions = await (this.prisma as any).session.findMany({
      where: { userId: payload.sub, revoked: false },
    });
    let current: any = null;
    for (const session of sessions) {
      if (await bcrypt.compare(token, session.refreshHash)) {
        current = session;
        break;
      }
    }
    if (!current) throw new UnauthorizedException();
    await (this.prisma as any).session.update({ where: { id: current.id }, data: { revoked: true } });
    const newRefresh = this.jwt.sign({ sub: payload.sub, role: payload.role }, { expiresIn: '7d' });
    await (this.prisma as any).session.create({
      data: { userId: payload.sub, refreshHash: await bcrypt.hash(newRefresh, 10) },
    });
    const accessToken = this.jwt.sign({ sub: payload.sub, role: payload.role }, { expiresIn: '15m' });
    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/auth/refresh',
    });
    return { accessToken };
  }
}
