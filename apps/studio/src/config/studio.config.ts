/**
 * Studio configuration
 * 
 * Configuration can be set via environment variables:
 * - VITE_API_BASE_URL: Backend API base URL
 *   - Use '/api' to use Vite proxy (default, requires VITE_API_PROXY_TARGET)
 *   - Use full URL like 'http://localhost:5173/api/v1' for direct connection
 * - VITE_DATA_SOURCE_MODE: 'mock' | 'http' (default: 'http')
 * - VITE_API_PROXY_TARGET: Target URL for Vite proxy (default: 'http://localhost:5050')
 * 
 * Environment files (in order of precedence):
 * - .env.local (highest priority, git-ignored)
 * - .env.development / .env.production
 * - .env (lowest priority)
 */
export const studioConfig = {
  dataSourceMode: (import.meta.env.VITE_DATA_SOURCE_MODE || 'http') as 'mock' | 'http',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  features: {
    enableDevlink: false,
    enableMind: false,
    enableAnalytics: false,
    sse: true, // Enable SSE for job events
    analytics: true,
  },
} as const;

