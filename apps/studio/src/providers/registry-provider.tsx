/**
 * @module @kb-labs/studio-app/providers/registry-provider
 * Registry provider for Studio widgets
 */

import * as React from 'react';
import type { StudioRegistry } from '@kb-labs/plugin-adapter-studio';
import { loadRegistry } from '../plugins/registry.js';

interface RegistryContextValue {
  registry: StudioRegistry;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const RegistryContext = React.createContext<RegistryContextValue | null>(null);

/**
 * Registry provider
 */
export function RegistryProvider({
  children,
  apiBaseUrl = '/v1',
}: {
  children: React.ReactNode;
  apiBaseUrl?: string;
}): React.ReactElement {
  const [registry, setRegistry] = React.useState<StudioRegistry>({
    registryVersion: '1',
    generatedAt: new Date().toISOString(),
    plugins: [],
    widgets: [],
    menus: [],
    layouts: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadRegistry(apiBaseUrl);
      setRegistry(loaded);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const value: RegistryContextValue = {
    registry,
    loading,
    error,
    refresh,
  };

  return (
    <RegistryContext.Provider value={value}>
      {children}
    </RegistryContext.Provider>
  );
}

/**
 * Hook to use registry
 */
export function useRegistry(): RegistryContextValue {
  const context = React.useContext(RegistryContext);
  if (!context) {
    throw new Error('useRegistry must be used within RegistryProvider');
  }
  return context;
}

