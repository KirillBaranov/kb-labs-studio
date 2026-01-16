import type { AuditDataSource } from './sources/audit-source';
import type { ReleaseDataSource } from './sources/release-source';
import type { SystemDataSource } from './sources/system-source';
import type { WorkflowDataSource } from './sources/workflow-source';
import type { CacheDataSource } from './sources/cache-source';
import type { MetricsDataSource } from './sources/metrics-source';
import type { ObservabilityDataSource } from './sources/observability-source';
import type { AnalyticsDataSource } from './sources/analytics-source';
import type { AdaptersDataSource } from './sources/adapters-source';
import type { PlatformDataSource } from './sources/platform-source';
import type { PluginsDataSource } from './sources/plugins-source';
import type { AgentDataSource } from './sources/agent-source';
// TODO: TEMPORARY - Remove after commit plugin UI is polished
import type { CommitDataSource } from './sources/commit-source';
import type { QualityDataSource } from './sources/quality-source';
import { MockAuditSource } from './mocks/mock-audit-source';
import { MockReleaseSource } from './mocks/mock-release-source';
import { MockSystemSource } from './mocks/mock-system-source';
import { MockWorkflowSource } from './mocks/mock-workflow-source';
import { MockCacheSource } from './mocks/mock-cache-source';
import { MockMetricsSource } from './mocks/mock-metrics-source';
import { MockObservabilitySource } from './mocks/mock-observability-source';
import { MockAnalyticsSource } from './mocks/mock-analytics-source';
import { MockAdaptersSource } from './mocks/mock-adapters-source';
import { MockPlatformSource } from './mocks/mock-platform-source';
import { MockPluginsSource } from './mocks/mock-plugins-source';
import { MockAgentSource } from './mocks/mock-agent-source';
// TODO: TEMPORARY - Remove after commit plugin UI is polished
import { MockCommitSource } from './mocks/mock-commit-source';
import { MockQualitySource } from './mocks/mock-quality-source';
import { HttpAuditSource } from './sources/http-audit-source';
import { HttpReleaseSource } from './sources/http-release-source';
import { HttpSystemSource } from './sources/http-system-source';
import { HttpWorkflowSource } from './sources/http-workflow-source';
import { HttpCacheSource } from './sources/http-cache-source';
import { HttpMetricsSource } from './sources/http-metrics-source';
import { HttpObservabilitySource } from './sources/http-observability-source';
import { HttpAnalyticsSource } from './sources/http-analytics-source';
import { HttpAdaptersSource } from './sources/http-adapters-source';
import { HttpPlatformSource } from './sources/http-platform-source';
import { HttpPluginsSource } from './sources/http-plugins-source';
import { HttpAgentSource } from './sources/http-agent-source';
// TODO: TEMPORARY - Remove after commit plugin UI is polished
import { HttpCommitSource } from './sources/http-commit-source';
import { HttpQualitySource } from './sources/http-quality-source';
import { HttpClient } from './client/http-client';

export interface DataSourcesConfig {
  mode: 'mock' | 'http';
  baseUrl?: string;
}

export interface DataSources {
  audit: AuditDataSource;
  release: ReleaseDataSource;
  system: SystemDataSource;
  workflow: WorkflowDataSource;
  cache: CacheDataSource;
  metrics: MetricsDataSource;
  observability: ObservabilityDataSource;
  analytics: AnalyticsDataSource;
  adapters: AdaptersDataSource;
  platform: PlatformDataSource;
  plugins: PluginsDataSource;
  agent: AgentDataSource;
  // TODO: TEMPORARY - Remove after commit plugin UI is polished
  commit: CommitDataSource;
  quality: QualityDataSource;
}

export function createDataSources(config: DataSourcesConfig): DataSources {
  if (config.mode === 'mock') {
    return {
      audit: new MockAuditSource(),
      release: new MockReleaseSource(),
      system: new MockSystemSource(),
      workflow: new MockWorkflowSource(),
      cache: new MockCacheSource(),
      metrics: new MockMetricsSource(),
      observability: new MockObservabilitySource(),
      analytics: new MockAnalyticsSource(),
      adapters: new MockAdaptersSource(),
      platform: new MockPlatformSource(),
      plugins: new MockPluginsSource(),
      agent: new MockAgentSource(),
      // TODO: TEMPORARY - Remove after commit plugin UI is polished
      commit: new MockCommitSource(),
      quality: new MockQualitySource(),
    };
  }

  const baseUrl = config.baseUrl || '';
  const client = new HttpClient(baseUrl);

  return {
    audit: new HttpAuditSource(client),
    release: new HttpReleaseSource(client),
    system: new HttpSystemSource(client),
    workflow: new HttpWorkflowSource(client),
    cache: new HttpCacheSource(client),
    metrics: new HttpMetricsSource(client),
    observability: new HttpObservabilitySource(client),
    analytics: new HttpAnalyticsSource(client),
    adapters: new HttpAdaptersSource(client),
    platform: new HttpPlatformSource(client),
    plugins: new HttpPluginsSource(client),
    agent: new HttpAgentSource(client),
    // TODO: TEMPORARY - Remove after commit plugin UI is polished
    commit: new HttpCommitSource(client),
    quality: new HttpQualitySource(client),
  };
}

