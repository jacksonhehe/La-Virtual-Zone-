const request = require('supertest');
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
const bcrypt = require('bcryptjs');

class MockPrismaService {
  users = [
    {
      id: 1,
      email: 'user@example.com',
      password: bcrypt.hashSync('pass', 10),
      role: 'USER',
    },
  ];
  sessions: any[] = [];
  user = {
    findUnique: async ({ where }: any) => {
      if (where.email) return this.users.find((u) => u.email === where.email) ?? null;
      if (where.id) return this.users.find((u) => u.id === where.id) ?? null;
      return null;
    },
  };
  session = {
    create: async ({ data }: any) => {
      const s = { id: this.sessions.length + 1, revoked: false, hashedAt: new Date(), ...data };
      this.sessions.push(s);
      return s;
    },
    findMany: async ({ where }: any) => {
      return this.sessions.filter((s) => s.userId === where.userId && s.revoked === where.revoked);
    },
    update: async ({ where, data }: any) => {
      const idx = this.sessions.findIndex((s) => s.id === where.id);
      if (idx >= 0) this.sessions[idx] = { ...this.sessions[idx], ...data };
      return this.sessions[idx];
    },
  };
}

describe('Auth refresh rotation', () => {
  let app: INestApplication;
  let prisma: MockPrismaService;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.JWT_SECRET = 'supersecretkeysupersecretkey1234';
    prisma = new MockPrismaService();
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({ secret: process.env.JWT_SECRET! }),
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('logs in and refreshes token rotating session', async () => {
    const http = request(app.getHttpServer());
    const login = await http.post('/auth/login').send({ email: 'user@example.com', password: 'pass' }).expect(201);
    const cookie = login.headers['set-cookie'][0];
    expect(prisma.sessions.length).toBe(1);

    const refresh = await http.post('/auth/refresh').set('Cookie', cookie).expect(201);
    const newCookie = refresh.headers['set-cookie'][0];
    expect(prisma.sessions.length).toBe(2);
    expect(prisma.sessions[0].revoked).toBe(true);

    // old cookie should fail
    await http.post('/auth/refresh').set('Cookie', cookie).expect(401);
    // new cookie works
    await http.post('/auth/refresh').set('Cookie', newCookie).expect(201);
  });
});
