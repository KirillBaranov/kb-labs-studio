/**
 * @module @kb-labs/studio-app/components/widgets/utils/ErrorState
 * Universal error state component (Ant Design)
 */

import * as React from 'react';
import { Result, Button } from 'antd';
import type { ErrorEnvelope } from '@kb-labs/api-contracts';

export interface ErrorStateProps {
  error: string | ErrorEnvelope | null;
  retryable?: boolean;
  hint?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, retryable, hint, onRetry }: ErrorStateProps) {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'error' in error && typeof error.error === 'object' && 'message' in error.error
        ? String(error.error.message)
        : 'An error occurred';

  const isRetryable = retryable ?? (error && typeof error === 'object' && 'error' in error && typeof error.error === 'object' && 'ui' in error.error && typeof error.error.ui === 'object' && error.error.ui?.retryable) ?? false;
  const errorHint = hint ?? (error && typeof error === 'object' && 'error' in error && typeof error.error === 'object' && 'ui' in error.error && typeof error.error.ui === 'object' && error.error.ui?.hint) ?? undefined;

  return (
    <Result
      status="error"
      title="Error"
      subTitle={errorMessage}
      extra={
        isRetryable && onRetry ? (
          <Button type="primary" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      {errorHint && <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>{errorHint}</p>}
    </Result>
  );
}

