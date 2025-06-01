import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'backend3-production-0b95.up.railway.app',
      '.ngrok-free.app'
    ],
    proxy: {
      '/api': {
        target: 'https://backend3-production-0b95.up.railway.app',
        changeOrigin: true,
        secure: true,
        ws: true
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  }
}) 