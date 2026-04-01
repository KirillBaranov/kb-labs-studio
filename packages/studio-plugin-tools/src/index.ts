import { federation } from '@module-federation/vite';
import type { PluginOption } from 'vite';

/**
 * Shared dependencies that match the Studio host.
 * These are loaded once by the host — remotes reuse them.
 */
const STUDIO_SHARED_DEPS = {
  react: { singleton: true, requiredVersion: '^18.3.0' },
  'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
  antd: { singleton: true, requiredVersion: '^5.21.0' },
  '@ant-design/icons': { singleton: true, requiredVersion: '^5.4.0' },
  '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
  zustand: { singleton: true, requiredVersion: '^5.0.0' },
  '@kb-labs/studio-hooks': { singleton: true, requiredVersion: '^0.1.0' },
  '@kb-labs/studio-event-bus': { singleton: true, requiredVersion: '^0.1.0' },
  '@kb-labs/studio-ui-kit': { singleton: true, requiredVersion: '^0.1.0' },
  '@kb-labs/studio-ui-core': { singleton: true, requiredVersion: '^0.1.0' },
} as const;

export interface KbStudioRemoteOptions {
  /** Module Federation remote name (must match manifest remoteName) */
  name: string;
  /** Exposed modules: { './PageName': './src/pages/PageName.tsx' } */
  exposes: Record<string, string>;
  /** Override or extend shared deps */
  shared?: Record<string, { singleton?: boolean; requiredVersion?: string }>;
  /** Remote entry filename (default: 'remoteEntry.js') */
  filename?: string;
}

/**
 * Vite plugin that configures a plugin as a Module Federation remote
 * compatible with the Studio host.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { kbStudioRemote } from '@kb-labs/studio-plugin-tools';
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     kbStudioRemote({
 *       name: 'commitPlugin',
 *       exposes: {
 *         './CommitOverview': './src/pages/CommitOverview.tsx',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export function kbStudioRemote(options: KbStudioRemoteOptions): PluginOption {
  return federation({
    name: options.name,
    filename: options.filename ?? 'remoteEntry.js',
    exposes: options.exposes,
    shared: {
      ...STUDIO_SHARED_DEPS,
      ...options.shared,
    },
  });
}
