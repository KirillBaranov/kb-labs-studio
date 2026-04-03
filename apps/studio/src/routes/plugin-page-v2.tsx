/**
 * Dynamic plugin page resolver.
 * Matches the current route against the V2 registry and renders
 * the appropriate MF remote page via PageContainer.
 */

import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { PageContainer } from '@kb-labs/studio-federation';
import { useRegistryV2 } from '../providers/registry-v2-provider';
import { NotFoundPage } from '../pages/not-found-page';

export function PluginPageV2() {
  const location = useLocation();
  const { registry, loading } = useRegistryV2();

  if (loading) {return null;}

  // Find a page whose route matches the current path
  for (const plugin of registry.plugins) {
    for (const page of plugin.pages) {
      // Exact match or prefix match (for sub-routes like /commit/history)
      if (
        location.pathname === page.route ||
        location.pathname.startsWith(page.route + '/')
      ) {
        // TODO: page-level permission check here
        return (
          <PageContainer
            key={`${plugin.remoteName}::${page.entry}`}
            remoteName={plugin.remoteName}
            entry={page.entry}
            pageId={page.id}
            pluginId={plugin.pluginId}
            permissions={page.permissions}
          />
        );
      }
    }
  }

  return <NotFoundPage />;
}
