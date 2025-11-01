import { KBBadge } from '@kb-labs/ui-react';

export function RunBadge({ status }: { status: 'pending' | 'ok' | 'warn' | 'fail' }) {
  const variantMap = {
    ok: 'success' as const,
    warn: 'warning' as const,
    fail: 'error' as const,
    pending: 'info' as const,
  };

  return <KBBadge variant={variantMap[status]}>{status.toUpperCase()}</KBBadge>;
}

