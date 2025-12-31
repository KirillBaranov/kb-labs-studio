import type { StateBrokerStats, DevKitHealth, PrometheusMetrics, SystemEvent } from '../contracts/observability';

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
}
