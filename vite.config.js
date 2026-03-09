import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ceda': {
        target: 'https://api.ceda.ashoka.edu.in/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ceda/, '')
      }
    }
  }
})