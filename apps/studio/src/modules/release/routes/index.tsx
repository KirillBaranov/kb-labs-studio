/**
 * @module @kb-labs/studio-app/modules/release/routes
 * Release module routing configuration
 */

import type { RouteObject } from 'react-router-dom';
import type { NavigationItem } from '@kb-labs/studio-ui-react';
import { ReleasePage } from '../pages/release-page';
import { ErrorBoundary } from '../../../components/error-boundary';
import { renderIcon } from '../../../routes/helpers';

// Route paths
const PATHS = {
  ROOT: '/release',
  HISTORY: '/release/history',
} as const;

// Route keys
const KEYS = {
  MODULE: 'release',
  MAIN: 'release-main',
  HISTORY: 'release-history',
} as const;

/**
 * Release routes
 */
export const releaseRoutes: RouteObject[] = [
  {
    path: PATHS.ROOT,
    element: <ReleasePage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.HISTORY,
    element: <ReleasePage view="history" />,
    errorElement: <ErrorBoundary />,
  },
];

/**
 * Release navigation item for sidebar
 */
export const releaseNavigation: NavigationItem = {
  key: KEYS.MODULE,
  label: 'Release',
  icon: renderIcon('RocketOutlined'),
  children: [
    {
      key: KEYS.MAIN,
      label: 'Create Release',
      path: PATHS.ROOT,
      icon: renderIcon('PlusCircleOutlined'),
    },
    {
      key: KEYS.HISTORY,
      label: 'History',
      path: PATHS.HISTORY,
      icon: renderIcon('HistoryOutlined'),
    },
  ],
};
