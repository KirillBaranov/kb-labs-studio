/**
 * @module @kb-labs/studio-app/routes/plugin-page
 * Plugin page for rendering plugin widgets
 */

import * as React from 'react';
import { useParams } from 'react-router-dom';
import { WidgetRenderer } from '../components/widget-renderer.js';
import { useRegistry } from '../providers/registry-provider.js';

/**
 * Plugin page component
 */
export function PluginPage(): React.ReactElement {
  const { widgetId } = useParams<{ widgetId: string }>();
  const { registry, loading, error } = useRegistry();

  if (loading) {
    return <div>Loading registry...</div>;
  }

  if (error) {
    return <div>Error loading registry: {error.message}</div>;
  }

  if (!widgetId) {
    return <div>No widget ID provided</div>;
  }

  // Check if widget exists in registry
  const widget = registry.widgets.find((w) => w.id === widgetId);
  if (!widget) {
    return <div>Widget {widgetId} not found in registry</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>{widget.id}</h1>
      <WidgetRenderer widgetId={widgetId} />
    </div>
  );
}

