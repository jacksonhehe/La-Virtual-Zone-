import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      zod: fileURLToPath(new URL('./src/lib/zod', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setupVitest.ts'],
    include: ['tests/**/*.test.ts?(x)', 'src/**/*.test.ts?(x)'],
    exclude: ['server/**', 'node_modules/**'],
    coverage: {
      reporter: ['text', 'json']
    }
  },
});
