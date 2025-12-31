/**
 * @module @kb-labs/studio-data-client/sources/http-observability-source
 * HTTP implementation of ObservabilityDataSource
 */

import { HttpClient } from '../client/http-client';
import { KBError } from '../errors/kb-error';
import type { ObservabilityDataSource } from './observability-source';
import type { StateBrokerStats, DevKitHealth, PrometheusMetrics, SystemEvent } from '../contracts/observability';

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

  async getPrometheusMetrics(): Promise<PrometheusMetrics> {
    try {
      const response = await this.client.fetch<PrometheusMetrics>(
        '/metrics/json'
      );

      return response;
    } catch (error) {
      throw new KBError(
        'PROMETHEUS_METRICS_FETCH_FAILED',
        'Failed to fetch Prometheus metrics',
        500,
        error
      );
    }
  }

  subscribeToSystemEvents(
    onEvent: (event: SystemEvent) => void,
    onError: (error: Error) => void
  ): () => void {
    const baseUrl = this.client['baseUrl'] || 'http://localhost:5050';
    const eventSource = new EventSource(`${baseUrl}/events/registry`);

    eventSource.addEventListener('registry', (e) => {
      try {
        const event = JSON.parse(e.data) as SystemEvent;
        onEvent(event);
      } catch (err) {
        console.error('Failed to parse registry event:', err);
      }
    });

    eventSource.addEventListener('health', (e) => {
      try {
        const event = JSON.parse(e.data) as SystemEvent;
        onEvent(event);
      } catch (err) {
        console.error('Failed to parse health event:', err);
      }
    });

    eventSource.onerror = () => {
      onError(new Error('Connection to event stream failed'));
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }
}
