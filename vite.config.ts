import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',

  // Optimización de build para producción
  build: {
    // Generar sourcemaps solo en desarrollo
    sourcemap: false,

    // Bundle splitting para optimizar carga
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor: React y dependencias core
          'vendor': ['react', 'react-dom', 'react-router-dom'],

          // Zustand y estado
          'state': ['zustand'],

          // Iconos (son pesados)
          'icons': ['lucide-react']
        }
      }
    },

    // Chunk size warning
    chunkSizeWarningLimit: 500
  },

  // Optimizaciones de desarrollo
  server: {
    port: 5173,
    host: true
  },

  // Preview server
  preview: {
    port: 4173
  },

  // Eliminar console.logs en producción mediante esbuild
  esbuild: {
    drop: ['console', 'debugger']
  }
});