import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { KBConfigProvider } from '@kb-labs/ui-react';
import { DataSourcesProvider } from './providers/data-sources-provider';
import { AuthProvider } from './providers/auth-provider';
import { router } from './router';
// Ant Design 5.x styles are optional - components use CSS-in-JS
// If needed, uncomment: import 'antd/dist/reset.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <KBConfigProvider defaultTheme="light" storageKey="studio-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <DataSourcesProvider>
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
          </DataSourcesProvider>
        </QueryClientProvider>
      </AuthProvider>
    </KBConfigProvider>
  );
}

