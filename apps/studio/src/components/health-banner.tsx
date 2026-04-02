import { useDataSources } from '../providers/data-sources-provider';
import { useHealthStatus, useReadyStatus } from '@kb-labs/studio-data-client';
import { studioConfig } from '@/config/studio.config';
import { UIAlert } from '@kb-labs/studio-ui-kit';
import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRegistryV2 } from '../providers/registry-v2-provider';
import type { HealthStatus } from '@kb-labs/studio-data-client';

/**
 * Health banner component showing REST API status with fallback to mock mode
 */
export function HealthBanner() {
  const sources = useDataSources();
  const _registry = useRegistryV2();
  const sseHealth = null as { status: string; ts?: string; ready: boolean; reason?: string } | null; // TODO: health via separate endpoint
  const { data: healthRaw, error, refetch } = useHealthStatus(sources.system);
  const { data: ready } = useReadyStatus(sources.system);
  const [showDetails, setShowDetails] = useState(false);
  const lastRefetchedTs = useRef<string | null>(null);

  useEffect(() => {
    if (!sseHealth) {
      return;
    }
    const shouldRefetch = (!sseHealth.ready || sseHealth.status === 'degraded')
      && sseHealth.ts
      && sseHealth.ts !== lastRefetchedTs.current;
    if (shouldRefetch) {
      lastRefetchedTs.current = sseHealth.ts ?? null;
      void refetch();
    }
  }, [sseHealth, refetch]);

  const healthSnapshot = (healthRaw as Record<string, unknown> | undefined)?.snapshot as
    | HealthStatus['snapshot']
    | undefined;

  const fallbackStatus =
    healthSnapshot?.status ?? ((healthRaw as { ok?: boolean } | undefined)?.ok ? 'healthy' : 'unknown');
  const healthStatus = sseHealth?.status ?? fallbackStatus;
  const readyStatus = sseHealth?.ready ?? ready?.ready ?? true;
  const readyReason = !readyStatus
    ? sseHealth?.reason ?? ready?.reason
    : undefined;
  const impactedComponents = (healthSnapshot?.checks ?? [])
    .filter((check) => check.status !== 'ok')
    .map((check) => ({
      id: check.id,
      lastError: check.message ?? 'unknown issue',
    }));

  const pluginMetrics = useMemo(() => {
    const meta = healthSnapshot?.meta as Record<string, unknown> | undefined;
    const pluginMounts = meta?.pluginMounts as Record<string, unknown> | undefined;
    const succeeded =
      pluginMounts && typeof pluginMounts === 'object' && typeof pluginMounts.succeeded === 'number'
        ? (pluginMounts.succeeded as number)
        : undefined;
    const failed =
      pluginMounts && typeof pluginMounts === 'object' && typeof pluginMounts.failed === 'number'
        ? (pluginMounts.failed as number)
        : undefined;
    if (succeeded === undefined && failed === undefined) {
      return null;
    }
    return { succeeded: succeeded ?? 0, failed: failed ?? 0 };
  }, [healthSnapshot]);

  const isDegraded =
    (healthStatus === 'degraded' || healthSnapshot?.state === 'partial_observability')
    && readyStatus;
  const isDown = !!error || !readyStatus;
  const isMockMode =
    studioConfig.dataSourceMode === 'mock' ||
    (studioConfig.dataSourceMode === 'http' && !healthSnapshot && error);

  if (!isDegraded && !isDown && !isMockMode) {
    return null;
  }

  const statusMessage = isDown 
    ? 'REST API unavailable' 
    : isDegraded 
    ? 'REST API degraded mode'
    : 'Using mock mode';

  const apiDisplayUrl = studioConfig.apiBaseUrl;

  const statusDescription = isDown
    ? `REST API is not ready at ${apiDisplayUrl}. Reason: ${readyReason ?? 'unknown'}.`
    : isDegraded
    ? `REST API is in degraded mode. Some services may be unavailable.`
    : 'REST API not available. Using mock data for development.';

  return (
    <UIAlert
      message={statusMessage}
      description={
        <div>
          <p>{statusDescription}</p>
          {pluginMetrics && (
            <p style={{ marginTop: 8 }}>
              Plugin mounts: {pluginMetrics.succeeded} ok
              {pluginMetrics.failed ? `, ${pluginMetrics.failed} failed` : ''}
            </p>
          )}
          {isDegraded && impactedComponents.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {showDetails ? 'Hide' : 'Show'} impacted components
              </button>
              {showDetails && (
                <ul style={{ marginTop: 8, marginLeft: 20 }}>
                  {impactedComponents.map(component => (
                  <li key={component.id}>
                      {component.id}: {component.lastError ?? 'unknown issue'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      }
      variant={isDown ? 'error' : isDegraded ? 'warning' : 'info'}
      showIcon
      action={
        <button
          type="button"
          onClick={() => refetch()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
          title="Retry health check"
        >
          <RefreshCw size={16} />
        </button>
      }
      style={{ marginBottom: 16 }}
    />
  );
}
