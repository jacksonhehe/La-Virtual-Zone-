import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  SENTRY_DSN: z.string().optional(),
  PORT: z.string().regex(/^\d+$/).default('3000'),
});
