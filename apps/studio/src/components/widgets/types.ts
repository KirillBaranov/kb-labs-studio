/**
 * @module @kb-labs/studio-app/components/widgets/types
 * Widget type definitions
 */

/**
 * Widget state
 */
export interface WidgetState<T = unknown> {
  data?: T;
  loading: boolean;
  error?: string | null;
}

/**
 * Base widget props
 */
export interface BaseWidgetProps<T = unknown, O = unknown> extends WidgetState<T> {
  options?: O;
}


