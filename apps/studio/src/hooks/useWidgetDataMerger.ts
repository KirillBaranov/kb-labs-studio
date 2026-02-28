/**
 * Hook for merging widget data from multiple sources
 *
 * Handles merging of:
 * - Event data (from event subscriptions) - highest priority
 * - Fetched data (from API/data source) - fallback
 *
 * Event data takes precedence over fetched data to allow real-time updates
 * via event bus to override initial/cached data.
 *
 * @example
 * ```tsx
 * const { eventData } = useWidgetEventSubscription(widget, widgetId);
 * const widgetData = useWidgetData(widget, eventParams);
 * const finalData = useWidgetDataMerger(eventData, widgetData.data);
 *
 * <WidgetComponent data={finalData} {...props} />
 * ```
 */

import * as React from 'react';

/**
 * Merge event data with fetched data
 *
 * @param eventData - Data from event subscriptions (highest priority)
 * @param fetchedData - Data from API/data source (fallback)
 * @returns Final merged data (eventData if present, otherwise fetchedData)
 */
export function useWidgetDataMerger(
  eventData: unknown | null,
  fetchedData: unknown
): unknown {
  const finalData = React.useMemo(() => {
    if (eventData) {
      // If we have event data, use it (overrides fetched data)
      return eventData;
    }
    return fetchedData;
  }, [eventData, fetchedData]);

  return finalData;
}
