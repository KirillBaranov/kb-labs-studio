import type { HealthStatus } from '../contracts/system';
import type {
  ReadyResponse,
  NotReadyResponse,
  SystemInfoPayload,
  SystemCapabilitiesPayload,
  SystemConfigPayload,
} from '@kb-labs/rest-api-contracts';

export interface SystemDataSource {
  getHealth(): Promise<HealthStatus>;
  getReady?(): Promise<ReadyResponse | NotReadyResponse>;
  getInfo?(): Promise<SystemInfoPayload>;
  getCapabilities?(): Promise<SystemCapabilitiesPayload>;
  getConfig?(): Promise<SystemConfigPayload>;
}

