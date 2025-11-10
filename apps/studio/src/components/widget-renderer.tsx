/**
 * @module @kb-labs/studio-app/components/widget-renderer
 * Widget renderer for Studio - supports standard widgets by kind and custom components
 */

import * as React from 'react';
import { useRegistry } from '../providers/registry-provider.js';
import { useWidgetData } from '../hooks/useWidgetData.js';
import { resolveComponentPath } from '@kb-labs/plugin-adapter-studio';
import type { StudioRegistryEntry } from '@kb-labs/plugin-adapter-studio';
import * as Widgets from './widgets/index.js';
import { Skeleton } from './widgets/utils/index.js';
import { ErrorState } from './widgets/utils/index.js';
import { trackWidgetEvent } from '../utils/analytics.js';
import { studioConfig } from '../config/studio.config.js';
import { HeaderPolicyCallout } from './header-policy-callout.js';

/**
 * Widget kind to component mapping
 */
const WIDGET_COMPONENTS: Record<string, React.ComponentType<any>> = {
  metric: Widgets.Metric,
  panel: Widgets.CardList, // Panel uses CardList as base
  card: Widgets.CardList,
  cardlist: Widgets.CardList, // Universal card list widget
  table: Widgets.Table,
  chart: Widgets.ChartLine, // Default chart is line
  tree: Widgets.Tree,
  timeline: Widgets.Timeline,
  logs: Widgets.LogViewer,
  json: Widgets.JsonViewer,
  diff: Widgets.DiffViewer,
  status: Widgets.StatusBadges,
  progress: Widgets.Progress,
  infopanel: Widgets.InfoPanel, // Universal info panel widget
  keyvalue: Widgets.KeyValue, // Universal key-value widget
};

/**
 * Chart kind to component mapping
 */
const CHART_COMPONENTS: Record<string, React.ComponentType<any>> = {
  line: Widgets.ChartLine,
  bar: Widgets.ChartBar,
  pie: Widgets.ChartPie,
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
  const [component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [componentError, setComponentError] = React.useState<Error | null>(null);
  const [loadingComponent, setLoadingComponent] = React.useState(false);

  // Find widget in registry
  const widget = React.useMemo(() => {
    // Try new format first
    if (registry.plugins && Array.isArray(registry.plugins)) {
      for (const plugin of registry.plugins) {
        const found = plugin.widgets.find((w: StudioRegistryEntry) => w.id === widgetId && w.plugin.id === pluginId);
        if (found) {return found;}
      }
    }
    // Fallback to legacy format
    if (registry.widgets && Array.isArray(registry.widgets)) {
      return registry.widgets.find((w: StudioRegistryEntry) => w.id === widgetId);
    }
    return undefined;
  }, [registry, widgetId, pluginId]);

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

  const widgetData = useWidgetData({
    widgetId,
    pluginId: manifestId,
    source: widget?.data?.source || { type: 'mock', fixtureId: 'empty' },
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
      const componentPath = resolveComponentPath(widget);
      
      // Dynamic import
      import(componentPath)
        .then((module) => {
          const imported = module as Record<string, unknown>;
          const keys = Object.keys(imported);
          const fallbackKey = keys.length > 0 ? keys[0] : undefined;
          const Component =
            (imported.default as React.ComponentType<any> | undefined) ||
            (fallbackKey ? (imported[fallbackKey] as React.ComponentType<any> | undefined) : undefined);
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

  // Widget not found
  if (!widget) {
    return (
      <ErrorState
        error="Widget not found"
        hint={`Widget ${widgetId} not found in registry`}
      />
    );
  }

  // Widget data configuration missing
  if (!widget.data || !widget.data.source) {
    return (
      <ErrorState
        error="Invalid widget configuration"
        hint={`Widget ${widgetId} is missing data configuration`}
      />
    );
  }

  // Determine component to use
  let WidgetComponent: React.ComponentType<any> | null = null;

  if (widget.component && component) {
    // Custom component loaded
    WidgetComponent = component;
  } else if (!widget.component) {
    // Standard widget by kind
    if (widget.kind === 'chart') {
      // For chart, check options for chart type
      const optionChartType = (widget.options as Record<string, unknown> | undefined)?.chartType;
      const chartType =
        typeof optionChartType === 'string' && optionChartType in CHART_COMPONENTS
          ? (optionChartType as keyof typeof CHART_COMPONENTS)
          : 'line';
      WidgetComponent = CHART_COMPONENTS[chartType] || WIDGET_COMPONENTS.chart || null;
    } else {
      WidgetComponent = WIDGET_COMPONENTS[widget.kind] || null;
    }
  }

  // Component not found
  if (!WidgetComponent) {
    return (
      <ErrorState
        error="Component not found"
        hint={`No component found for widget kind: ${widget.kind}`}
      />
    );
  }

  // Custom component loading error
  if (componentError) {
    return (
      <ErrorState
        error={componentError.message}
        hint="Failed to load widget component"
      />
    );
  }

  // Loading custom component
  if (loadingComponent) {
    return <Skeleton variant="default" />;
  }

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

  // Render widget with data
  return (
    <>
      {headerNotice}
      <WidgetComponent
        data={widgetData.data}
        loading={widgetData.loading}
        error={widgetData.error}
        options={widget.options}
        layoutHint={layoutHint || widget.layoutHint}
        onInteraction={(event: string) => {
          trackWidgetEvent('interaction', { widgetId, pluginId, event });
        }}
      />
    </>
  );
}
