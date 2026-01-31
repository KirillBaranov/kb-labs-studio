/**
 * @module @kb-labs/studio-app/modules/agents/routes
 * Agent module routing configuration
 */

import type { RouteObject } from 'react-router-dom';
import type { NavigationItem } from '@kb-labs/studio-ui-react';
import { AgentsPage } from '../pages/agents-page';
import { ErrorBoundary } from '../../../components/error-boundary';
import { renderIcon } from '../../../routes/helpers';

// Route paths
const PATHS = {
  ROOT: '/agents',
} as const;

// Route keys
const KEYS = {
  MODULE: 'agents',
} as const;

/**
 * Agents routes
 */
export const agentsRoutes: RouteObject[] = [
  {
    path: PATHS.ROOT,
    element: <AgentsPage />,
    errorElement: <ErrorBoundary />,
  },
];

/**
 * Agents navigation item for sidebar
 */
export const agentsNavigation: NavigationItem = {
  key: KEYS.MODULE,
  label: 'Agents',
  icon: renderIcon('RobotOutlined'),
  path: PATHS.ROOT,
};
