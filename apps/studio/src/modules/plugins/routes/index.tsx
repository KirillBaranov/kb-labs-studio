/**
 * @module @kb-labs/studio-app/modules/plugins/routes
 * Plugins module routing configuration
 */

import type { RouteObject } from 'react-router-dom';
import type { NavigationItem } from '@kb-labs/studio-ui-react';
import { PluginsPage } from '../pages/plugins-page';
import { PluginDetailPage } from '../pages/plugin-detail-page';
import { PluginPage } from '../pages/plugin-page';
import { ErrorBoundary } from '../../../components/error-boundary';
import { renderIcon } from '../../../routes/helpers';

// Route paths
const PATHS = {
  ROOT: '/plugins',
  DETAIL: '/plugins/:pluginId',
  WIDGET: '/plugins/:pluginId/:widgetName',
} as const;

// Route keys
const KEYS = {
  MODULE: 'plugins',
} as const;

/**
 * Plugins routes
 */
export const pluginsRoutes: RouteObject[] = [
  {
    path: PATHS.ROOT,
    element: <PluginsPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.DETAIL,
    element: <PluginDetailPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: PATHS.WIDGET,
    element: <PluginPage />,
    errorElement: <ErrorBoundary />,
  },
];

/**
 * Plugins navigation item for sidebar
 */
export const pluginsNavigation: NavigationItem = {
  key: KEYS.MODULE,
  label: 'Plugins',
  icon: renderIcon('AppstoreOutlined'),
  path: PATHS.ROOT,
};
