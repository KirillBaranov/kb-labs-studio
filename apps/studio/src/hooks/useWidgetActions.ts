/**
 * @module @kb-labs/studio-app/hooks/useWidgetActions
 * Hook for handling widget actions
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WidgetAction, ActionExecutionResult } from '../types/actions.js';
// eslint-disable-next-line import/extensions
import { useWidgetEvents } from './useWidgetEvents.js';

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
  const { pluginId, basePath = '/api/v1', callbacks = {} } = options;
  const navigate = useNavigate();
  const { emit } = useWidgetEvents();

  const executeAction = useCallback(
    async (action: WidgetAction): Promise<ActionExecutionResult> => {
      if (!action.handler) {
        return { success: false, error: 'No handler defined for action' };
      }

      try {
        switch (action.handler.type) {
          case 'rest': {
            const { routeId, method = 'GET', body, headers = {} } = action.handler.config;
            
            // Extract package name from pluginId (e.g., "@kb-labs/mind" -> "mind")
            const packageName = pluginId?.includes('/')
              ? pluginId.split('/').pop() || pluginId
              : pluginId || '';

            const url = `${basePath}/plugins/${packageName}/${routeId}`;
            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
                ...headers,
              },
              body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data };
          }

          case 'navigate': {
            const { path, target = '_self' } = action.handler.config;
            if (target === '_blank') {
              window.open(path, '_blank');
            } else {
              navigate(path);
            }
            return { success: true };
          }

          case 'callback': {
            const { callbackId, args } = action.handler.config;
            const callback = callbacks[callbackId];
            if (!callback) {
              throw new Error(`Callback ${callbackId} not found`);
            }
            const data = await callback(args);
            return { success: true, data };
          }

          case 'event': {
            const { eventName, payload } = action.handler.config;
            emit(eventName, payload);
            return { success: true };
          }

          case 'modal': {
            // Modal handling will be done by Modal manager
            emit('modal:open', action.handler.config);
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
    [pluginId, basePath, callbacks, navigate, emit]
  );

  const handleAction = useCallback(
    async (action: WidgetAction): Promise<ActionExecutionResult> => {
      // Check if action is disabled
      if (action.disabled === true) {
        return { success: false, error: 'Action is disabled' };
      }

      // Execute action
      return executeAction(action);
    },
    [executeAction]
  );

  return {
    executeAction,
    handleAction,
  };
}

