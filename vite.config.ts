import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from './scripts/mdxPlugin';
import path from 'node:path';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mdx()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      zod: '/src/lib/zod'
    }
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
});
