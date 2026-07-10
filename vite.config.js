import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://user-service:8081',
        changeOrigin: true,
      },
      '/class-api': {
        target: 'http://class-service:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/class-api/, '/api'),
      },
    },
  },
})