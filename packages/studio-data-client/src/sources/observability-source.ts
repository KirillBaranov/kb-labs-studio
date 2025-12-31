import type { StateBrokerStats, DevKitHealth } from '../contracts/observability';

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
}
