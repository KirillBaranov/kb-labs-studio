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
  const { pluginId: urlPluginId, widgetName } = useParams<{ pluginId: string; widgetName: string }>();
  const { registry, loading, error } = useRegistry();

  if (loading) {
    return <div>Loading registry...</div>;
  }

  if (error) {
    return <div>Error loading registry: {error.message}</div>;
  }

  if (!urlPluginId || !widgetName) {
    return <div>No plugin ID or widget name provided</div>;
  }

  // Find widget by matching plugin ID and widget name
  // Widget ID format: {pluginName}.{widgetName} (e.g., "mind.query")
  // URL format: /plugins/{pluginName}/{widgetName} (e.g., "/plugins/mind/query")
  // Extract plugin name from plugin ID (e.g., "@kb-labs/mind" -> "mind")
  const pluginName = urlPluginId.includes('/') 
    ? urlPluginId.split('/').pop() || urlPluginId
    : urlPluginId;
  
  // Construct widget ID: {pluginName}.{widgetName}
  const widgetId = `${pluginName}.${widgetName}`;
  
  // Find widget in registry
  const widget = registry.widgets.find((w) => w.id === widgetId);
  if (!widget) {
    // Try to find by plugin ID and widget name separately
    const plugin = registry.plugins.find((p) => {
      const pName = p.id.includes('/') ? p.id.split('/').pop() || p.id : p.id;
      return pName === pluginName;
    });
    
    if (plugin) {
      const widgetInPlugin = plugin.widgets.find((w) => {
        // Widget ID might be just the name or full ID
        return w.id === widgetId || w.id === widgetName || w.id.endsWith(`.${widgetName}`);
      });
      
      if (widgetInPlugin) {
        return (
          <div style={{ padding: '24px' }}>
            <h1>{widgetInPlugin.id}</h1>
            <WidgetRenderer widgetId={widgetInPlugin.id} pluginId={plugin.id} />
          </div>
        );
      }
    }
    
    return <div>Widget {widgetId} not found in registry. Available widgets: {registry.widgets.map(w => w.id).join(', ')}</div>;
  }

  // Extract pluginId from widget
  const pluginId = widget.plugin.id;

  return (
    <div style={{ padding: '24px' }}>
      <h1>{widget.id}</h1>
      <WidgetRenderer widgetId={widgetId} pluginId={pluginId} />
    </div>
  );
}

