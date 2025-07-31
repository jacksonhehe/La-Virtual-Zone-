import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from './scripts/mdxPlugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
