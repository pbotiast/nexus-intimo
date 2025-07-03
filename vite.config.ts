import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Importar el módulo 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Configura los alias para que Vite los resuelva durante la construcción
      '@src': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@/views': path.resolve(__dirname, './views'), // Alias actualizado para el directorio de vistas
    },
  },
});
  