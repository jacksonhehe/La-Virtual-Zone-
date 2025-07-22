import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Usamos un DOM simulado para que window y localStorage existan en los tests del frontend
    environment: 'jsdom',
    // Ejecutar código de configuración antes de las pruebas
    setupFiles: './tests/setup.ts',
    // Ignorar las pruebas del backend de NestJS para no requerir dependencias extra
    exclude: ['server/test/**'],
    coverage: {
      reporter: ['text', 'json']
    }
  },
});
