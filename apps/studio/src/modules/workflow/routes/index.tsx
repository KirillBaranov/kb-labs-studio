/**
 * @module @kb-labs/studio-app/modules/workflow/routes
 * Workflow module routing configuration
 */

import type { RouteObject } from 'react-router-dom';
import type { NavigationItem } from '@kb-labs/studio-ui-react';
import { WorkflowPage } from '../pages/workflow-page';
import { ErrorBoundary } from '../../../components/error-boundary';
import { renderIcon } from '../../../routes/helpers';

// Route paths
const PATHS = {
  ROOT: '/workflow',
  TAB: '/workflow/:tab',
} as const;

// Route keys
const KEYS = {
  MODULE: 'workflow',
} as const;

/**
 * Workflow routes
 */
export const workflowRoutes: RouteObject[] = [
  {
    path: PATHS.ROOT,
    element: <WorkflowPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.TAB,
    element: <WorkflowPage />,
    errorElement: <ErrorBoundary />,
  },
];

/**
 * Workflow navigation item for sidebar
 */
export const workflowNavigation: NavigationItem = {
  key: KEYS.MODULE,
  label: 'Workflow',
  icon: renderIcon('ThunderboltOutlined'),
  path: PATHS.ROOT,
};
