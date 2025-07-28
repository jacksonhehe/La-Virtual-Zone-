import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Usamos un DOM simulado para que window y localStorage existan en los tests del frontend
    environment: 'jsdom',
    // Ejecutar código de configuración antes de las pruebas
    setupFiles: './tests/setup.ts',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['server/test/**', 'node_modules/**', 'tests/useTournamentFilters.test.ts'],
    coverage: {
      reporter: ['text', 'json']
    }
  },
});
