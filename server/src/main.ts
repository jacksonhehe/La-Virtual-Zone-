import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from '@nest/helmet';
import express from 'express';
import * as Sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);
  Sentry.init({ dsn: config.get<string>('SENTRY_DSN') });
  app.enableCors({
    origin: ['https://la-virtual-zone.app', 'http://localhost:5173'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });
  app.use(cookieParser());
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  await app.listen(config.get<number>('PORT'));
}

bootstrap();
