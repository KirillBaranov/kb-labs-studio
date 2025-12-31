/**
 * @module @kb-labs/studio-app/hooks/useWidgetEvents
 * Hook for widget event bus (pub/sub)
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Event bus for page-level widget communication
 */
class WidgetEventBus {
  private listeners: Map<string, Set<(payload?: unknown) => void>> = new Map();
  private pageId: string;

  constructor(pageId: string) {
    this.pageId = pageId;
  }

  /**
   * Subscribe to an event
   */
  subscribe(eventName: string, callback: (payload?: unknown) => void): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventName);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(eventName);
        }
      }
    };
  }

  /**
   * Emit an event
   */
  emit(eventName: string, payload?: unknown): void {
    const callbacks = this.listeners.get(eventName);
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`[EventBus] Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Global event bus instances per page
const eventBuses = new Map<string, WidgetEventBus>();

/**
 * Get or create event bus for current page
 */
function getEventBus(pageId: string): WidgetEventBus {
  if (!eventBuses.has(pageId)) {
    eventBuses.set(pageId, new WidgetEventBus(pageId));
  }
  return eventBuses.get(pageId)!;
}

/**
 * Hook for widget event bus
 */
export function useWidgetEvents() {
  const location = useLocation();
  const pageId = `${location.pathname}${location.search}`;
  const eventBusRef = useRef<WidgetEventBus | null>(null);

  // Initialize event bus for this page - update if pageId changes
  eventBusRef.current = getEventBus(pageId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't clear immediately - widgets might still be mounted
      // Event bus will be cleaned up when page changes
    };
  }, [pageId]);

  // Cleanup old event buses when page changes
  useEffect(() => {
    return () => {
      // Don't auto-cleanup - EventBus should persist for the entire page lifecycle
      // Cleanup only happens when pageId actually changes (navigating away)
      // The eventBuses Map will naturally hold one instance per unique pageId
    };
  }, [pageId]);

  const subscribe = useCallback(
    (eventName: string, callback: (payload?: unknown) => void) => {
      return getEventBus(pageId).subscribe(eventName, callback);
    },
    [pageId]
  );

  const emit = useCallback(
    (eventName: string, payload?: unknown) => {
      getEventBus(pageId).emit(eventName, payload);
    },
    [pageId]
  );

  return {
    subscribe,
    emit,
  };
}

