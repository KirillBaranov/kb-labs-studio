/**
 * @module @kb-labs/studio-data-client/hooks/use-agent-websocket
 * React hook for WebSocket connection to agent turn snapshots
 *
 * SIMPLIFIED (Phase 2): Receives ready-made Turn snapshots from backend
 * No more event reconstruction, deduplication, or complex merging!
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ServerMessage, Turn } from '@kb-labs/agent-contracts';

export interface UseAgentWebSocketOptions {
  /** WebSocket URL for event streaming */
  url: string | null;
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;
  /** Reconnect delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Max reconnect attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Callback for connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void;
  /** Callback for run completion */
  onComplete?: (success: boolean, summary: string) => void;
  /** Callback when turn data changed (conversation snapshot or turn snapshot) */
  onTurnsChanged?: () => void;
  /** Callback for errors */
  onError?: (error: { code: string; message: string }) => void;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface UseAgentWebSocketReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether connected */
  isConnected: boolean;
  /** All turns (ready-made from backend) */
  turns: Turn[];
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
  /** Clear turns */
  clearTurns: () => void;
}

/**
 * React hook for managing WebSocket connection to agent turn snapshots.
 *
 * All mutable connection state lives in refs to avoid stale-closure bugs
 * inside ws.onclose / ws.onmessage callbacks.  React state is only used
 * for values that need to trigger a re-render.
 */
