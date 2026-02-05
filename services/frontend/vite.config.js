import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: { clientPort: 5173 },
    proxy: {
      '/api': { target: 'http://gateway:5000', changeOrigin: true },
    },
  },
})
