export const studioConfig = {
  dataSourceMode: (import.meta.env.VITE_DATA_SOURCE_MODE || 'mock') as 'mock' | 'http',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  features: {
    enableDevlink: false,
    enableMind: false,
    enableAnalytics: false,
  },
} as const;

