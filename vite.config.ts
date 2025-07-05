import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Servidor de desarrollo del backend
        changeOrigin: true,
      },
    },
  },
  // --- AÑADIDO PARA FORZAR LA RECONSTRUCCIÓN ---
  // Esto le dice a Vite que no guarde en caché las dependencias pre-compiladas.
  optimizeDeps: {
    force: true, 
  },
});
