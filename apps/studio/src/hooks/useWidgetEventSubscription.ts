/**
 * @module @kb-labs/studio-app/hooks/useWidgetEventSubscription
 * Custom hook for subscribing to widget events and mapping payloads
 *
 * Extracted from widget-renderer.tsx (Phase 2 refactoring)
 * Reduces component complexity by isolating event subscription logic
 */

import * as React from 'react';
import type { StudioRegistryEntry } from '@kb-labs/rest-api-contracts';
import { useWidgetEvents } from './useWidgetEvents';

/**
 * Event params and data state
 */
export interface WidgetEventState {
  /** Query parameters from event payload (primitives) */
  eventParams: Record<string, string | number | boolean>;
  /** Complex data from event payload (objects/arrays) */
  eventData: unknown | null;
}

/**
 * Hook to subscribe to widget events and map payload to params/data
 *
 * @param widget - Widget registry entry with event config
 * @param widgetId - Widget ID for tracking
 * @returns Event state (params and data)
 *
 * @example
 * ```tsx
 * const { eventParams, eventData } = useWidgetEventSubscription(widget, widgetId);
 * ```
 */
export function useWidgetEventSubscription(
  widget: StudioRegistryEntry | undefined,
  widgetId: string
): WidgetEventState {
  const { subscribe } = useWidgetEvents();
  const [eventParams, setEventParams] = React.useState<Record<string, string | number | boolean>>({});
  const [eventData, setEventData] = React.useState<unknown | null>(null);

  React.useEffect(() => {
    if (!widget?.events?.subscribe) {
      return;
    }

    const unsubscribes: Array<() => void> = [];

    for (const eventConfig of widget.events.subscribe) {
      const eventName = typeof eventConfig === 'string' ? eventConfig : eventConfig.name;
      const paramsMap = typeof eventConfig === 'object' ? eventConfig.paramsMap : undefined;

      const unsubscribe = subscribe(eventName, (payload) => {
        if (!payload || typeof payload !== 'object') {
          return;
        }

        // Map event payload to query params and/or direct data
        const mapped = mapEventPayload(payload as Record<string, unknown>, paramsMap);

        // Update params if any
        if (Object.keys(mapped.params).length > 0) {
          setEventParams((prev) => ({
            ...prev,
            ...mapped.params,
          }));
        }

        // Update data if we received complex objects
        if (Object.keys(mapped.data).length > 0) {
          setEventData(mapped.data);
        }
      });

      unsubscribes.push(unsubscribe);
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [widget?.events?.subscribe, subscribe, widgetId]);

  return { eventParams, eventData };
}

/**
 * Maps event payload to params (primitives) and data (complex objects)
 *
 * @param payload - Event payload from event bus
 * @param paramsMap - Optional mapping config (e.g., { workspace: 'workspace' })
 * @returns Mapped params and data
 *
 * @internal
 */
function mapEventPayload(
  payload: Record<string, unknown>,
  paramsMap?: Record<string, string>
): {
  params: Record<string, string | number | boolean>;
  data: Record<string, unknown>;
} {
  const params: Record<string, string | number | boolean> = {};
  const data: Record<string, unknown> = {};

  if (paramsMap) {
    // Use explicit mapping: paramsMap = { workspace: 'workspace', cards: 'cards' }
    for (const [paramKey, payloadKey] of Object.entries(paramsMap)) {
      const value = payload[payloadKey];
      if (value !== undefined && value !== null) {
        // If it's a primitive, add to params
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          params[paramKey] = value;
        } else {
          // If it's a complex object, store as direct data
          data[paramKey] = value;
        }
      }
    }
  } else {
    // No mapping - copy all payload fields directly
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          params[key] = value;
        } else {
          data[key] = value;
        }
      }
    }
  }

  return { params, data };
}
