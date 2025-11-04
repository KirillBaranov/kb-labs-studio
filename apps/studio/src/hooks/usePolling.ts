/**
 * @module @kb-labs/studio-app/hooks/usePolling
 * Polling hook with auto-clear and pause on hidden
 */

import { useEffect, useRef } from 'react';

/**
 * Polling hook
 * Simple setInterval with auto-clear, doesn't restart on every render
 * Pauses when document is hidden
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number
): void {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (intervalMs <= 0) {
      return;
    }

    // Check if document is visible
    const isVisible = () => document.visibilityState === 'visible';

    // Poll function
    const poll = async () => {
      if (isVisible()) {
        await callbackRef.current();
      }
    };

    // Initial call
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, intervalMs);

    // Pause/resume on visibility change
    const handleVisibilityChange = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (isVisible()) {
        // Resume polling
        poll();
        intervalRef.current = setInterval(poll, intervalMs);
      }
      // If hidden, polling is paused (no interval)
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs]);
}


