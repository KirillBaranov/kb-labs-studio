/**
 * @module @kb-labs/studio-app/pages/GalleryPage
 * Gallery page - showcase of all widget types
 */

import * as React from 'react';
import { useRegistry } from '../providers/registry-provider';
import { WidgetRenderer } from '../components/widget-renderer';
import { DashboardGrid } from '../layouts/DashboardGrid';

export function GalleryPage(): React.ReactElement {
  const { registry } = useRegistry();

  // Collect all widgets from registry (using flattened widgets array)
  const widgets = React.useMemo(() => {
    // Use flattened widgets array for O(n) instead of O(n*m)
    return (registry.widgets ?? []).map(widget => ({
      widgetId: widget.id,
      pluginId: widget.plugin?.id ?? 'unknown',
      layoutHint: widget.layoutHint,
    }));
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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Click on a widget in the sidebar to view it. Widgets are not loaded here to avoid unnecessary API calls.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Available Widgets</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {widgets.map((widget) => {
            const pluginName = widget.pluginId.includes('/') 
              ? widget.pluginId.split('/').pop() || widget.pluginId
              : widget.pluginId;
            const widgetName = widget.widgetId.includes('.') 
              ? widget.widgetId.split('.').pop() || widget.widgetId
              : widget.widgetId;
            const widgetPath = `/plugins/${pluginName}/${widgetName}`;
            
            return (
              <li key={`${widget.pluginId}:${widget.widgetId}`} style={{ marginBottom: '0.5rem' }}>
                <a 
                  href={widgetPath}
                  style={{ color: 'var(--link)', textDecoration: 'none' }}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = widgetPath;
                  }}
                >
                  {widget.widgetId}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}


