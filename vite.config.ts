import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // Configurações base
  base: '/',
  
  // Configurações de build
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  },
  
  // Configurações do servidor de desenvolvimento
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'contrato-claro-backend-production.up.railway.app',
      'app.naosefoda.com.br',
      '.ngrok-free.app'
    ],
    proxy: {
      '/api': {
        target: 'https://contrato-claro-backend-production.up.railway.app',
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
  },
  
  // Configurações de preview
  preview: {
    port: 4173,
    host: true
  },
  
  // Configurações de ambiente
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})) 