/**
 * @module @kb-labs/studio-app/hooks/useWidgetActions
 * Hook for handling widget actions
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WidgetAction } from '@kb-labs/studio-contracts';
// eslint-disable-next-line import/extensions
import { useWidgetEvents } from './useWidgetEvents';
import { studioConfig } from '../config/studio.config';

/**
 * Action execution result
 */
export interface ActionExecutionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface UseWidgetActionsOptions {
  /** Widget ID */
  widgetId?: string;
  /** Plugin ID */
  pluginId?: string;
  /** Base path for REST API */
  basePath?: string;
  /** Custom callback handlers */
  callbacks?: Record<string, (args?: Record<string, unknown>) => Promise<unknown>>;
}

/**
 * Hook for handling widget actions
 */
export function useWidgetActions(options: UseWidgetActionsOptions = {}) {
  const { pluginId, basePath, callbacks = {} } = options;
  const navigate = useNavigate();
  const { emit } = useWidgetEvents();

  // Use studioConfig.apiBaseUrl as default, just like WidgetRenderer does
  const effectiveBasePath = basePath || studioConfig.apiBaseUrl;

  const executeAction = useCallback(
    async (action: WidgetAction, widgetData?: unknown): Promise<ActionExecutionResult> => {
      if (!action.handler) {
        return { success: false, error: 'No handler defined for action' };
      }

      try {
        switch (action.handler.type) {
          case 'rest': {
            const { routeId, method = 'POST', bodyMap, onSuccess } = action.handler;

            // Extract package name from pluginId (e.g., "@kb-labs/mind" -> "mind")
            const packageName = pluginId?.includes('/')
              ? pluginId.split('/').pop() || pluginId
              : pluginId || '';

            // Build request body from bodyMap if provided
            let body: unknown = undefined;
            if (bodyMap && widgetData) {
              body = {};
              for (const [targetKey, sourceKey] of Object.entries(bodyMap)) {
                const value = (widgetData as Record<string, unknown>)[sourceKey];
                if (value !== undefined) {
                  (body as Record<string, unknown>)[targetKey] = value;
                }
              }
            }

            const url = `${effectiveBasePath}/plugins/${packageName}/${routeId}`;
            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
              },
              ...(body && { body: JSON.stringify(body) }),
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();

            // Emit event on success if configured
            if (onSuccess?.emitEvent) {
              let payload = onSuccess.eventPayload !== undefined
                ? onSuccess.eventPayload
                : responseData;

              // Unwrap envelope if present (ok: true, data: {...}) -> use data field
              if (payload && typeof payload === 'object' && 'ok' in payload && 'data' in payload) {
                payload = (payload as any).data;
              }

              emit(onSuccess.emitEvent, payload);
            }

            return { success: true, data: responseData };
          }

          case 'navigate': {
            const { target } = action.handler;
            navigate(target);
            return { success: true };
          }

          case 'emit': {
            const { event, payload } = action.handler;
            emit(event, payload);
            return { success: true };
          }

          default:
            return { success: false, error: `Unknown handler type: ${(action.handler as any).type}` };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    },
    [pluginId, effectiveBasePath, callbacks, navigate, emit]
  );

  const handleAction = useCallback(
    async (action: WidgetAction, widgetData?: unknown): Promise<ActionExecutionResult> => {
      // Check if action is disabled
      if (action.disabled === true) {
        return { success: false, error: 'Action is disabled' };
      }

      // Execute action
      return executeAction(action, widgetData);
    },
    [executeAction]
  );

  return {
    executeAction,
    handleAction,
  };
}

