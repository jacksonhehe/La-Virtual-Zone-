import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  }
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
}

bootstrap();
