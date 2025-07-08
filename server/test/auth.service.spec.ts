import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthService', () => {
  it('should be defined', async () => {
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test' })],
      providers: [AuthService, PrismaService],
    }).compile();
    const service = module.get(AuthService);
    expect(service).toBeDefined();
  });
});
