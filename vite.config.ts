import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from './scripts/mdxPlugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mdx()],
  resolve: {
    alias: {
      zod: '/src/lib/zod'
    }
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
});
