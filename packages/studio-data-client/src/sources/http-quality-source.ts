/**
 * HttpQualitySource - HTTP implementation of QualityDataSource
 * Makes REST API calls to quality plugin endpoints
 */

import type { HttpClient } from '../client/http-client.js';
import type { QualityDataSource } from './quality-source.js';
import {
  QUALITY_ROUTES,
  type StatsResponse,
  type HealthResponse,
  type DependenciesResponse,
  type BuildOrderResponse,
  type CyclesResponse,
  type GraphResponse,
  type GraphMode,
  type StaleResponse,
} from '@kb-labs/quality-contracts';

export class HttpQualitySource implements QualityDataSource {
  // Note: Studio HTTP client uses /api/v1 prefix, plugin basePath is /v1/plugins/quality
  // So we use /plugins/quality here to match commit-plugin pattern
  private readonly basePath = '/plugins/quality';

  constructor(private client: HttpClient) {}

  async getStats(includeHealth?: boolean): Promise<StatsResponse> {
    const params = new URLSearchParams();
    if (includeHealth !== undefined) {
      params.set('includeHealth', String(includeHealth));
    }
    const query = params.toString();

    return this.client.fetch<StatsResponse>(
      `${this.basePath}${QUALITY_ROUTES.STATS}${query ? `?${query}` : ''}`
    );
  }

  async getHealth(detailed?: boolean): Promise<HealthResponse> {
    const params = new URLSearchParams();
    if (detailed !== undefined) {
      params.set('detailed', String(detailed));
    }
    const query = params.toString();

    return this.client.fetch<HealthResponse>(
      `${this.basePath}${QUALITY_ROUTES.HEALTH}${query ? `?${query}` : ''}`
    );
  }

  async getDependencies(): Promise<DependenciesResponse> {
    return this.client.fetch<DependenciesResponse>(
      `${this.basePath}${QUALITY_ROUTES.DEPENDENCIES}`
    );
  }

  async getBuildOrder(packageName?: string): Promise<BuildOrderResponse> {
    const params = new URLSearchParams();
    if (packageName) {
      params.set('packageName', packageName);
    }
    const query = params.toString();

    return this.client.fetch<BuildOrderResponse>(
      `${this.basePath}${QUALITY_ROUTES.BUILD_ORDER}${query ? `?${query}` : ''}`
    );
  }

  async getCycles(): Promise<CyclesResponse> {
    return this.client.fetch<CyclesResponse>(
      `${this.basePath}${QUALITY_ROUTES.CYCLES}`
    );
  }

  async getGraph(mode: GraphMode, packageName?: string): Promise<GraphResponse> {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (packageName) {
      params.set('packageName', packageName);
    }
    const query = params.toString();

    return this.client.fetch<GraphResponse>(
      `${this.basePath}${QUALITY_ROUTES.GRAPH}${query ? `?${query}` : ''}`
    );
  }

  async getStale(detailed?: boolean): Promise<StaleResponse> {
    const params = new URLSearchParams();
    if (detailed !== undefined) {
      params.set('detailed', String(detailed));
    }
    const query = params.toString();

    return this.client.fetch<StaleResponse>(
      `${this.basePath}${QUALITY_ROUTES.STALE}${query ? `?${query}` : ''}`
    );
  }
}
