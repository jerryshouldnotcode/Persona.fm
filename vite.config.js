// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server:{
    host: '127.0.0.1',
    proxy: {   // proxy any request starting with /api to your Express server
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false
      },
      '/login': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
      '/callback': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      }
    },
  },
  plugins: [react()] 
})


