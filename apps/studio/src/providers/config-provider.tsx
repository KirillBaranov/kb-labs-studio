/**
 * @module @kb-labs/studio-app/providers/config-provider
 * React Context provider for Studio configuration
 *
 * This replaces the previous global window pollution pattern
 * with a proper React Context that provides type-safe config access.
 */

import * as React from 'react';
import { studioConfig } from '../config/studio.config';
import type { StudioConfig } from '../config/studio.config.schema';

/**
 * Config context
 */
const ConfigContext = React.createContext<StudioConfig | null>(null);

/**
 * Config provider props
 */
export interface ConfigProviderProps {
  children: React.ReactNode;
  /** Optional override config for testing */
  config?: StudioConfig;
}

/**
 * Config provider component
 *
 * @example
 * ```tsx
 * <ConfigProvider>
 *   <App />
 * </ConfigProvider>
 * ```
 */
export function ConfigProvider({ children, config = studioConfig }: ConfigProviderProps): React.ReactElement {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

/**
 * Hook to access studio configuration
 *
 * @throws {Error} If used outside ConfigProvider
 * @returns Validated studio configuration
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { apiBaseUrl, dataSourceMode } = useStudioConfig();
 *
 *   return <div>API: {apiBaseUrl}</div>;
 * }
 * ```
 */
export function useStudioConfig(): StudioConfig {
  const context = React.useContext(ConfigContext);

  if (!context) {
    throw new Error('useStudioConfig must be used within ConfigProvider');
  }

  return context;
}

/**
 * Hook to access a specific config value
 *
 * @param key - Config key to access
 * @returns Config value for the specified key
 *
 * @example
 * ```tsx
 * function ApiUrl() {
 *   const apiBaseUrl = useConfigValue('apiBaseUrl');
 *   return <span>{apiBaseUrl}</span>;
 * }
 * ```
 */
export function useConfigValue<K extends keyof StudioConfig>(key: K): StudioConfig[K] {
  const config = useStudioConfig();
  return config[key];
}
