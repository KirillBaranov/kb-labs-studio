/**
 * @module @kb-labs/studio-data-client/hooks/use-agent-websocket
 * React hook for WebSocket connection to agent event stream
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ServerMessage, AgentEvent } from '@kb-labs/agent-contracts';

export interface UseAgentWebSocketOptions {
  /** WebSocket URL for event streaming */
  url: string | null;
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;
  /** Reconnect delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Max reconnect attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Callback for events */
  onEvent?: (event: AgentEvent) => void;
  /** Callback for connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void;
  /** Callback for run completion */
  onComplete?: (success: boolean, summary: string) => void;
  /** Callback for errors */
  onError?: (error: { code: string; message: string }) => void;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface UseAgentWebSocketReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether connected */
  isConnected: boolean;
  /** All received events */
  events: AgentEvent[];
  /** Last received event */
  lastEvent: AgentEvent | null;
  /** Last error */
  error: { code: string; message: string } | null;
  /** Whether run is completed */
  isCompleted: boolean;
  /** Run completion result */
  completionResult: { success: boolean; summary: string } | null;
  /** Send a message to server (e.g., correction, stop) */
  send: (message: unknown) => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Manually reconnect */
  reconnect: () => void;
  /** Clear events */
  clearEvents: () => void;
}

/**
 * React hook for managing WebSocket connection to agent event stream
 */
export function useAgentWebSocket(options: UseAgentWebSocketOptions): UseAgentWebSocketReturn {
  const {
    url,
    autoReconnect = true,
    reconnectDelay = 1000,
    maxReconnectAttempts = 5,
    onEvent,
    onStatusChange,
    onComplete,
    onError,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<AgentEvent | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<{ success: boolean; summary: string } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeqRef = useRef<number>(0); // Track last received seq for gap detection

  // Update status and notify
  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // Handle incoming message
  const handleMessage = useCallback((data: ServerMessage) => {
    switch (data.type) {
      case 'agent:event': {
        const event = data.payload;

        // Gap detection: check if we missed events
        if (event.seq !== undefined) {
          if (lastSeqRef.current > 0 && event.seq > lastSeqRef.current + 1) {
            console.warn(`[useAgentWebSocket] Gap detected: expected seq ${lastSeqRef.current + 1}, got ${event.seq}`);
          }
          lastSeqRef.current = event.seq;
        }

        setEvents((prev) => [...prev, event]);
        setLastEvent(event);
        onEvent?.(event);
        break;
      }

      case 'connection:ready': {
        updateStatus('connected');
        reconnectAttemptsRef.current = 0;
        break;
      }

      case 'run:completed': {
        const { success, summary } = data.payload;
        setIsCompleted(true);
        setCompletionResult({ success, summary });
        onComplete?.(success, summary);
        break;
      }

      case 'error': {
        const { code, message } = data.payload;
        setError({ code, message });
        onError?.({ code, message });
        break;
      }

      case 'correction:ack': {
        // Could emit an event or update state here
        // For now, just log
        console.log('[useAgentWebSocket] Correction acknowledged:', data.payload);
        break;
      }
    }
  }, [onEvent, onComplete, onError, updateStatus]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!url) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    updateStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      // Status will be updated when we receive 'connection:ready'
      console.log('[useAgentWebSocket] WebSocket opened');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ServerMessage;
        handleMessage(data);
      } catch (err) {
        console.error('[useAgentWebSocket] Failed to parse message:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('[useAgentWebSocket] WebSocket error:', event);
      updateStatus('error');
    };

    ws.onclose = (event) => {
      console.log('[useAgentWebSocket] WebSocket closed:', event.code, event.reason);

      if (!isCompleted && autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        updateStatus('reconnecting');
        reconnectAttemptsRef.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay * reconnectAttemptsRef.current);
      } else {
        updateStatus('disconnected');
      }
    };
  }, [url, autoReconnect, reconnectDelay, maxReconnectAttempts, handleMessage, updateStatus, isCompleted]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    updateStatus('disconnected');
  }, [updateStatus]);

  // Reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Send message
  const send = useCallback((message: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[useAgentWebSocket] Cannot send - WebSocket not connected');
    }
  }, []);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
    setError(null);
    setIsCompleted(false);
    setCompletionResult(null);
    lastSeqRef.current = 0; // Reset sequence tracking
  }, []);

  // Connect when URL changes
  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    status,
    isConnected: status === 'connected',
    events,
    lastEvent,
    error,
    isCompleted,
    completionResult,
    send,
    disconnect,
    reconnect,
    clearEvents,
  };
}
