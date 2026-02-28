/**
 * @module @kb-labs/studio-app/routes/plugin-page
 * Plugin page for rendering plugin layouts
 */

import * as React from 'react';
import { useParams } from 'react-router-dom';
import { WidgetRenderer } from '../../../components/widget-renderer';
import { useRegistry } from '../../../providers/registry-provider';
import { DashboardGrid } from '../../../layouts/dashboard-grid';
import { PageHeader } from '../../../components/page-header';
import type { StudioRegistryEntry } from '@kb-labs/rest-api-contracts';

/**
 * Plugin page component
 * Layout-first approach: /plugins/{pluginId}/{pageName} → layout {pluginId}.{pageName}
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

  // Extract plugin name from plugin ID (e.g., "@kb-labs/analytics" -> "analytics")
  const pluginName = urlPluginId.includes('/') 
    ? urlPluginId.split('/').pop() || urlPluginId
    : urlPluginId;
  
  // Try layout-first approach: look for layout with ID {pluginName}.{widgetName}
  const layoutId = `${pluginName}.${widgetName}`;
  const layout = (registry.layouts ?? []).find((l) => l.id === layoutId);
  
  if (layout && layout.widgets && layout.widgets.length > 0) {
    // Found layout with explicit widget list - render layout with widgets
    const plugin = registry.plugins.find((p) => {
      const pName = p.pluginId.includes('/') ? p.pluginId.split('/').pop() || p.pluginId : p.pluginId;
      return pName === pluginName;
    });
    
    if (!plugin) {
      return <div>Plugin {pluginName} not found in registry</div>;
    }

    // Collect widgets from layout.widgets list
    const widgetsToRender: Array<{ widget: StudioRegistryEntry; pluginId: string }> = [];
    const missingWidgets: string[] = [];
    
    for (const widgetId of layout.widgets) {
      // Try to find widget in plugin's widgets
      const widget = plugin.widgets.find((w) => w.id === widgetId);
      if (widget) {
        widgetsToRender.push({ widget, pluginId: plugin.pluginId });
      } else {
        // Try to find in global registry as fallback
        const globalWidget = (registry.widgets ?? []).find((w) => w.id === widgetId);
        if (globalWidget) {
          widgetsToRender.push({ widget: globalWidget, pluginId: globalWidget.plugin?.id || plugin.pluginId });
        } else {
          // Widget not found - collect for error message
          missingWidgets.push(widgetId);
        }
      }
    }

    if (missingWidgets.length > 0) {
      // Show helpful error with suggestions
      const availableWidgets = [
        ...plugin.widgets.map(w => w.id),
        ...(registry.widgets ?? []).filter(w => w.plugin?.id === plugin.pluginId).map(w => w.id),
      ];
      
      // Find similar widget IDs (simple fuzzy match)
      const suggestions = missingWidgets.map(missing => {
        const similar = availableWidgets.filter(id => 
          id.includes(missing.split('.').pop() || '') || 
          missing.includes(id.split('.').pop() || '')
        ).slice(0, 3);
        return { missing, similar };
      });

      return (
        <div style={{ padding: '24px' }}>
          <PageHeader title={layout.title || layout.name || layoutId} />
          <div style={{ 
            padding: '16px', 
            backgroundColor: 'color-mix(in srgb, var(--warning) 10%, var(--bg-secondary))', 
            border: '1px solid var(--warning)',
            borderRadius: '4px',
            marginTop: '16px'
          }}>
            <h3 style={{ marginTop: 0, color: 'var(--warning)' }}>⚠️ Widgets not found</h3>
            <p style={{ color: 'var(--warning)', marginBottom: '12px' }}>
              Layout <code>{layoutId}</code> references widgets that don't exist:
            </p>
            <ul style={{ marginBottom: '12px' }}>
              {missingWidgets.map(id => (
                <li key={id}><code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '2px' }}>{id}</code></li>
              ))}
            </ul>
            {suggestions.some(s => s.similar.length > 0) && (
              <>
                <p style={{ color: 'var(--warning)', marginBottom: '8px', fontWeight: 'bold' }}>Did you mean?</p>
                <ul>
                  {suggestions.map(({ missing, similar }) => 
                    similar.length > 0 && (
                      <li key={missing}>
                        For <code>{missing}</code>: {similar.map(id => <code key={id} style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '2px', marginLeft: '4px' }}>{id}</code>)}
                      </li>
                    )
                  )}
                </ul>
              </>
            )}
            <p style={{ color: 'var(--warning)', marginTop: '12px', marginBottom: 0 }}>
              <strong>Available widgets in plugin "{plugin.pluginId}":</strong>
            </p>
            <ul style={{ marginTop: '8px' }}>
              {availableWidgets.slice(0, 20).map(id => (
                <li key={id}><code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '2px' }}>{id}</code></li>
              ))}
              {availableWidgets.length > 20 && (
                <li style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>... and {availableWidgets.length - 20} more</li>
              )}
            </ul>
          </div>
        </div>
      );
    }

    if (widgetsToRender.length === 0) {
      return (
        <div style={{ padding: '24px' }}>
          <PageHeader title={layout.title || layout.name || layoutId} />
          <div style={{ 
            padding: '16px', 
            backgroundColor: 'color-mix(in srgb, var(--error) 10%, var(--bg-secondary))', 
            border: '1px solid var(--error)',
            borderRadius: '4px',
            marginTop: '16px'
          }}>
            <p style={{ color: 'var(--error)', margin: 0 }}>
              No widgets found for layout <code>{layoutId}</code>.
            </p>
            <p style={{ color: 'var(--error)', marginTop: '8px', marginBottom: 0 }}>
              Expected widgets: {layout.widgets?.join(', ') || 'none'}
            </p>
          </div>
        </div>
      );
    }

    // Render layout with widgets
    if (layout.kind === 'grid' || !layout.kind) {
      const gridConfig = layout.config as { cols?: { sm?: number; md?: number; lg?: number }; rowHeight?: number } | undefined;
      const cols = gridConfig?.cols ? {
        sm: gridConfig.cols.sm ?? 1,
        md: gridConfig.cols.md ?? 2,
        lg: gridConfig.cols.lg ?? 3,
      } : undefined;
      return (
        <div style={{ padding: '24px' }}>
          <PageHeader 
            title={layout.title || layout.name || layoutId}
            description={layout.description}
          />
          <DashboardGrid
            cols={cols}
            rowHeight={gridConfig?.rowHeight}
          >
            {widgetsToRender.map(({ widget, pluginId }) => (
              <WidgetRenderer
                key={widget.id}
                widgetId={widget.id}
                pluginId={pluginId}
                layoutHint={widget.layoutHint ? {
                  w: widget.layoutHint.w ?? 4,
                  h: widget.layoutHint.h ?? 4,
                  minW: widget.layoutHint.minW,
                  minH: widget.layoutHint.minH,
                  height: widget.layoutHint.height,
                } : undefined}
              />
            ))}
          </DashboardGrid>
        </div>
      );
    }

    // For other layout kinds (two-pane, etc.), render widgets in a simple list for now
    return (
      <div style={{ padding: '24px' }}>
        <PageHeader
          title={layout.title || layout.name || layoutId}
          description={layout.description}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {widgetsToRender.map(({ widget, pluginId }) => (
            <WidgetRenderer key={widget.id} widgetId={widget.id} pluginId={pluginId} />
          ))}
        </div>
      </div>
    );
  }

  // Layout not found
  return (
    <div style={{ padding: '24px' }}>
      <div>Layout {layoutId} not found in registry.</div>
      <div style={{ marginTop: '16px' }}>
        <div>Available layouts: {(registry.layouts ?? []).map(l => l.id).join(', ') || 'none'}</div>
      </div>
    </div>
  );
}

