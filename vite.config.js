import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables so we can access your API key inside this config file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/ceda': {
          target: 'https://api.ceda.ashoka.edu.in/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ceda/, ''),
          // Intercept the request and inject the API key
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Assuming CEDA uses a Bearer token. Check their docs if they use 'x-api-key' instead.
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_CEDA_API_KEY}`);
            });
          }
        }
      }
    }
  }
})