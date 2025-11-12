import { KBBadge } from '@kb-labs/ui-react'
import type { WorkflowRun, JobRun } from '@kb-labs/data-client'

type WorkflowLikeStatus = WorkflowRun['status'] | JobRun['status']

const STATUS_VARIANTS: Record<WorkflowLikeStatus, 'info' | 'success' | 'warning' | 'error'> = {
  queued: 'info',
  running: 'warning',
  success: 'success',
  failed: 'error',
  cancelled: 'warning',
  skipped: 'info',
}

export function WorkflowStatusBadge({ status }: { status: WorkflowLikeStatus }) {
  const variant = STATUS_VARIANTS[status] ?? 'info'
  return <KBBadge variant={variant}>{status.toUpperCase()}</KBBadge>
}
