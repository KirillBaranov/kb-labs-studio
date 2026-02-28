/**
 * Hook for widget form change handler
 *
 * Creates onChange handler for form widgets that auto-emits events
 * according to widget manifest configuration.
 *
 * Features:
 * - Auto-emit events on form value changes
 * - Payload mapping from manifest (payloadMap)
 * - Default payload: { value }
 * - Support for complex data merging
 *
 * @example
 * ```tsx
 * const handleChange = useWidgetChangeHandler(widget, widgetData.data, emit, widgetId);
 *
 * <Input onChange={handleChange} />
 * ```
 */

import * as React from 'react';

interface WidgetWithEvents {
  events?: {
    emit?: Array<
      | string
      | {
          name: string;
          payloadMap?: Record<string, string>;
        }
    >;
  };
}

/**
 * Create onChange handler that auto-emits events
 *
 * @param widget - Widget configuration with events.emit
 * @param widgetData - Current widget data for payload mapping
 * @param emit - Event emitter function
 * @param widgetId - Widget ID for debugging
 * @returns onChange handler function
 */
export function useWidgetChangeHandler(
  widget: WidgetWithEvents | undefined,
  widgetData: unknown,
  emit: (eventName: string, payload: Record<string, unknown>) => void,
  widgetId: string
): (value: unknown) => void {
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
          } else if (widgetData && typeof widgetData === 'object') {
            payload[payloadKey] = (widgetData as Record<string, unknown>)[dataKey];
          }
        }
      } else {
        // Default: emit { value }
        payload.value = value;
      }

      emit(eventName, payload);
    },
    [widget?.events?.emit, widgetData, emit, widgetId]
  );

  return handleChange;
}
