import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
process.env.JWT_SECRET = 'supersecretkeysupersecretkey1234';

describe('CORS', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({
      origin: ['https://la-virtual-zone.app', 'http://localhost:5173'],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type,Authorization',
    });
    await app.init();
  });

  it('blocks disallowed origin', () => {
    return request(app.getHttpServer())
      .get('/healthz')
      .set('Origin', 'http://evil.com')
      .expect(403);
  });
});
