/**
 * @module @kb-labs/studio-data-client/hooks/use-job-events
 * React hook for subscribing to job events via SSE with fallback to polling
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { JobEventType } from './types';

// Type for job response data
interface JobResponseData {
  jobId: string;
  status: string;
  progress?: number;
  error?: string;
}

/**
 * Job event structure
 */
export interface JobEvent {
  type: JobEventType;
  jobId: string;
  timestamp: string;
  data?: {
    status?: string;
    progress?: number;
    error?: string;
  };
}

/**
 * Hook options
 */
export interface UseJobEventsOptions {
  enabled?: boolean;
  pollInterval?: number; // Polling interval in ms (fallback mode)
  onEvent?: (event: JobEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * Hook result
 */
export interface UseJobEventsResult {
  events: JobEvent[];
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
}

/**
 * Use job events hook with SSE support and polling fallback
 */
export function useJobEvents(
  jobId: string | null,
  options: UseJobEventsOptions = {}
): UseJobEventsResult {
  const {
    enabled = true,
    pollInterval = 1000,
    onEvent,
    onError,
    onComplete,
  } = options;

  const [events, setEvents] = useState<JobEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const useSSERef = useRef(true); // Try SSE first

  const reconnect = useCallback(() => {
    // Clear existing connections
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    
    // Reset state
    setEvents([]);
    setError(null);
    setIsConnected(false);
    useSSERef.current = true;
  }, []);

  useEffect(() => {
    if (!enabled || !jobId) {
      return;
    }

    // Get API base URL from window or use default
    // In Studio, this is set via studioConfig.apiBaseUrl
    // For standalone usage, can be set via global or env
    // baseUrl already contains /api/v1, so we use relative paths
    const apiBaseUrl = (typeof window !== 'undefined' && (window as any).__KB_LABS_API_BASE_URL__) 
      || import.meta.env.VITE_API_BASE_URL 
      || 'http://localhost:5050/api/v1';
    const eventsUrl = `${apiBaseUrl}/jobs/${jobId}/events`;

    // Try SSE first
    if (useSSERef.current) {
      try {
        const eventSource = new EventSource(eventsUrl);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (e) => {
          try {
            const event: JobEvent = JSON.parse(e.data);
            setEvents((prev) => [...prev, event]);
            onEvent?.(event);

            // Check if job is complete
            if (event.type === 'job.finished' || event.type === 'job.failed') {
              eventSource.close();
              setIsConnected(false);
              onComplete?.();
            }
          } catch (_err) {
            setError(err instanceof Error ? err : new Error('Failed to parse event'));
            onError?.(err instanceof Error ? err : new Error('Failed to parse event'));
          }
        };

        eventSource.onerror = (_event) => {
          // SSE failed, fallback to polling
          eventSource.close();
          eventSourceRef.current = null;
          useSSERef.current = false;
          setIsConnected(false);
          
          // Start polling fallback
          const poll = async () => {
            try {
              const response = await fetch(`${apiBaseUrl}/jobs/${jobId}`);
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }
              
              const data = await response.json() as JobResponseData;
              const currentStatus = data.status;
              
              // Check if status changed
              const lastEvent = events[events.length - 1];
              if (!lastEvent || lastEvent.data?.status !== currentStatus) {
                const event: JobEvent = {
                  type: currentStatus === 'completed' ? 'job.finished' : 
                        currentStatus === 'failed' ? 'job.failed' : 
                        currentStatus === 'running' ? 'job.started' : 'job.queued',
                  jobId,
                  timestamp: new Date().toISOString(),
                  data: {
                    status: currentStatus,
                    progress: data.progress,
                    error: data.error,
                  },
                };
                
                setEvents((prev) => [...prev, event]);
                onEvent?.(event);

                if (currentStatus === 'completed' || currentStatus === 'failed' || currentStatus === 'cancelled') {
                  if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                  }
                  onComplete?.();
                }
              }
            } catch (_err) {
              const errorInstance = err instanceof Error ? err : new Error('Polling failed');
              setError(errorInstance);
              onError?.(errorInstance);
            }
          };

          // Start polling immediately
          poll();
          pollingRef.current = setInterval(poll, pollInterval);
        };

        // Cleanup
        return () => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        };
      } catch (_err) {
        // SSE not supported, fallback to polling
        useSSERef.current = false;
      }
    }

    // Polling fallback (if SSE not available or disabled)
    if (!useSSERef.current && !pollingRef.current) {
      // Get API base URL (same as above)
      // baseUrl already contains /api/v1, so we use full URL
      const apiBaseUrl = (typeof window !== 'undefined' && (window as any).__KB_LABS_API_BASE_URL__) 
        || import.meta.env.VITE_API_BASE_URL 
        || 'http://localhost:5050/api/v1';
      
      const poll = async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/jobs/${jobId}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json() as JobResponseData;
          const currentStatus = data.status;
          
          // Check if status changed
          setEvents((prev) => {
            const lastEvent = prev[prev.length - 1];
            if (!lastEvent || lastEvent.data?.status !== currentStatus) {
              const event: JobEvent = {
                type: currentStatus === 'completed' ? 'job.finished' : 
                      currentStatus === 'failed' ? 'job.failed' : 
                      currentStatus === 'running' ? 'job.started' : 'job.queued',
                jobId,
                timestamp: new Date().toISOString(),
                data: {
                  status: currentStatus,
                  progress: data.progress,
                  error: data.error,
                },
              };
              
              onEvent?.(event);
              
              if (currentStatus === 'completed' || currentStatus === 'failed' || currentStatus === 'cancelled') {
                if (pollingRef.current) {
                  clearInterval(pollingRef.current);
                  pollingRef.current = null;
                }
                onComplete?.();
              }
              
              return [...prev, event];
            }
            return prev;
          });
          
          setIsConnected(true);
          setError(null);
        } catch (_err) {
          const errorInstance = err instanceof Error ? err : new Error('Polling failed');
          setError(errorInstance);
          onError?.(errorInstance);
          setIsConnected(false);
        }
      };

      // Start polling immediately
      poll();
      pollingRef.current = setInterval(poll, pollInterval);

      // Cleanup
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [jobId, enabled, pollInterval, onEvent, onError, onComplete, events]);

  return {
    events,
    isConnected,
    error,
    reconnect,
  };
}

