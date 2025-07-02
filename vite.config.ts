import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      zod: '/src/lib/zod'
    }
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
});
