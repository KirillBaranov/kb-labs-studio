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
 *
 * 🎯 TYPE SAFETY: Configuration is now validated at runtime with Zod
 */
import { validateStudioConfig } from './studio.config.schema';

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function parseHeaderPrefixes(value: string | undefined, fallback: string[]): string[] {
  if (!value) {
    return fallback;
  }
  return value
    .split(',')
    .map(prefix => prefix.trim().toLowerCase())
    .filter(prefix => prefix.length > 0);
}

function resolveUrl(base: string, path: string): string {
  if (!path) {
    return base;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (path.startsWith('/')) {
    return `${base.replace(/\/$/, '')}${path}`;
  }
  return `${base.replace(/\/$/, '')}/${path}`;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const eventsBaseUrlEnv = import.meta.env.VITE_EVENTS_BASE_URL || apiBaseUrl;
const registryEventsPath = import.meta.env.VITE_EVENTS_REGISTRY_PATH || '/events/registry';
const eventsAuthTokenEnv = import.meta.env.VITE_EVENTS_AUTH_TOKEN;
const eventsHeadersEnv = import.meta.env.VITE_EVENTS_HEADERS;

function parseHeaders(value: string | undefined): Record<string, string> | undefined {
  if (!value) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).map(([key, val]) => [String(key), String(val)])
      );
    }
  } catch {
    // fall through
  }
  return undefined;
}

// Raw configuration object (before validation)
const rawConfig = {
  dataSourceMode: (import.meta.env.VITE_DATA_SOURCE_MODE || 'http') as 'mock' | 'http',
  apiBaseUrl,
  features: {
    enableDevlink: false,
    enableMind: false,
    enableAnalytics: false,
    sse: true,
    analytics: true,
  },
  headers: {
    allowedPrefixes: parseHeaderPrefixes(import.meta.env.VITE_FORWARD_HEADER_PREFIXES, ['x-']),
    allowAuthorization: parseBooleanEnv(import.meta.env.VITE_FORWARD_AUTH_HEADER, false),
  },
  headerNotices: {
    enabled: parseBooleanEnv(import.meta.env.VITE_STUDIO_HEADERS_NOTICE ?? undefined, true),
    defaultExpanded: parseBooleanEnv(import.meta.env.VITE_STUDIO_HEADERS_NOTICE_EXPANDED ?? undefined, false),
    showProvided: parseBooleanEnv(import.meta.env.VITE_STUDIO_HEADERS_NOTICE_SHOW_PROVIDED ?? undefined, true),
    collapsible: parseBooleanEnv(import.meta.env.VITE_STUDIO_HEADERS_NOTICE_COLLAPSIBLE ?? undefined, true),
  },
  events: {
    baseUrl: eventsBaseUrlEnv,
    registryPath: registryEventsPath,
    registryUrl: resolveUrl(eventsBaseUrlEnv, registryEventsPath),
    retryDelays: [250, 1_000, 2_000, 5_000],
    token: eventsAuthTokenEnv,
    headers: parseHeaders(eventsHeadersEnv),
  },
};

/**
 * Validated studio configuration
 * This will throw ZodError with clear error messages if config is malformed
 */
export const studioConfig = validateStudioConfig(rawConfig);
