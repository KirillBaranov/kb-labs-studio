/**
 * @module @kb-labs/studio-app/pages/GalleryPage
 * Gallery page - list of available widgets
 */

import * as React from 'react';
import { useRegistry } from '../providers/registry-provider';

export function GalleryPage(): React.ReactElement {
  const { registry } = useRegistry();

  const widgets = registry.widgets ?? [];

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
      <div style={{ marginTop: '2rem' }}>
        <h2>Available Widgets</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {widgets.map((widget) => {
            const widgetName = widget.id.includes('.')
              ? widget.id.split('.').pop() || widget.id
              : widget.id;
            return (
              <li key={widget.id} style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>{widget.id}</span>
                {widgetName && <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>({widgetName})</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
