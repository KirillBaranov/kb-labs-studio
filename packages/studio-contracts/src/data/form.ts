/**
 * @module @kb-labs/studio-contracts/data/form
 * Data contracts for form widgets (6 widgets).
 */

import type { SelectOptionItem, CheckboxItem, FormFieldDef } from '../options/form.js';

/**
 * Form field error.
 */
export interface FormFieldError {
  /** Field name */
  field: string;
  /** Error message */
  message: string;
  /** Error type */
  type?: string;
}

/**
 * Data for `form` widget.
 */
export interface FormData {
  /** Form values (key = field name) */
  values: Record<string, unknown>;
  /** Field errors */
  errors?: FormFieldError[];
  /** Field definitions (if dynamic) */
  fields?: FormFieldDef[];
  /** Form loading state */
  loading?: boolean;
  /** Form disabled state */
  disabled?: boolean;
}

/**
 * Data for `input` widget.
 */
export interface InputData {
  /** Current value */
  value: string | number;
  /** Error message */
  error?: string;
  /** Touched state */
  touched?: boolean;
  /** Loading state (for async validation) */
  loading?: boolean;
}

/**
 * Data for `select` widget.
 */
export interface SelectData {
  /** Current value (single or array for multiple) */
  value: string | number | (string | number)[];
  /** Options list */
  options: SelectOptionItem[];
  /** Error message */
  error?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * Data for `checkbox-group` widget.
 */
export interface CheckboxGroupData {
  /** Selected values */
  values: (string | number)[];
  /** Checkbox options */
  options: CheckboxItem[];
  /** Error message */
  error?: string;
}

/**
 * Data for `switch` widget.
 */
export interface SwitchData {
  /** Current value */
  value: boolean;
  /** Error message */
  error?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * Data for `date-picker` widget.
 */
export interface DatePickerData {
  /** Current value (ISO string or array for range) */
  value: string | [string, string] | null;
  /** Error message */
  error?: string;
  /** Disabled dates (ISO strings) */
  disabledDates?: string[];
}
