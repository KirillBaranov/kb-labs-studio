/**
 * @module @kb-labs/studio-app/providers/page-context
 * Page Context Provider - manages page-level state (filters, parameters) with URL sync
 */

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';

export interface PageContextValue {
  /** Current page context state */
  state: Record<string, unknown>;
  /** Update context state */
  setState: (updates: Record<string, unknown>) => void;
  /** Get a specific value from context */
  getValue: <T = unknown>(key: string) => T | undefined;
  /** Set a specific value in context */
  setValue: <T = unknown>(key: string, value: T) => void;
  /** Clear all context state */
  clear: () => void;
  /** Sync keys with URL query parameters */
  syncKeys: string[];
}

const PageContext = React.createContext<PageContextValue | null>(null);

export interface PageContextProviderProps {
  /** Keys to sync with URL query parameters */
  syncKeys?: string[];
  /** Initial state */
  initialState?: Record<string, unknown>;
  /** Children */
  children: React.ReactNode;
}

/**
 * PageContextProvider - provides page-level state management with URL sync
 */
export function PageContextProvider({
  syncKeys = [],
  initialState = {},
  children,
}: PageContextProviderProps): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setStateInternal] = React.useState<Record<string, unknown>>(() => {
    // Initialize from URL params if syncKeys are provided
    const urlState: Record<string, unknown> = {};
    for (const key of syncKeys) {
      const value = searchParams.get(key);
      if (value !== null) {
        try {
          urlState[key] = JSON.parse(value);
        } catch {
          urlState[key] = value;
        }
      }
    }
    return { ...initialState, ...urlState };
  });

  // Sync state changes to URL
  React.useEffect(() => {
    if (syncKeys.length === 0) {return;}

    const newSearchParams = new URLSearchParams(searchParams);
    let hasChanges = false;

    for (const key of syncKeys) {
      const value = state[key];
      if (value !== undefined && value !== null) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        if (newSearchParams.get(key) !== serialized) {
          newSearchParams.set(key, serialized);
          hasChanges = true;
        }
      } else {
        if (newSearchParams.has(key)) {
          newSearchParams.delete(key);
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [state, syncKeys, searchParams, setSearchParams]);

  // Sync URL changes to state
  React.useEffect(() => {
    if (syncKeys.length === 0) {return;}

    const urlUpdates: Record<string, unknown> = {};
    let hasUpdates = false;

    for (const key of syncKeys) {
      const urlValue = searchParams.get(key);
      const currentValue = state[key];

      if (urlValue !== null) {
        try {
          const parsed = JSON.parse(urlValue);
          if (JSON.stringify(currentValue) !== JSON.stringify(parsed)) {
            urlUpdates[key] = parsed;
            hasUpdates = true;
          }
        } catch {
          if (currentValue !== urlValue) {
            urlUpdates[key] = urlValue;
            hasUpdates = true;
          }
        }
      } else if (currentValue !== undefined) {
        urlUpdates[key] = undefined;
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      setStateInternal((prev) => ({ ...prev, ...urlUpdates }));
    }
  }, [searchParams, syncKeys]); // Don't include state to avoid loops

  const setState = React.useCallback((updates: Record<string, unknown>) => {
    setStateInternal((prev) => ({ ...prev, ...updates }));
  }, []);

  const getValue = React.useCallback(<T = unknown,>(key: string): T | undefined => {
    return state[key] as T | undefined;
  }, [state]);

  const setValue = React.useCallback(<T = unknown,>(key: string, value: T) => {
    setStateInternal((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clear = React.useCallback(() => {
    setStateInternal({});
  }, []);

  const value: PageContextValue = React.useMemo(
    () => ({
      state,
      setState,
      getValue,
      setValue,
      clear,
      syncKeys,
    }),
    [state, setState, getValue, setValue, clear, syncKeys]
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

/**
 * Hook to access page context
 */
export function usePageContext(): PageContextValue {
  const context = React.useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within PageContextProvider');
  }
  return context;
}

