/**
 * @module @kb-labs/studio-app/utils/analytics
 * Analytics helpers for widget events
 */

/**
 * Track widget event
 * Fire-and-forget, analytics failures should not break execution
 */
export function trackWidgetEvent(
  event: 'mounted' | 'error' | 'interaction',
  data: {
    widgetId: string;
    pluginId: string;
    code?: string;
    event?: string;
  }
): void {
  try {
    // TODO: Integrate with @kb-labs/analytics-sdk-node
    // For now, just log
    console.log('[analytics]', `plugin.ui.widget.${event}`, data);
  } catch (e) {
    // Silently fail - analytics should not break execution
    console.warn('[analytics] Failed to track event:', e);
  }
}


