import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env vars from .env files (including .env.local)
  const env = loadEnv(mode, process.cwd(), '');

  // Extract API base URL from env or use default
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:4000';

  return {
    plugins: [
      react(),
      federation({
        name: 'studioHost',
        // Remotes are loaded DYNAMICALLY at runtime from the registry.
        // No static remote declarations here.
        remotes: {},
        shared: {
          react: { singleton: true, requiredVersion: '^18.3.0', eager: true },
          'react-dom': { singleton: true, requiredVersion: '^18.3.0', eager: true },
          'react-router-dom': { singleton: true, requiredVersion: '^7.0.0', eager: true },
          antd: { singleton: true, requiredVersion: '^5.21.0', eager: true },
          '@ant-design/icons': { singleton: true, requiredVersion: '^5.4.0', eager: true },
          '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0', eager: true },
          zustand: { singleton: true, requiredVersion: '^5.0.0', eager: true },
          '@kb-labs/studio-hooks': { singleton: true, requiredVersion: '^0.1.0', eager: true },
          '@kb-labs/studio-event-bus': { singleton: true, requiredVersion: '^0.1.0', eager: true },
          '@kb-labs/studio-ui-kit': { singleton: true, requiredVersion: '^0.1.0', eager: true },
          '@kb-labs/studio-ui-core': { singleton: true, requiredVersion: '^0.1.0', eager: true },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@kb-labs/studio-ui-core': path.resolve(__dirname, '../../packages/studio-ui-core/src'),
        '@kb-labs/studio-data-client': path.resolve(__dirname, '../../packages/studio-data-client/src'),
      },
    },
    server: {
      port: 3000,
      open: false,
      proxy: {
        // REST API proxy
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
        },
        // Plugin widget bundles — proxy to Gateway which serves from node_modules
        '/plugins': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3000,
    },
  };
});

