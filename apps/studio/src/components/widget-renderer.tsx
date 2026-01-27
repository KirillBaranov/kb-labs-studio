/**
 * @module @kb-labs/studio-app/components/widget-renderer
 * Widget renderer for Studio - supports standard widgets by kind and custom components
 */

import * as React from 'react';
import { useRegistry } from '../providers/registry-provider';
import { useWidgetData } from '../hooks/useWidgetData';
import type { StudioRegistryEntry } from '@kb-labs/rest-api-contracts';
import { isCompositeWidget } from '@kb-labs/rest-api-contracts';
import { WidgetPropsSchema, validateWidgetProps, type WidgetProps } from '@kb-labs/studio-contracts';
import * as Widgets from './widgets/index';
import { Skeleton, ErrorState } from './widgets/shared/index';
import { trackWidgetEvent } from '../utils/analytics';
import { studioConfig } from '../config/studio.config';
import { HeaderPolicyCallout } from './header-policy-callout';
import { WidgetErrorBoundary } from './widget-error-boundary';
// eslint-disable-next-line import/extensions
import { useWidgetEvents } from '../hooks/useWidgetEvents';
import { useWidgetEventSubscription } from '../hooks/useWidgetEventSubscription';
import { useCircularDependencyDetection } from '../hooks/useCircularDependencyDetection';
import { useWidgetDataMerger } from '../hooks/useWidgetDataMerger';
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
  const [component, setComponent] = React.useState<React.ComponentType<WidgetProps> | null>(null);
  const [componentError, setComponentError] = React.useState<Error | null>(null);
  const [loadingComponent, setLoadingComponent] = React.useState(false);

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
  }, [widget?.data?.source, eventParams, widgetId]);

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

  // Load custom component if needed
  React.useEffect(() => {
    if (!widget) {
      setLoadingComponent(false);
      return;
    }

    // If standard widget, use kind mapping
    if (!widget.component) {
      setLoadingComponent(false);
      return;
    }

    // Load custom component dynamically
    setLoadingComponent(true);
    setComponentError(null);

    try {
      // Use component path from registry (set by server or manifest)
      const componentPath = widget.component;
      if (!componentPath) {
        throw new Error(`Widget ${widget.id} has no component path`);
      }

      // Dynamic import - path comes from server registry, not user input
      import(/* @vite-ignore */ componentPath)
        .then((module) => {
          const imported = module as Record<string, unknown>;
          const keys = Object.keys(imported);
          const fallbackKey = keys.length > 0 ? keys[0] : undefined;
          const Component =
            (imported.default as React.ComponentType<WidgetProps> | undefined) ||
            (fallbackKey ? (imported[fallbackKey] as React.ComponentType<WidgetProps> | undefined) : undefined);
          if (!Component) {
            throw new Error(`Component not found in ${componentPath}`);
          }
          setComponent(Component);
          setComponentError(null);
        })
        .catch((e) => {
          setComponentError(e instanceof Error ? e : new Error(String(e)));
        })
        .finally(() => {
          setLoadingComponent(false);
        });
    } catch (e) {
      setComponentError(e instanceof Error ? e : new Error(String(e)));
      setLoadingComponent(false);
    }
  }, [widget]);

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

  const rawHeaderOptions = (widget.options as any)?.headers as
    | {
        enabled?: boolean;
        title?: string;
        description?: string;
        collapsible?: boolean;
        expanded?: boolean;
        showProvided?: boolean;
      }
    | undefined;

  const missingHeadersCount = widgetData.headers?.missingRequired?.length ?? 0;
  const headerNoticeEnabled =
    !!headerHints &&
    ((rawHeaderOptions?.enabled ?? studioConfig.headerNotices.enabled) || missingHeadersCount > 0);

  const headerNotice = headerNoticeEnabled && headerHints ? (
    <HeaderPolicyCallout
      hints={headerHints}
      status={widgetData.headers}
      title={rawHeaderOptions?.title || 'Header policy'}
      description={
        rawHeaderOptions?.description ||
        'Studio forwards headers that match this manifest-defined policy.'
      }
      collapsible={rawHeaderOptions?.collapsible ?? studioConfig.headerNotices.collapsible}
      defaultExpanded={
        rawHeaderOptions?.expanded ??
        (missingHeadersCount > 0 || studioConfig.headerNotices.defaultExpanded)
      }
      showProvided={rawHeaderOptions?.showProvided ?? studioConfig.headerNotices.showProvided}
    />
  ) : null;

  // Extract showTitle and showDescription from options
  // Default: showTitle=true for charts, false for others
  const widgetOptions = widget.options as Record<string, unknown> | undefined;
  const showTitle = widgetOptions?.showTitle as boolean | undefined;
  const showDescription = widgetOptions?.showDescription as boolean | undefined;

  // Create onChange handler for form widgets that auto-emits events
  const handleChange = React.useCallback(
    (value: unknown) => {

      // Auto-emit events declared in manifest
      if (!widget?.events?.emit || widget.events.emit.length === 0) {
        return;
      }

      const eventConfig = widget.events.emit[0]; // Use first event config
      const eventName = typeof eventConfig === 'string' ? eventConfig : eventConfig.name;
      const payloadMap = typeof eventConfig === 'object' ? eventConfig.payloadMap : undefined;


      // Build payload using payloadMap or default { value }
      const payload: Record<string, unknown> = {};

      if (payloadMap) {
        // Use explicit mapping: payloadMap = { workspace: 'value' }
        for (const [payloadKey, dataKey] of Object.entries(payloadMap)) {
          if (dataKey === 'value') {
            payload[payloadKey] = value;
          } else if (widgetData.data && typeof widgetData.data === 'object') {
            payload[payloadKey] = (widgetData.data as Record<string, unknown>)[dataKey];
          }
        }
      } else {
        // Default: emit { value }
        payload.value = value;
      }

      emit(eventName, payload);
    },
    [widget?.events?.emit, widgetData.data, emit, widgetId]
  );

  // 🎯 REFACTOR: Use extracted hook for circular dependency detection
  const { isCircular, markVisited, clearVisited } = useCircularDependencyDetection();

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

  // Check if widget is composite and render children
  const isComposite = widget && isCompositeWidget(widget);
  const childrenNodes = isComposite ? renderChildren(widget.children) : null;

  // 🎯 REFACTOR: Use extracted hook for data merging
  const finalData = useWidgetDataMerger(eventData, widgetData.data);

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
