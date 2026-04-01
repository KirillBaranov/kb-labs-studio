import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { KBConfigProvider } from '@/components/ui/kb-config-provider';
import { DataSourcesProvider } from './providers/data-sources-provider';
import { AuthProvider } from './providers/auth-provider';
import { RegistryV2Provider } from './providers/registry-v2-provider';
import { SettingsProvider } from './providers/settings-provider';
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
    <KBConfigProvider defaultTheme="light" storageKey="studio-ui-theme">
      <SettingsProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <DataSourcesProvider>
              <RegistryV2Provider apiBaseUrl={import.meta.env.VITE_API_BASE_URL || '/api/v1'}>
                <RouterProvider router={router} />
                <ReactQueryDevtools initialIsOpen={false} />
              </RegistryV2Provider>
            </DataSourcesProvider>
          </QueryClientProvider>
        </AuthProvider>
      </SettingsProvider>
    </KBConfigProvider>
  );
}
