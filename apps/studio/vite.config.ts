import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env vars from .env files (including .env.local)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Extract API base URL from env or use default
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5050';
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@kb-labs/studio-ui-core': path.resolve(__dirname, '../../packages/ui-core/src'),
        '@kb-labs/studio-ui-react': path.resolve(__dirname, '../../packages/ui-react/src'),
        '@kb-labs/studio-data-client': path.resolve(__dirname, '../../packages/data-client/src'),
      },
    },
    server: {
      port: 3000,
      open: false,
      // Only set up proxy if using relative URL (/api)
      // If using full URL (default), the client connects directly to REST API
      ...(apiBaseUrl.startsWith('/') && {
        proxy: {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
          },
        },
      }),
    },
    preview: {
      port: 3000,
    },
  };
});

