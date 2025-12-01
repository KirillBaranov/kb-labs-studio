import { createContext, useContext, type ReactNode } from 'react';
import { createDataSources, type DataSources } from '@kb-labs/studio-data-client';
import { studioConfig } from '@/config/studio.config';

const DataSourcesContext = createContext<DataSources | null>(null);

export function DataSourcesProvider({ children }: { children: ReactNode }) {
  const sources = createDataSources({
    mode: studioConfig.dataSourceMode,
    baseUrl: studioConfig.apiBaseUrl,
  });

  return <DataSourcesContext.Provider value={sources}>{children}</DataSourcesContext.Provider>;
}

export function useDataSources() {
  const context = useContext(DataSourcesContext);
  if (!context) {
    throw new Error('useDataSources must be used within DataSourcesProvider');
  }
  return context;
}

