/**
 * @module @kb-labs/studio-data-client/sources/http-metrics-source
 * HTTP implementation of MetricsDataSource
 */

import { HttpClient } from '../client/http-client';
import type { MetricsDataSource, MetricsSnapshot } from './metrics-source';

/**
 * HTTP implementation of MetricsDataSource
 */
export class HttpMetricsSource implements MetricsDataSource {
  constructor(private client: HttpClient) {}

  async getMetrics(): Promise<MetricsSnapshot> {
    return this.client.fetch<MetricsSnapshot>('/metrics/json');
  }
}
