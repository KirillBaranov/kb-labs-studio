/**
 * @module @kb-labs/studio-app/utils/analytics
 * Analytics helpers for widget events
 */

import { createStudioLogger } from './logger.js';

const analyticsLogger = createStudioLogger('analytics');

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
    analyticsLogger.info('Widget analytic event', {
      event,
      ...data,
    });
  } catch (e) {
    // Silently fail - analytics should not break execution
    analyticsLogger.warn('Failed to track widget event', {
      event,
      data,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}


