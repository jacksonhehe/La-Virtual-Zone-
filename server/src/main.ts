import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // Inicializar Sentry
  Sentry.init({ 
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development'
  });

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuración de seguridad con Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Configuración de CORS
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuración de cookies
  app.use(cookieParser());

  // Filtro de excepciones global
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no decoradas
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades no permitidas
      transform: true, // Transformar tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // No mostrar errores detallados en producción
    }),
  );

  // Configuración de rate limiting global
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Implementación básica de rate limiting
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutos
    const maxRequests = 100; // Máximo 100 requests por ventana

    // En producción, usar Redis o similar para almacenar el estado
    // Esta es una implementación básica en memoria
    if (!req.app.locals.rateLimit) {
      req.app.locals.rateLimit = new Map();
    }

    const clientData = req.app.locals.rateLimit.get(clientIp);
    if (!clientData) {
      req.app.locals.rateLimit.set(clientIp, {
        requests: 1,
        resetTime: now + windowMs,
      });
    } else if (now > clientData.resetTime) {
      req.app.locals.rateLimit.set(clientIp, {
        requests: 1,
        resetTime: now + windowMs,
      });
    } else if (clientData.requests >= maxRequests) {
      return res.status(429).json({
        message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.',
      });
    } else {
      clientData.requests++;
    }

    next();
  });

  // Configuración del puerto
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 Servidor ejecutándose en el puerto ${port}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});
