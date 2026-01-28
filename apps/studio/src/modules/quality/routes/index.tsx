/**
 * @module @kb-labs/studio-app/modules/quality/routes
 * Quality module routing configuration
 */

import type { RouteObject } from 'react-router-dom';
import type { NavigationItem } from '@kb-labs/studio-ui-react';
import { QualityPage } from '../pages/quality-page';
import { ErrorBoundary } from '../../../components/error-boundary';
import { renderIcon } from '../../../routes/helpers';

// Route paths
const PATHS = {
  ROOT: '/quality',
  TAB: '/quality/:tab',
} as const;

// Route keys
const KEYS = {
  MODULE: 'quality',
} as const;

/**
 * Quality routes
 */
export const qualityRoutes: RouteObject[] = [
  {
    path: PATHS.ROOT,
    element: <QualityPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.TAB,
    element: <QualityPage />,
    errorElement: <ErrorBoundary />,
  },
];

/**
 * Quality navigation item for sidebar
 */
export const qualityNavigation: NavigationItem = {
  key: KEYS.MODULE,
  label: 'Quality',
  icon: renderIcon('CheckCircleOutlined'),
  path: PATHS.ROOT,
};
