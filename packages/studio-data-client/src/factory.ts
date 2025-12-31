import type { AuditDataSource } from './sources/audit-source';
import type { ReleaseDataSource } from './sources/release-source';
import type { SystemDataSource } from './sources/system-source';
import type { WorkflowDataSource } from './sources/workflow-source';
import type { CacheDataSource } from './sources/cache-source';
import type { MetricsDataSource } from './sources/metrics-source';
import type { ObservabilityDataSource } from './sources/observability-source';
import { MockAuditSource } from './mocks/mock-audit-source';
import { MockReleaseSource } from './mocks/mock-release-source';
import { MockSystemSource } from './mocks/mock-system-source';
import { MockWorkflowSource } from './mocks/mock-workflow-source';
import { MockCacheSource } from './mocks/mock-cache-source';
import { MockMetricsSource } from './mocks/mock-metrics-source';
import { MockObservabilitySource } from './mocks/mock-observability-source';
import { HttpAuditSource } from './sources/http-audit-source';
import { HttpReleaseSource } from './sources/http-release-source';
import { HttpSystemSource } from './sources/http-system-source';
import { HttpWorkflowSource } from './sources/http-workflow-source';
import { HttpCacheSource } from './sources/http-cache-source';
import { HttpMetricsSource } from './sources/http-metrics-source';
import { HttpObservabilitySource } from './sources/http-observability-source';
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
  };
}

