/**
 * Hook for dynamic widget component loading
 *
 * Handles lazy loading of custom widget components via dynamic imports.
 * Standard widgets use static mapping, custom widgets load on-demand.
 *
 * Features:
 * - Dynamic import for custom components
 * - Error handling with detailed messages
 * - Loading state management
 * - Automatic fallback to default export or first named export
 *
 * @example
 * ```tsx
 * const { component, loading, error } = useWidgetComponentLoader(widget);
 *
 * if (loading) return <Skeleton />;
 * if (error) return <ErrorState error={error.message} />;
 * if (component) return <component {...props} />;
 * ```
 */

import * as React from 'react';
import type { WidgetProps } from '@kb-labs/studio-contracts';

interface WidgetWithComponent {
  id?: string;
  component?: string;
}

export interface WidgetComponentLoaderState {
  /**
   * Loaded component (null if not loaded or standard widget)
   */
  component: React.ComponentType<WidgetProps> | null;

  /**
   * Whether component is currently loading
   */
  loading: boolean;

  /**
   * Error that occurred during loading
   */
  error: Error | null;
}

/**
 * Load custom widget component dynamically
 *
 * @param widget - Widget configuration with optional component path
 * @returns Component loading state
 */
export function useWidgetComponentLoader(
  widget: WidgetWithComponent | undefined
): WidgetComponentLoaderState {
  const [component, setComponent] = React.useState<React.ComponentType<WidgetProps> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!widget) {
      setLoading(false);
      return;
    }

    // If standard widget (no custom component), skip loading
    if (!widget.component) {
      setLoading(false);
      return;
    }

    // Load custom component dynamically
    setLoading(true);
    setError(null);

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
          setError(null);
        })
        .catch((e) => {
          setError(e instanceof Error ? e : new Error(String(e)));
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setLoading(false);
    }
  }, [widget]);

  return {
    component,
    loading,
    error,
  };
}
