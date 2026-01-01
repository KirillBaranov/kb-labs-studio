import type { StateBrokerStats, DevKitHealth, PrometheusMetrics, SystemEvent, LogRecord, LogQuery, LogQueryResponse, LogEvent } from '../contracts/observability';

/**
 * Observability data source interface
 */
export interface ObservabilityDataSource {
  /**
   * Get State Broker statistics
   */
  getStateBrokerStats(): Promise<StateBrokerStats>;

  /**
   * Get DevKit health snapshot
   */
  getDevKitHealth(): Promise<DevKitHealth>;

  /**
   * Get Prometheus metrics from REST API
   */
  getPrometheusMetrics(): Promise<PrometheusMetrics>;

  /**
   * Subscribe to system events SSE stream
   * Returns cleanup function
   */
  subscribeToSystemEvents(onEvent: (event: SystemEvent) => void, onError: (error: Error) => void): () => void;

  /**
   * Query logs with filters
   */
  queryLogs(filters: LogQuery): Promise<LogQueryResponse>;

  /**
   * Subscribe to live log stream
   * Returns cleanup function
   */
  subscribeToLogs(onLog: (log: LogRecord) => void, onError: (error: Error) => void, filters?: LogQuery): () => void;
}
