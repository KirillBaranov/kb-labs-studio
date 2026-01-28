/**
 * @module @kb-labs/studio-app/modules/workflows/routes
 * Workflows (runs list) module routing configuration
 */

import type { RouteObject } from 'react-router-dom';
import { WorkflowsListPage } from '../pages/workflows-list-page';
import { WorkflowRunPage } from '../pages/workflow-run-page';
import { ErrorBoundary } from '../../../components/error-boundary';

// Route paths
const PATHS = {
  LIST: '/workflows',
  DETAIL: '/workflows/:runId',
} as const;

/**
 * Workflows routes (no navigation - accessed from workflow module)
 */
export const workflowsRoutes: RouteObject[] = [
  {
    path: PATHS.LIST,
    element: <WorkflowsListPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.DETAIL,
    element: <WorkflowRunPage />,
    errorElement: <ErrorBoundary />,
  },
];
