/**
 * @module @kb-labs/studio-app/components/widget-renderer
 * Widget renderer for Studio - supports standard widgets by kind and custom components
 */

import * as React from 'react';
import { useRegistry } from '../providers/registry-provider';
import { useWidgetData } from '../hooks/useWidgetData';
import type { StudioRegistryEntry } from '@kb-labs/rest-api-contracts';
import { isCompositeWidget } from '@kb-labs/rest-api-contracts';
import type { WidgetProps } from '@kb-labs/studio-contracts';
import * as Widgets from './widgets/index';
import { trackWidgetEvent } from '../utils/analytics';
import { studioConfig } from '../config/studio.config';
import { WidgetErrorBoundary } from './widget-error-boundary';
 
import { useWidgetEvents } from '../hooks/useWidgetEvents';
import { useWidgetEventSubscription } from '../hooks/useWidgetEventSubscription';
import { useCircularDependencyDetection } from '../hooks/useCircularDependencyDetection';
import { useWidgetDataMerger } from '../hooks/useWidgetDataMerger';
import { useWidgetComponentLoader } from '../hooks/useWidgetComponentLoader';
import { useWidgetChangeHandler } from '../hooks/useWidgetChangeHandler';
import { useHeaderNotice } from '../hooks/useHeaderNotice';
import { WithWidgetState } from '../hocs/WithWidgetState';

/**
 * Widget kind to component mapping (29 widgets across 5 categories)
 *
 * Display (14): metric, metric-group, table, card, cardlist, chart-line, chart-bar, chart-pie, chart-area, timeline, tree, json, diff, logs
 * Form (6): form, input, select, checkbox-group, switch, date-picker
 * Layout (5): section, grid, stack, tabs, modal
 * Navigation (3): breadcrumb, stepper, menu
 * Feedback (2): alert, confirm
 *
 * 🎯 TYPE SAFETY: Now uses WidgetProps discriminated union instead of `any`
 */
const WIDGET_COMPONENTS: Record<string, React.ComponentType<WidgetProps>> = {
  // Display widgets (14)
  'metric': Widgets.Metric,
  'metric-group': Widgets.MetricGroup,
  'table': Widgets.Table,
  'card': Widgets.Card,
  'cardlist': Widgets.CardList,
  'chart-line': Widgets.ChartLine,
  'chart-bar': Widgets.ChartBar,
  'chart-pie': Widgets.ChartPie,
  'chart-area': Widgets.ChartArea,
  'timeline': Widgets.Timeline,
  'tree': Widgets.Tree,
  'json': Widgets.Json,
  'diff': Widgets.Diff,
  'logs': Widgets.Logs,

  // Form widgets (6)
  'form': Widgets.Form,
  'input': Widgets.Input,
  'select': Widgets.Select,
  'checkbox-group': Widgets.CheckboxGroup,
  'switch': Widgets.Switch,
  'date-picker': Widgets.DatePicker,

  // Layout widgets (5) - composite with children
  'section': Widgets.Section,
  'grid': Widgets.Grid,
  'stack': Widgets.Stack,
  'tabs': Widgets.Tabs,
  'modal': Widgets.Modal,

  // Navigation widgets (3)
  'breadcrumb': Widgets.Breadcrumb,
  'stepper': Widgets.Stepper,
  'menu': Widgets.Menu,

  // Feedback widgets (2)
  'alert': Widgets.Alert,
  'confirm': Widgets.Confirm,
};

/**
 * Widget renderer props
 */
export interface WidgetRendererProps {
  /** Widget ID */
  widgetId: string;
  /** Plugin ID */
  pluginId: string;
  /** Layout hint for grid layouts */
  layoutHint?: {
    w: number;
    h: number;
    minW?: number;
    minH?: number;
  };
}

/**
 * Widget renderer component
 */
