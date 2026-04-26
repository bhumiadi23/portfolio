import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Forward /api/claude → https://api.anthropic.com
      // This avoids CORS in the Vite dev server
      '/api/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/claude/, ''),
        secure: true,
      },
    },
  },
})
