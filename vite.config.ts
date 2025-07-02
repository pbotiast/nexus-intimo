import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // Explicitly set the project root to the current directory
  // This solves path resolution issues in Render's build environment.
  root: process.cwd(),
  plugins: [react()],
  build: {
    // Ensure the output is in a 'dist' folder at the repository root
    outDir: path.resolve(process.cwd(), 'dist'),
    // It's good practice to empty the output directory before a new build
    emptyOutDir: true,
  }
})
