/**
 * @module @kb-labs/studio-app/modules/assistant/routes
 * Assistant module routing configuration
 */

import type { RouteObject } from 'react-router-dom';
import type { NavigationItem } from '@kb-labs/studio-ui-react';
import { AssistantPage } from '../pages/assistant-page';
import { ErrorBoundary } from '../../../components/error-boundary';
import { renderIcon } from '../../../routes/helpers';

// Route paths
const PATHS = {
  ROOT: '/assistant',
} as const;

// Route keys
const KEYS = {
  MODULE: 'assistant',
} as const;

/**
 * Assistant routes
 */
export const assistantRoutes: RouteObject[] = [
  {
    path: PATHS.ROOT,
    element: <AssistantPage />,
    errorElement: <ErrorBoundary />,
  },
];

/**
 * Assistant navigation item for sidebar
 */
export const assistantNavigation: NavigationItem = {
  key: KEYS.MODULE,
  label: 'Assistant',
  icon: renderIcon('RobotOutlined'),
  path: PATHS.ROOT,
};
