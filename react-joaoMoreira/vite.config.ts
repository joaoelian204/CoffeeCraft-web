import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

// Middleware CORS para Vite
const corsPlugin = (): Plugin => ({
  name: 'custom-cors',
  configureServer(server) {
    server.middlewares.use((_, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'catalogoModule',
      filename: 'remoteEntry.js',
      exposes: {
        './single-spa-entry': './src/wrapper-single-spa-entry.ts',
      },
      shared: ['react', 'react-dom', '@supabase/supabase-js'],
    }),
    corsPlugin(),
  ],
  base: '/',
  server: {
    port: 3001,
    host: true,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
});