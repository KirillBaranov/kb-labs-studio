/**
 * Higher-Order Component (HOC) for widget state management
 *
 * Wraps widget components with common loading, error, and empty state handling.
 * Reduces boilerplate in widget-renderer.tsx by extracting repeated patterns.
 *
 * Features:
 * - Loading state (skeleton)
 * - Error state (error message + hint)
 * - Component loading error state
 * - Widget not found state
 * - Invalid configuration state
 *
 * @example
 * ```tsx
 * const EnhancedWidget = WithWidgetState({
 *   component: MyWidgetComponent,
 *   widgetId: 'widget-123',
 *   widget: registryEntry,
 *   loadingComponent: false,
 *   componentError: null,
 * });
 *
 * <EnhancedWidget data={data} {...props} />
 * ```
 */

import * as React from 'react';
// TODO: replace with new widget system components
const ErrorState = ({ error, hint }: { error: string; hint?: string; retryable?: boolean; onRetry?: () => void }) => (
  <div style={{ padding: 16, color: 'red' }}>{error}{hint ? ` — ${hint}` : ''}</div>
);
const Skeleton = (_props: { variant?: string }) => <div style={{ padding: 16 }}>Loading…</div>;

/**
 * Widget registry entry interface (simplified for HOC validation)
 */
interface WidgetEntry {
  data?: {
    source?: unknown;
  };
  kind?: string;
}

export interface WithWidgetStateProps {
  /**
   * Widget component to render
   */
  component: React.ComponentType<any> | null;

  /**
   * Widget ID (for error messages)
   */
  widgetId: string;

  /**
   * Widget registry entry (for validation)
   */
  widget: WidgetEntry | undefined;

  /**
   * Whether custom component is currently loading
   */
  loadingComponent: boolean;

  /**
   * Error that occurred while loading custom component
   */
  componentError: Error | null;
}

/**
 * HOC that handles loading, error, and validation states for widgets
 *
 * Returns the original component wrapped with state checks, or renders
 * appropriate loading/error UI if conditions aren't met.
 */
export function WithWidgetState(props: WithWidgetStateProps): React.ComponentType<any> {
  const { component, widgetId, widget, loadingComponent, componentError } = props;

  return function WidgetStateWrapper(widgetProps: any) {
    // Widget not found in registry
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

    // Component not found
    if (!component) {
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

    // All validation passed - render component
    const WidgetComponent = component;
    return <WidgetComponent {...widgetProps} />;
  };
}
