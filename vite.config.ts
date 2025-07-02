import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Esta configuración simplificada es más robusta para entornos de despliegue.
// Elimina la carga de variables de entorno del lado del cliente, que era un 
// riesgo de seguridad y la causa de los problemas de construcción.
export default defineConfig({
  plugins: [react()],
})
