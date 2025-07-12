import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';

async function bootstrap() {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  const app = await NestFactory.create(AppModule, { cors: false });
  app.enableCors({
    origin: ['https://la-virtual-zone.app', 'http://localhost:5173'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });
  app.use(cookieParser());
  await app.listen(3000);
}

bootstrap();
