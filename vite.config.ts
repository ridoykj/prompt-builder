import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  root: 'src/main/webapp',
  publicDir: 'public',
  build: {
    outDir: '../../../target/classes/static',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production', // Enables source maps in dev mode
    minify: 'esbuild', // Vite uses esbuild for minification by default
  },
  server: {
    port: 3000
  },
});
