import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@kb-labs/ui-react';
import { DataSourcesProvider } from './providers/data-sources-provider';
import { AuthProvider } from './providers/auth-provider';
import { StudioNav } from './components/studio-nav';
import { HealthBanner } from './components/health-banner';
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
  return (
    <ThemeProvider defaultTheme="light" storageKey="studio-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <DataSourcesProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <StudioNav />
              <HealthBanner />
              <div className="container mx-auto py-8">
                <RouterProvider router={router} />
              </div>
            </div>
          </DataSourcesProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

