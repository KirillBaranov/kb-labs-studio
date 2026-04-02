/**
 * @module @kb-labs/studio-app/modules/workflows/routes
 * Workflows module routing configuration
 */

import type { RouteObject } from 'react-router-dom';
import { WorkflowsDashboardPage } from '../pages/workflows-dashboard-page';
import { WorkflowsRunsPage } from '../pages/workflows-runs-page';
import { WorkflowRunPage } from '../pages/workflow-run-page';
import { WorkflowsDefinitionsPage } from '../pages/workflows-definitions-page';
import { WorkflowDefinitionPage } from '../pages/workflow-definition-page';
import { WorkflowsJobsPage } from '../pages/workflows-jobs-page';
import { WorkflowsCronsPage } from '../pages/workflows-crons-page';
import { ErrorBoundary } from '../../../components/error-boundary';
import { renderIcon } from '../../../routes/helpers';
import type { NavigationItem } from '@/components/ui';

// Route paths
const PATHS = {
  DASHBOARD: '/workflows',
  RUNS: '/workflows/runs',
  RUN_DETAIL: '/workflows/runs/:runId',
  DEFINITIONS: '/workflows/definitions',
  DEFINITION_DETAIL: '/workflows/definitions/:workflowId',
  JOBS: '/workflows/jobs',
  CRONS: '/workflows/crons',
} as const;

// Route keys
const KEYS = {
  MODULE: 'workflows',
  DASHBOARD: 'workflows-dashboard',
  RUNS: 'workflows-runs',
  DEFINITIONS: 'workflows-definitions',
  JOBS: 'workflows-jobs',
  CRONS: 'workflows-crons',
} as const;

/**
 * Workflows routes
 */
export const workflowsRoutes: RouteObject[] = [
  {
    path: PATHS.DASHBOARD,
    element: <WorkflowsDashboardPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.RUNS,
    element: <WorkflowsRunsPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.RUN_DETAIL,
    element: <WorkflowRunPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.DEFINITIONS,
    element: <WorkflowsDefinitionsPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.DEFINITION_DETAIL,
    element: <WorkflowDefinitionPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.JOBS,
    element: <WorkflowsJobsPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.CRONS,
    element: <WorkflowsCronsPage />,
    errorElement: <ErrorBoundary />,
  },
];

/**
 * Workflows navigation item for sidebar
 */
export const workflowsNavigation: NavigationItem = {
  key: KEYS.MODULE,
  label: 'Workflows',
  icon: renderIcon('ThunderboltOutlined'),
  path: PATHS.DASHBOARD,
  children: [
    {
      key: KEYS.DASHBOARD,
      label: 'Dashboard',
      path: PATHS.DASHBOARD,
      icon: renderIcon('DashboardOutlined'),
    },
    {
      key: KEYS.RUNS,
      label: 'Runs',
      path: PATHS.RUNS,
      icon: renderIcon('PlayCircleOutlined'),
    },
    {
      key: KEYS.DEFINITIONS,
      label: 'Definitions',
      path: PATHS.DEFINITIONS,
      icon: renderIcon('AppstoreOutlined'),
    },
    {
      key: KEYS.JOBS,
      label: 'Jobs',
      path: PATHS.JOBS,
      icon: renderIcon('UnorderedListOutlined'),
    },
    {
      key: KEYS.CRONS,
      label: 'Crons',
      path: PATHS.CRONS,
      icon: renderIcon('ClockCircleOutlined'),
    },
  ],
};
