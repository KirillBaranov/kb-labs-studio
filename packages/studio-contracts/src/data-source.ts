/**
 * @module @kb-labs/studio-contracts/data-source
 * Data source definitions for widget data fetching.
 */

/**
 * Static data embedded in manifest.
 * Used for composite widgets or widgets with constant data.
 */
export interface StaticDataSource {
  type: 'static';
  /** Static value, undefined for composite widgets */
  value?: unknown;
}

/**
 * REST API data source.
 * Widget fetches data from a registered REST route.
 */
export interface RestDataSource {
  type: 'rest';
  /** Route ID from plugin manifest (e.g., 'release/plan/latest') */
  routeId: string;
  /** HTTP method (default: GET) */
  method?: 'GET' | 'POST';
  /** Request body for POST (optional) */
  body?: Record<string, unknown>;
  /** Query parameters (e.g., { workspace: 'my-pkg' }) */
  params?: Record<string, string | number | boolean>;
}

/**
 * Mock data source for development/testing.
 */
export interface MockDataSource {
  type: 'mock';
  /** Fixture ID (e.g., 'dashboard/metrics') */
  fixtureId: string;
}

/**
 * Union of all data source types.
 */
export type DataSource = StaticDataSource | RestDataSource | MockDataSource;

/**
 * Type guard for static data source.
 */
export function isStaticDataSource(source: DataSource): source is StaticDataSource {
  return source.type === 'static';
}

/**
 * Type guard for REST data source.
 */
export function isRestDataSource(source: DataSource): source is RestDataSource {
  return source.type === 'rest';
}

/**
 * Type guard for mock data source.
 */
export function isMockDataSource(source: DataSource): source is MockDataSource {
  return source.type === 'mock';
}
