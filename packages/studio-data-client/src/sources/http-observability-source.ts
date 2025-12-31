/**
 * @module @kb-labs/studio-data-client/sources/http-observability-source
 * HTTP implementation of ObservabilityDataSource
 */

import { HttpClient } from '../client/http-client';
import { KBError } from '../errors/kb-error';
import type { ObservabilityDataSource } from './observability-source';
import type { StateBrokerStats, DevKitHealth } from '../contracts/observability';

/**
 * HTTP implementation of ObservabilityDataSource
 */
export class HttpObservabilitySource implements ObservabilityDataSource {
  constructor(private client: HttpClient) {}

  async getStateBrokerStats(): Promise<StateBrokerStats> {
    try {
      const response = await this.client.fetch<StateBrokerStats>(
        '/observability/state-broker'
      );

      return response;
    } catch (error) {
      throw new KBError(
        'STATE_BROKER_FETCH_FAILED',
        'Failed to fetch State Broker stats',
        500,
        error
      );
    }
  }

  async getDevKitHealth(): Promise<DevKitHealth> {
    try {
      const response = await this.client.fetch<DevKitHealth>(
        '/observability/devkit'
      );

      return response;
    } catch (error) {
      throw new KBError(
        'DEVKIT_FETCH_FAILED',
        'Failed to fetch DevKit health',
        500,
        error
      );
    }
  }
}
