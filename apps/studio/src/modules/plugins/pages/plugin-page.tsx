/**
 * @module @kb-labs/studio-app/modules/plugins/pages/plugin-page
 * Plugin page for rendering plugin layouts
 */

import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useRegistryV2 } from '../../../providers/registry-v2-provider';
import { PageHeader } from '../../../components/page-header';

export function PluginPage(): React.ReactElement {
  const { pluginId: urlPluginId, widgetName } = useParams<{ pluginId: string; widgetName: string }>();
  const { registry, loading, error } = useRegistryV2();

  if (loading) {
    return <div>Loading registry...</div>;
  }

  if (error) {
    return <div>Error loading registry: {error.message}</div>;
  }

  if (!urlPluginId || !widgetName) {
    return <div>No plugin ID or widget name provided</div>;
  }

  const pluginName = urlPluginId.includes('/')
    ? urlPluginId.split('/').pop() || urlPluginId
    : urlPluginId;

  const layoutId = `${pluginName}.${widgetName}`;
  const layout = (registry.layouts ?? []).find((l) => l.id === layoutId);

  if (!layout) {
    return (
      <div style={{ padding: '24px' }}>
        <div>Layout {layoutId} not found in registry.</div>
        <div style={{ marginTop: '16px' }}>
          <div>Available layouts: {(registry.layouts ?? []).map(l => l.id).join(', ') || 'none'}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader
        title={layout.title || layoutId}
        description={layout.description}
      />
      <div style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
        Layout: <code>{layoutId}</code>
      </div>
    </div>
  );
}
