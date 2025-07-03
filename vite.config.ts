import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Esta es la configuración estándar y mínima para un proyecto de Vite + React.
// Se basa en la estructura de proyecto convencional (index.html en la raíz, código en src).
// Esta simplicidad resuelve los problemas de rutas en los entornos de despliegue.
export default defineConfig({
  plugins: [react()],
})
