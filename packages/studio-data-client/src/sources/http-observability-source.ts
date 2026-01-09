/**
 * @module @kb-labs/studio-data-client/sources/http-observability-source
 * HTTP implementation of ObservabilityDataSource
 */

import { HttpClient } from '../client/http-client';
import { KBError } from '../errors/kb-error';
import type { ObservabilityDataSource } from './observability-source';
import type {
  StateBrokerStats,
  DevKitHealth,
  PrometheusMetrics,
  SystemEvent,
  LogQuery,
  LogQueryResponse,
  LogRecord,
  LogSummarizeRequest,
  LogSummarizeResponse,
  HistoricalDataPoint,
  HeatmapCell,
  MetricsHistoryQuery,
  MetricsHeatmapQuery,
  Incident,
  IncidentQuery,
  IncidentCreatePayload,
} from '../contracts/observability';

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

  async getMetricsHistory(query: MetricsHistoryQuery): Promise<HistoricalDataPoint[]> {
    try {
      const params = new URLSearchParams();
      params.append('metric', query.metric);
      params.append('range', query.range);
      if (query.interval) params.append('interval', query.interval);

      // HttpClient auto-unwraps { ok, data } envelope in response interceptor
      const data = await this.client.fetch<HistoricalDataPoint[]>(
        `/observability/metrics/history?${params.toString()}`
      );

      return data;
    } catch (error) {
      throw new KBError(
        'METRICS_HISTORY_FETCH_FAILED',
        'Failed to fetch metrics history',
        500,
        error
      );
    }
  }

  async getMetricsHeatmap(query: MetricsHeatmapQuery): Promise<HeatmapCell[]> {
    try {
      const params = new URLSearchParams();
      params.append('metric', query.metric);
      if (query.days) params.append('days', String(query.days));

      // HttpClient auto-unwraps { ok, data } envelope in response interceptor
      const data = await this.client.fetch<HeatmapCell[]>(
        `/observability/metrics/heatmap?${params.toString()}`
      );

      return data;
    } catch (error) {
      throw new KBError(
        'METRICS_HEATMAP_FETCH_FAILED',
        'Failed to fetch metrics heatmap',
        500,
        error
      );
    }
  }

  async queryIncidents(query?: IncidentQuery): Promise<Incident[]> {
    try {
      const params = new URLSearchParams();
      if (query?.limit) params.append('limit', String(query.limit));
      if (query?.severity) {
        const severityList = Array.isArray(query.severity) ? query.severity : [query.severity];
        params.append('severity', severityList.join(','));
      }
      if (query?.type) {
        const typeList = Array.isArray(query.type) ? query.type : [query.type];
        params.append('type', typeList.join(','));
      }
      if (query?.from) params.append('from', String(query.from));
      if (query?.to) params.append('to', String(query.to));
      if (query?.includeResolved !== undefined) {
        params.append('includeResolved', String(query.includeResolved));
      }

      const queryString = params.toString();
      const url = queryString ? `/observability/incidents/history?${queryString}` : '/observability/incidents/history';

      // HttpClient auto-unwraps { ok, data } envelope in response interceptor
      const data = await this.client.fetch<Incident[]>(url);

      return data;
    } catch (error) {
      throw new KBError(
        'INCIDENTS_QUERY_FAILED',
        'Failed to query incidents',
        500,
        error
      );
    }
  }

  async createIncident(payload: IncidentCreatePayload): Promise<Incident> {
    try {
      // HttpClient auto-unwraps { ok, data } envelope in response interceptor
      const data = await this.client.fetch<Incident>(
        '/observability/incidents',
        {
          method: 'POST',
          data: payload,
        }
      );

      return data;
    } catch (error) {
      throw new KBError(
        'INCIDENT_CREATE_FAILED',
        'Failed to create incident',
        500,
        error
      );
    }
  }

  async resolveIncident(id: string, resolutionNotes?: string): Promise<Incident> {
    try {
      // HttpClient auto-unwraps { ok, data } envelope in response interceptor
      const data = await this.client.fetch<Incident>(
        `/observability/incidents/${id}/resolve`,
        {
          method: 'POST',
          data: { resolutionNotes },
        }
      );

      return data;
    } catch (error) {
      throw new KBError(
        'INCIDENT_RESOLVE_FAILED',
        'Failed to resolve incident',
        500,
        error
      );
    }
  }

  async chatWithInsights(
    question: string,
    context?: {
      includeMetrics?: boolean;
      includeIncidents?: boolean;
      includeHistory?: boolean;
      timeRange?: '1h' | '6h' | '24h' | '7d';
      plugins?: string[];
    }
  ): Promise<{
    answer: string;
    context: string[];
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    try {
      const response = await this.client.fetch<{
        answer: string;
        context: string[];
        usage: {
          promptTokens: number;
          completionTokens: number;
          totalTokens: number;
        };
      }>('/observability/insights/chat', {
        method: 'POST',
        data: { question, context },
      });

      return response;
    } catch (error) {
      throw new KBError(
        'INSIGHTS_CHAT_FAILED',
        'Failed to chat with AI insights',
        500,
        error
      );
    }
  }
}
