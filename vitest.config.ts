import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts?(x)', 'src/**/*.test.ts?(x)'],
    exclude: ['server/**', 'node_modules/**'],
    coverage: {
      reporter: ['text', 'json']
    }
  },
});