export function useAgentWebSocket(options: UseAgentWebSocketOptions): UseAgentWebSocketReturn {
  const {
    url,
    autoReconnect = true,
    reconnectDelay = 1000,
    maxReconnectAttempts = 5,
    onStatusChange,
    onComplete,
    onTurnsChanged,
    onError,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<{ success: boolean; summary: string } | null>(null);

  // Refs that hold mutable connection state — never stale inside callbacks
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // shouldReconnectRef is the single source of truth for whether reconnection is allowed.
  // Set to false when we intentionally close (url change, disconnect()) so onclose won't loop.
  const shouldReconnectRef = useRef(false);
  const isCompletedRef = useRef(false);  // mirrors isCompleted state without closure staleness

  // Keep latest callbacks in refs so ws.onmessage never captures a stale version
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const onTurnsChangedRef = useRef(onTurnsChanged);
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onTurnsChangedRef.current = onTurnsChanged; }, [onTurnsChanged]);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);

  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    onStatusChangeRef.current?.(newStatus);
  }, []);

  // Tear down the current socket and any pending reconnect timer.
  // Does NOT touch React state — callers decide what state changes are needed.
  const closeSocket = useCallback(() => {
    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent onclose from firing after intentional close
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Open a new WebSocket to the given URL.
  // shouldReconnectRef must already be set by the caller before calling openSocket.
  const openSocket = useCallback((wsUrl: string) => {
    closeSocket();
    updateStatus('connecting');
    reconnectAttemptsRef.current = 0;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[useAgentWebSocket] Connected:', wsUrl);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as ServerMessage;

        switch (data.type) {
          case 'conversation:snapshot': {
            const { completedTurns, activeTurns } = data.payload;
            const incoming = [...completedTurns, ...activeTurns].sort((a, b) => a.sequence - b.sequence);
            console.log(`[useAgentWebSocket] conversation:snapshot — ${incoming.length} turns`);
            isCompletedRef.current = false;
            setIsCompleted(false);
            setCompletionResult(null);
            setTurns((prev) => {
              if (prev.length === 0) return incoming;
              // Keep any locally-streamed turn that has more steps than the snapshot
              const merged = new Map<string, Turn>();
              for (const t of incoming) merged.set(t.id, t);
              for (const t of prev) {
                const snap = merged.get(t.id);
                if (snap && t.status === 'streaming' && snap.status === 'streaming' && t.steps.length > snap.steps.length) {
                  merged.set(t.id, t);
                }
              }
              return [...merged.values()].sort((a, b) => a.sequence - b.sequence);
            });
            onTurnsChangedRef.current?.();
            break;
          }

          case 'turn:snapshot': {
            const { turn } = data.payload;
            isCompletedRef.current = false;
            setIsCompleted(false);
            setCompletionResult(null);
            setTurns((prev) => {
              const updated = [...prev];
              const idx = updated.findIndex((t) => t.id === turn.id);
              if (idx >= 0) {
                const existing = updated[idx]!;
                if (existing.status === 'streaming' && turn.status === 'streaming' && turn.steps.length < existing.steps.length) {
                  return prev; // discard stale snapshot
                }
                updated[idx] = turn;
              } else {
                const insertAt = updated.findIndex((t) => t.sequence > turn.sequence);
                if (insertAt >= 0) updated.splice(insertAt, 0, turn);
                else updated.push(turn);
              }
              return updated;
            });
            onTurnsChangedRef.current?.();
            break;
          }

          case 'connection:ready': {
            reconnectAttemptsRef.current = 0;
            updateStatus('connected');
            break;
          }

          case 'run:completed': {
            const { success, summary } = data.payload;
            isCompletedRef.current = true;
            setIsCompleted(true);
            setCompletionResult({ success, summary });
            onCompleteRef.current?.(success, summary);
            break;
          }

          case 'error': {
            const { code, message } = data.payload;
            setError({ code, message });
            onErrorRef.current?.({ code, message });
            break;
          }

          case 'correction:ack': {
            console.log('[useAgentWebSocket] correction:ack', data.payload);
            break;
          }
        }
      } catch (err) {
        console.error('[useAgentWebSocket] Failed to parse message:', err);
      }
    };

    ws.onerror = () => {
      updateStatus('error');
    };

    ws.onclose = (event) => {
      console.log('[useAgentWebSocket] Closed:', event.code, event.reason);

      // Only reconnect if explicitly allowed AND run is not done AND we haven't hit the limit
      if (
        shouldReconnectRef.current &&
        !isCompletedRef.current &&
        autoReconnect &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        reconnectAttemptsRef.current++;
        updateStatus('reconnecting');
        reconnectTimeoutRef.current = setTimeout(() => {
          if (shouldReconnectRef.current) {
            openSocket(wsUrl);
          }
        }, reconnectDelay * reconnectAttemptsRef.current);
      } else {
        updateStatus('disconnected');
      }
    };
  }, [autoReconnect, closeSocket, maxReconnectAttempts, reconnectDelay, updateStatus]);

  // Public disconnect — permanently stops reconnection for current session
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    closeSocket();
    updateStatus('disconnected');
  }, [closeSocket, updateStatus]);

  // Public reconnect — re-enables reconnection and opens socket
  const reconnect = useCallback(() => {
    if (!url) return;
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    openSocket(url);
  }, [url, openSocket]);

  const send = useCallback((msg: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('[useAgentWebSocket] Cannot send — not connected');
    }
  }, []);

  const clearTurns = useCallback(() => {
    setTurns([]);
    setError(null);
    isCompletedRef.current = false;
    setIsCompleted(false);
    setCompletionResult(null);
  }, []);

  // React to URL changes: tear down old socket, reset state, connect to new URL
  useEffect(() => {
    // Stop any reconnect loop from the previous URL immediately
    shouldReconnectRef.current = false;
    closeSocket();

    // Reset all state for the new session
    setTurns([]);
    setError(null);
    isCompletedRef.current = false;
    setIsCompleted(false);
    setCompletionResult(null);

    if (url) {
      shouldReconnectRef.current = true;
      openSocket(url);
    } else {
      updateStatus('disconnected');
    }

    return () => {
      // Component unmounting or url changing again — stop reconnects and close
      shouldReconnectRef.current = false;
      closeSocket();
    };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    status,
    isConnected: status === 'connected',
    turns,
    error,
    isCompleted,
    completionResult,
    send,
    disconnect,
    reconnect,
    clearTurns,
  };
}
