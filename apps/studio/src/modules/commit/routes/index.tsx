/**
 * @module @kb-labs/studio-app/modules/commit/routes
 * Commit module routing configuration
 */

import type { RouteObject } from 'react-router-dom';
import type { NavigationItem } from '@kb-labs/studio-ui-react';
import { CommitPage } from '../pages/commit-page';
import { ErrorBoundary } from '../../../components/error-boundary';
import { renderIcon } from '../../../routes/helpers';

// Route paths
const PATHS = {
  ROOT: '/commit',
  TAB: '/commit/:tab',
} as const;

// Route keys
const KEYS = {
  MODULE: 'commit',
} as const;

/**
 * Commit routes
 */
export const commitRoutes: RouteObject[] = [
  {
    path: PATHS.ROOT,
    element: <CommitPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.TAB,
    element: <CommitPage />,
    errorElement: <ErrorBoundary />,
  },
];

/**
 * Commit navigation item for sidebar
 */
export const commitNavigation: NavigationItem = {
  key: KEYS.MODULE,
  label: 'Commit',
  icon: renderIcon('GitlabOutlined'),
  path: PATHS.ROOT,
};
