import type { AuditDataSource } from './sources/audit-source';
import type { ReleaseDataSource } from './sources/release-source';
import type { SystemDataSource } from './sources/system-source';
import { MockAuditSource } from './mocks/mock-audit-source';
import { MockReleaseSource } from './mocks/mock-release-source';
import { MockSystemSource } from './mocks/mock-system-source';

export interface DataSourcesConfig {
  mode: 'mock' | 'http';
  baseUrl?: string;
}

export interface DataSources {
  audit: AuditDataSource;
  release: ReleaseDataSource;
  system: SystemDataSource;
}

export function createDataSources(config: DataSourcesConfig): DataSources {
  if (config.mode === 'mock') {
    return {
      audit: new MockAuditSource(),
      release: new MockReleaseSource(),
      system: new MockSystemSource(),
    };
  }

  // HTTP sources will be implemented later
  throw new Error('HTTP data sources not yet implemented');
}