export function WidgetRenderer({
  widgetId,
  pluginId,
  layoutHint,
}: WidgetRendererProps): React.ReactElement | null {
  const { registry } = useRegistry();

  // Find widget in registry using O(1) Map lookup (from flattened registry)
  const widget = React.useMemo(() => {
    // Use widgetMap for instant lookup instead of nested loop
    if (registry.widgetMap) {
      return registry.widgetMap.get(widgetId);
    }
    // Fallback to linear search if widgetMap not available
    if (!registry.plugins || !Array.isArray(registry.plugins)) {
      return undefined;
    }
    for (const plugin of registry.plugins) {
      const found = plugin.widgets.find((w: StudioRegistryEntry) => w.id === widgetId && w.plugin.id === pluginId);
      if (found) {
        return found;
      }
    }
    return undefined;
  }, [registry, widgetId, pluginId]);

  // 🎯 REFACTOR: Use hook for dynamic component loading
  const { component, loading: loadingComponent, error: componentError } = useWidgetComponentLoader(widget);

  // Event bus for widget communication
  const { subscribe, emit } = useWidgetEvents();

  // 🎯 REFACTOR: Use extracted hook for event subscription
  const { eventParams, eventData } = useWidgetEventSubscription(widget, widgetId);

  // Track widget mount
  React.useEffect(() => {
    if (widget) {
      trackWidgetEvent('mounted', { widgetId, pluginId });
    }
  }, [widget, widgetId, pluginId]);

  // Load widget data
  // Use widget.plugin.id (manifest.id) for REST API path construction
  // Extract package name from manifest.id (e.g., "@kb-labs/mind" -> "mind")
  // This ensures correct URL format: /api/v1/plugins/{packageName}/{routeId}
  const manifestId = widget?.plugin?.id || pluginId;
  
  // Construct basePath: ensure it ends with /v1
  // If apiBaseUrl is '/api', add '/v1' -> '/api/v1'
  // If apiBaseUrl is '/api/v1', use as-is -> '/api/v1'
  // If apiBaseUrl is 'http://localhost:5050/api/v1', use as-is
  let basePath = studioConfig.apiBaseUrl;
  if (!basePath.endsWith('/v1')) {
    // Remove trailing slash if present, then add /v1
    basePath = basePath.replace(/\/$/, '') + '/v1';
  }
  
  const headerHints = widget?.data?.headers;

  // Merge event params with source params
  const sourceWithParams = React.useMemo(() => {
    const source = widget?.data?.source || { type: 'mock', fixtureId: 'empty' };

    if (source.type === 'rest' && Object.keys(eventParams).length > 0) {
      const merged = {
        ...source,
        params: {
          ...(source.params || {}),
          ...eventParams,
        },
      };
      return merged;
    }

    return source;
  }, [widget?.data?.source, eventParams]);

  const widgetData = useWidgetData({
    widgetId,
    pluginId: manifestId,
    source: sourceWithParams,
    basePath,
    pollingMs: widget?.pollingMs || 0,
    headerHints,
  });

  // Track widget error
  React.useEffect(() => {
    if (widgetData.error) {
      trackWidgetEvent('error', { widgetId, pluginId, code: widgetData.error });
    }
  }, [widgetData.error, widgetId, pluginId]);

  // 🎯 REFACTOR: Call all hooks BEFORE any conditional returns
  // These hooks must be called unconditionally to satisfy React Rules of Hooks

  // 🎯 REFACTOR: Use hook for header notice
  const headerNotice = useHeaderNotice(widget, widgetData, headerHints);

  // 🎯 REFACTOR: Use hook for change handler
  const handleChange = useWidgetChangeHandler(widget, widgetData.data, emit, widgetId);

  // 🎯 REFACTOR: Use extracted hook for circular dependency detection
  const { isCircular, markVisited, clearVisited } = useCircularDependencyDetection();

  // 🎯 REFACTOR: Use extracted hook for data merging
  const finalData = useWidgetDataMerger(eventData, widgetData.data);

  const renderChildren = React.useCallback((childrenIds: string[] | undefined): React.ReactNode => {
    if (!childrenIds || !Array.isArray(childrenIds) || childrenIds.length === 0) {
      return null;
    }

    // Clear visited set before rendering children (prevents false circular dependency warnings on re-renders)
    clearVisited();

    return childrenIds.map((childId) => {
      // Circular dependency protection
      if (isCircular(childId)) {
        console.warn(`[WidgetRenderer] Circular dependency detected: ${childId} already in render tree`);
        return null;
      }

      // Find child widget in registry to get its pluginId
      const childWidget = registry.widgetMap?.get(childId);
      if (!childWidget) {
        console.warn(`[WidgetRenderer] Child widget not found: ${childId}`);
        return null;
      }

      // Get pluginId from widget's plugin metadata
      const childPluginId = childWidget.plugin?.id || pluginId;

      // Mark as visited before recursing
      markVisited(childId);

      return (
        <WidgetRenderer
          key={childId}
          widgetId={childId}
          pluginId={childPluginId}
        />
      );
    });
  }, [registry.widgetMap, pluginId, isCircular, markVisited, clearVisited]);

  // 🎯 REFACTOR: Determine component to use
  const resolvedComponent: React.ComponentType<WidgetProps> | null =
    (widget?.component && component) ? component :
    (!widget?.component && widget) ? WIDGET_COMPONENTS[widget.kind] || null :
    null;

  // 🎯 REFACTOR: Use HOC for all validation/loading/error states
  const EnhancedWidgetComponent = React.useMemo(
    () => WithWidgetState({
      component: resolvedComponent,
      widgetId,
      widget,
      loadingComponent,
      componentError,
    }),
    [resolvedComponent, widgetId, widget, loadingComponent, componentError]
  );

  // Early return if widget validation fails (HOC will render error state)
  if (!widget || !widget.data || !widget.data.source || !resolvedComponent || componentError || loadingComponent) {
    return <EnhancedWidgetComponent />;
  }

  // Widget is valid - get the actual component for rendering
  const WidgetComponent = resolvedComponent;

  // Extract showTitle and showDescription from options
  const widgetOptions = widget.options as Record<string, unknown> | undefined;
  const showTitle = widgetOptions?.showTitle as boolean | undefined;
  const showDescription = widgetOptions?.showDescription as boolean | undefined;

  // Check if widget is composite and render children
  const isComposite = widget && isCompositeWidget(widget);
  const childrenNodes = isComposite ? renderChildren(widget.children) : null;

  // Render widget with data, wrapped in error boundary
  return (
    <>
      {headerNotice}
      <WidgetErrorBoundary widgetId={widgetId} pluginId={pluginId}>
        <WidgetComponent
          data={finalData}
          loading={widgetData.loading}
          error={widgetData.error}
          options={widget.options}
          title={widget.title}
          description={widget.description}
          actions={widget.actions}
          widgetId={widgetId}
          pluginId={manifestId}
          showTitle={showTitle}
          showDescription={showDescription}
          layoutHint={layoutHint || widget.layoutHint}
          emitEvent={emit}
          subscribeToEvent={subscribe}
          onChange={handleChange}
          onInteraction={(event: string) => {
            trackWidgetEvent('interaction', { widgetId, pluginId, event });
          }}
          source={widget?.data?.source}
          headerHints={headerHints}
        >
          {childrenNodes}
        </WidgetComponent>
      </WidgetErrorBoundary>
    </>
  );
}
