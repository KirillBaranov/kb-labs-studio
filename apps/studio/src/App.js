import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@kb-labs/ui-react';
import { DataSourcesProvider } from './providers/data-sources-provider';
import { AuthProvider } from './providers/auth-provider';
import { router } from './router';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000,
            refetchOnWindowFocus: false,
        },
    },
});
export function App() {
    return (_jsx(ThemeProvider, { defaultTheme: "light", storageKey: "studio-ui-theme", children: _jsx(AuthProvider, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsxs(DataSourcesProvider, { children: [_jsx(RouterProvider, { router: router }), _jsx(ReactQueryDevtools, { initialIsOpen: false })] }) }) }) }));
}
//# sourceMappingURL=App.js.map