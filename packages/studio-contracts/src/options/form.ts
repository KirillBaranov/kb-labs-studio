/**
 * @module @kb-labs/studio-contracts/options/form
 * Options for form widgets (6 widgets).
 */

/**
 * Validation rule for form fields.
 */
export interface ValidationRule {
  /** Rule type */
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url';
  /** Rule value (for minLength, maxLength, min, max, pattern) */
  value?: string | number;
  /** Error message */
  message?: string;
}

/**
 * Common form field options.
 */
interface BaseFieldOptions {
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Help text below field */
  helpText?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Validation rules */
  rules?: ValidationRule[];
  /** Field size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Options for `input` widget.
 */
export interface InputOptions extends BaseFieldOptions {
  /** Input type */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'textarea';
  /** Max length */
  maxLength?: number;
  /** Min length */
  minLength?: number;
  /** For number type: min value */
  min?: number;
  /** For number type: max value */
  max?: number;
  /** For number type: step value */
  step?: number;
  /** For textarea: number of rows */
  rows?: number;
  /** Auto-resize textarea */
  autoResize?: boolean;
  /** Show character counter */
  showCount?: boolean;
  /** Prefix icon */
  prefixIcon?: string;
  /** Suffix icon */
  suffixIcon?: string;
  /** Clear button */
  clearable?: boolean;
  /** Password visibility toggle */
  showPasswordToggle?: boolean;
  /** Auto-focus */
  autoFocus?: boolean;
  /** Debounce delay in ms */
  debounce?: number;
}

/**
 * Select option item.
 */
export interface SelectOptionItem {
  /** Option value */
  value: string | number;
  /** Display label */
  label: string;
  /** Disabled state */
  disabled?: boolean;
  /** Group name for optgroup */
  group?: string;
  /** Description text */
  description?: string;
  /** Icon */
  icon?: string;
}

/**
 * Options for `select` widget.
 */
export interface SelectOptions extends BaseFieldOptions {
  /** Static options (alternative to data-driven) */
  options?: SelectOptionItem[];
  /** Multiple selection */
  multiple?: boolean;
  /** Max selected items (for multiple) */
  maxItems?: number;
  /** Enable search/filter */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Allow clearing selection */
  clearable?: boolean;
  /** Show checkmarks for selected */
  showCheckmarks?: boolean;
  /** Virtual scroll for large lists */
  virtualScroll?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
  /** Create new option (tags mode) */
  creatable?: boolean;
  /** Grouped options */
  grouped?: boolean;
}

/**
 * Checkbox item in group.
 */
export interface CheckboxItem {
  /** Checkbox value */
  value: string | number;
  /** Display label */
  label: string;
  /** Disabled state */
  disabled?: boolean;
  /** Description text */
  description?: string;
}

/**
 * Options for `checkbox-group` widget.
 */
export interface CheckboxGroupOptions extends BaseFieldOptions {
  /** Static options (alternative to data-driven) */
  options?: CheckboxItem[];
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Min selected items */
  minItems?: number;
  /** Max selected items */
  maxItems?: number;
  /** Gap between items */
  gap?: number;
  /** Show "select all" option */
  showSelectAll?: boolean;
}

/**
 * Options for `switch` widget.
 */
export interface SwitchOptions extends BaseFieldOptions {
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Show on/off labels */
  showLabels?: boolean;
  /** On label text */
  onLabel?: string;
  /** Off label text */
  offLabel?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * Options for `date-picker` widget.
 */
export interface DatePickerOptions extends BaseFieldOptions {
  /** Picker mode */
  mode?: 'date' | 'datetime' | 'time' | 'week' | 'month' | 'year' | 'range';
  /** Date format for display */
  format?: string;
  /** Minimum date */
  minDate?: string;
  /** Maximum date */
  maxDate?: string;
  /** Disable specific dates */
  disabledDates?: string[];
  /** Show time picker */
  showTime?: boolean;
  /** Time format (12h/24h) */
  use12Hours?: boolean;
  /** Show today button */
  showToday?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** First day of week (0=Sunday, 1=Monday) */
  firstDayOfWeek?: 0 | 1;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** Inline mode (always visible) */
  inline?: boolean;
}

/**
 * Form field definition for dynamic forms.
 */
export interface FormFieldDef {
  /** Field name (key in form data) */
  name: string;
  /** Field type */
  type: 'input' | 'select' | 'checkbox-group' | 'switch' | 'date-picker';
  /** Field options based on type */
  options?: InputOptions | SelectOptions | CheckboxGroupOptions | SwitchOptions | DatePickerOptions;
  /** Default value */
  defaultValue?: unknown;
  /** Conditional visibility (field name to check) */
  showWhen?: {
    field: string;
    value: unknown;
  };
  /** Column span (1-12) */
  colSpan?: number;
  /** Order in form */
  order?: number;
}

/**
 * Options for `form` widget.
 */
export interface FormOptions {
  /** Form layout */
  layout?: 'vertical' | 'horizontal' | 'inline';
  /** Number of columns */
  columns?: number;
  /** Gap between fields */
  gap?: number;
  /** Label width for horizontal layout */
  labelWidth?: number | string;
  /** Label alignment */
  labelAlign?: 'left' | 'right';
  /** Show required asterisk */
  showRequiredMark?: boolean;
  /** Colon after labels */
  showColon?: boolean;
  /** Size for all fields */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state for all fields */
  disabled?: boolean;
  /** Submit button text */
  submitLabel?: string;
  /** Show reset button */
  showReset?: boolean;
  /** Reset button text */
  resetLabel?: string;
  /** Submit on enter */
  submitOnEnter?: boolean;
  /** Validate on blur */
  validateOnBlur?: boolean;
  /** Validate on change */
  validateOnChange?: boolean;
  /** Field definitions (alternative to data-driven) */
  fields?: FormFieldDef[];
}
