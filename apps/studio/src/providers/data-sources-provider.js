import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { createDataSources } from '@kb-labs/data-client';
import { studioConfig } from '@/config/studio.config';
const DataSourcesContext = createContext(null);
export function DataSourcesProvider({ children }) {
    const sources = createDataSources({
        mode: studioConfig.dataSourceMode,
        baseUrl: studioConfig.apiBaseUrl,
    });
    return _jsx(DataSourcesContext.Provider, { value: sources, children: children });
}
export function useDataSources() {
    const context = useContext(DataSourcesContext);
    if (!context) {
        throw new Error('useDataSources must be used within DataSourcesProvider');
    }
    return context;
}
//# sourceMappingURL=data-sources-provider.js.map