
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 👈 ¡ESTO ES CRUCIAL! Configura la ruta base
  base: '/foto-fachada/', 
});