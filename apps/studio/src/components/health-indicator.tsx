import { KBBadge } from '@kb-labs/studio-ui-react';

export function HealthIndicator({ status }: { status: 'ok' | 'degraded' | 'down' }) {
  const variantMap = {
    ok: 'success' as const,
    degraded: 'warning' as const,
    down: 'error' as const,
  };

  return <KBBadge variant={variantMap[status]}>{status.toUpperCase()}</KBBadge>;
}

