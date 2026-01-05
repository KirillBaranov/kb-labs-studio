/**
 * @module @kb-labs/studio-data-client/sources/http-observability-source
 * HTTP implementation of ObservabilityDataSource
 */

import { HttpClient } from '../client/http-client';
import { KBError } from '../errors/kb-error';
import type { ObservabilityDataSource } from './observability-source';
import type { StateBrokerStats, DevKitHealth, PrometheusMetrics, SystemEvent, LogQuery, LogQueryResponse, LogRecord, LogSummarizeRequest, LogSummarizeResponse } from '../contracts/observability';

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
    const baseUrl = this.client.getBaseUrl() || 'http://localhost:5050';
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

  async queryLogs(filters: LogQuery): Promise<LogQueryResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.level) params.append('level', filters.level);
      if (filters.plugin) params.append('plugin', filters.plugin);
      if (filters.executionId) params.append('executionId', filters.executionId);
      if (filters.tenantId) params.append('tenantId', filters.tenantId);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit !== undefined) params.append('limit', String(filters.limit));
      if (filters.offset !== undefined) params.append('offset', String(filters.offset));

      const queryString = params.toString();
      const url = queryString ? `/logs?${queryString}` : '/logs';

      const response = await this.client.fetch<LogQueryResponse>(url);

      return response;
    } catch (error) {
      throw new KBError(
        'LOGS_QUERY_FAILED',
        'Failed to query logs',
        500,
        error
      );
    }
  }

  subscribeToLogs(
    onLog: (log: LogRecord) => void,
    onError: (error: Error) => void,
    filters?: LogQuery
  ): () => void {
    const baseUrl = this.client.getBaseUrl() || 'http://localhost:5050';

    // Build query string from filters
    const params = new URLSearchParams();
    if (filters?.level) params.append('level', filters.level);
    if (filters?.plugin) params.append('plugin', filters.plugin);
    if (filters?.executionId) params.append('executionId', filters.executionId);
    if (filters?.tenantId) params.append('tenantId', filters.tenantId);

    const queryString = params.toString();
    const url = queryString
      ? `${baseUrl}/logs/stream?${queryString}`
      : `${baseUrl}/logs/stream`;

    const eventSource = new EventSource(url);

    eventSource.addEventListener('log', (e) => {
      try {
        const log = JSON.parse(e.data) as LogRecord;
        onLog(log);
      } catch (err) {
        console.error('Failed to parse log event:', err);
      }
    });

    eventSource.onerror = () => {
      onError(new Error('Connection to log stream failed'));
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  async summarizeLogs(request: LogSummarizeRequest): Promise<LogSummarizeResponse> {
    try {
      const response = await this.client.fetch<LogSummarizeResponse>('/logs/summarize', {
        method: 'POST',
        data: request,
      });

      return response;
    } catch (error) {
      throw new KBError(
        'LOG_SUMMARIZATION_FAILED',
        'Failed to summarize logs',
        500,
        error
      );
    }
  }
}
