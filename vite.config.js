import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // You'll test vercel api locally or proxy it if needed, though usually vite runs on 5173 and serverless on another.
        changeOrigin: true,
      }
    }
  }
})
