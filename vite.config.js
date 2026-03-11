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
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_CEDA_API_KEY}`);
            });
          }
        }
      }
    },
    build: {
      rollupOptions: {
        // CHANGE 1: This hides the "Generated an empty chunk" yellow warnings
        onwarn(warning, warn) {
          if (warning.code === 'EMPTY_BUNDLE') return;
          warn(warning);
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          }
        }
      },
      // CHANGE 2: Increases the limit to 2MB so your Three.js file doesn't show a warning
      chunkSizeWarningLimit: 2000 
    }
  }
})