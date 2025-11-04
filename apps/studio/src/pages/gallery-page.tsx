/**
 * @module @kb-labs/studio-app/pages/GalleryPage
 * Gallery page - showcase of all widget types
 */

import * as React from 'react';
import { useRegistry } from '../providers/registry-provider.js';
import { WidgetRenderer } from '../components/widget-renderer.js';
import { DashboardGrid } from '../layouts/DashboardGrid.js';

export function GalleryPage(): React.ReactElement {
  const { registry } = useRegistry();

  // Collect all widgets from registry
  const widgets = React.useMemo(() => {
    const allWidgets: Array<{ widgetId: string; pluginId: string; layoutHint?: any }> = [];
    
    // Try new format first
    for (const plugin of registry.plugins || []) {
      for (const widget of plugin.widgets) {
        allWidgets.push({
          widgetId: widget.id,
          pluginId: widget.plugin.id,
          layoutHint: widget.layoutHint,
        });
      }
    }
    
    // Fallback to legacy format
    if (allWidgets.length === 0 && registry.widgets) {
      for (const widget of registry.widgets) {
        allWidgets.push({
          widgetId: widget.id,
          pluginId: widget.plugin.id,
          layoutHint: widget.layoutHint,
        });
      }
    }
    
    return allWidgets;
  }, [registry]);

  if (widgets.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Gallery</h1>
        <p>No widgets available. Please check your registry.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Widget Gallery</h1>
      <p>Showcase of all available widgets</p>
      <DashboardGrid cols={{ sm: 4, md: 8, lg: 12 }} rowHeight={8}>
        {widgets.map((widget) => (
          <WidgetRenderer
            key={`${widget.pluginId}:${widget.widgetId}`}
            widgetId={widget.widgetId}
            pluginId={widget.pluginId}
            layoutHint={widget.layoutHint}
          />
        ))}
      </DashboardGrid>
    </div>
  );
}


