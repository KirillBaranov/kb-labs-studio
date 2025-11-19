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
 * Layout hint for grid layouts
 */
export interface LayoutHint {
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  /** Height control: 'auto' (fit content), number (fixed px), 'fit-content' (minimal) */
  height?: 'auto' | number | 'fit-content';
}

/**
 * Base widget props
 */
export interface BaseWidgetProps<T = unknown, O = unknown> extends WidgetState<T> {
  options?: O;
  /** Widget title from manifest */
  title?: string;
  /** Widget description from manifest */
  description?: string;
  /** Show title in widget card (default: true for charts, false for others) */
  showTitle?: boolean;
  /** Show description in widget card (default: false) */
  showDescription?: boolean;
  /** Layout hint for grid layouts */
  layoutHint?: LayoutHint;
  /** Emit event to event bus */
  emitEvent?: (eventName: string, payload?: unknown) => void;
  /** Subscribe to event from event bus */
  subscribeToEvent?: (eventName: string, callback: (payload?: unknown) => void) => () => void;
  /** Interaction callback */
  onInteraction?: (event: string) => void;
}

/**
 * Form field types
 */
export type FormFieldType = 'text' | 'textarea' | 'select' | 'number' | 'checkbox';

/**
 * Form field configuration
 */
export interface FormField {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: Array<{ label: string; value: string | number }>; // For select fields
  rows?: number; // For textarea
}

/**
 * Form widget options
 */
export interface FormWidgetOptions {
  fields: FormField[];
  submitLabel?: string;
  onSuccess?: {
    emitEvent?: string;
    eventPayloadFactory?: (data: unknown, formData: Record<string, unknown>) => unknown;
  };
}

/**
 * Input display widget options
 */
export interface InputDisplayWidgetOptions {
  input: {
    type: 'text' | 'textarea';
    placeholder?: string;
    submitLabel?: string;
    rows?: number;
  };
  display?: {
    kind?: string; // Widget kind for displaying results
    subscribeTo?: string; // Event name to subscribe to
  };
}


