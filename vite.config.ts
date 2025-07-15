import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from './scripts/mdxPlugin';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mdx()],
  resolve: {
    alias: {
      zod: '/src/lib/zod',
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
});
