/**
 * Hook for circular dependency detection in widget rendering tree
 *
 * Tracks visited widget IDs to prevent infinite recursion when rendering
 * composite widgets with nested children.
 *
 * @example
 * ```tsx
 * const { isCircular, markVisited, clearVisited } = useCircularDependencyDetection();
 *
 * // Before rendering children
 * clearVisited();
 *
 * childrenIds.map(childId => {
 *   if (isCircular(childId)) {
 *     console.warn('Circular dependency detected');
 *     return null;
 *   }
 *   markVisited(childId);
 *   return <WidgetRenderer widgetId={childId} />;
 * });
 * ```
 */

import * as React from 'react';

export interface CircularDependencyDetection {
  /**
   * Check if widget ID has already been visited in current render tree
   */
  isCircular: (widgetId: string) => boolean;

  /**
   * Mark widget ID as visited
   */
  markVisited: (widgetId: string) => void;

  /**
   * Clear all visited widget IDs
   * Call this before rendering a new set of children to prevent false positives on re-renders
   */
  clearVisited: () => void;
}

export function useCircularDependencyDetection(): CircularDependencyDetection {
  const visitedWidgets = React.useRef<Set<string>>(new Set());

  const isCircular = React.useCallback((widgetId: string): boolean => {
    return visitedWidgets.current.has(widgetId);
  }, []);

  const markVisited = React.useCallback((widgetId: string): void => {
    visitedWidgets.current.add(widgetId);
  }, []);

  const clearVisited = React.useCallback((): void => {
    visitedWidgets.current.clear();
  }, []);

  return {
    isCircular,
    markVisited,
    clearVisited,
  };
}
