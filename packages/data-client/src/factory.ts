import type { AuditDataSource } from './sources/audit-source';
import type { ReleaseDataSource } from './sources/release-source';
import type { SystemDataSource } from './sources/system-source';
import { MockAuditSource } from './mocks/mock-audit-source';
import { MockReleaseSource } from './mocks/mock-release-source';
import { MockSystemSource } from './mocks/mock-system-source';
import { HttpAuditSource } from './sources/http-audit-source';
import { HttpReleaseSource } from './sources/http-release-source';
import { HttpSystemSource } from './sources/http-system-source';
import { HttpClient } from './client/http-client';

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

  // HTTP mode: create HTTP client and sources
  const baseUrl = config.baseUrl || '';
  const client = new HttpClient(baseUrl);

  return {
    audit: new HttpAuditSource(client),
    release: new HttpReleaseSource(client),
    system: new HttpSystemSource(client),
  };
}

