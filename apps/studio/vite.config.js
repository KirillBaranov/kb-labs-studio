import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@kb-labs/ui-core': path.resolve(__dirname, '../../packages/ui-core/src'),
            '@kb-labs/ui-react': path.resolve(__dirname, '../../packages/ui-react/src'),
            '@kb-labs/data-client': path.resolve(__dirname, '../../packages/data-client/src'),
        },
    },
    server: {
        port: 3000,
        open: false,
    },
    preview: {
        port: 3000,
    },
});
//# sourceMappingURL=vite.config.js.map