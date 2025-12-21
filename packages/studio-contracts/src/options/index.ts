/**
 * @module @kb-labs/studio-contracts/options
 * All widget options types with WidgetOptionsMap.
 */

// Display widgets (14)
export type {
  MetricOptions,
  MetricGroupOptions,
  TableOptions,
  TableColumn,
  CardOptions,
  CardListOptions,
  ChartLineOptions,
  ChartBarOptions,
  ChartPieOptions,
  ChartAreaOptions,
  TimelineOptions,
  TreeOptions,
  JsonOptions,
  DiffOptions,
  LogsOptions,
  TrendDirection,
  LogLevel,
} from './display.js';

// Form widgets (6)
export type {
  FormOptions,
  FormFieldDef,
  InputOptions,
  SelectOptions,
  SelectOptionItem,
  CheckboxGroupOptions,
  CheckboxItem,
  SwitchOptions,
  DatePickerOptions,
  ValidationRule,
} from './form.js';

// Layout widgets (5)
export type {
  SectionOptions,
  GridOptions,
  StackOptions,
  TabsOptions,
  TabDef,
  ModalOptions,
} from './layout.js';

// Navigation widgets (3)
export type {
  BreadcrumbOptions,
  BreadcrumbItemDef,
  StepperOptions,
  StepDef,
  MenuOptions,
  MenuItemDef,
} from './navigation.js';

// Feedback widgets (3)
export type { AlertOptions, AlertType, ConfirmOptions } from './feedback.js';

import type { StudioWidgetKind } from '../kinds.js';

// Import all options types for the map
import type {
  MetricOptions,
  MetricGroupOptions,
  TableOptions,
  CardOptions,
  CardListOptions,
  ChartLineOptions,
  ChartBarOptions,
  ChartPieOptions,
  ChartAreaOptions,
  TimelineOptions,
  TreeOptions,
  JsonOptions,
  DiffOptions,
  LogsOptions,
} from './display.js';

import type {
  FormOptions,
  InputOptions,
  SelectOptions,
  CheckboxGroupOptions,
  SwitchOptions,
  DatePickerOptions,
} from './form.js';

import type {
  SectionOptions,
  GridOptions,
  StackOptions,
  TabsOptions,
  ModalOptions,
} from './layout.js';

import type { BreadcrumbOptions, StepperOptions, MenuOptions } from './navigation.js';

import type { AlertOptions, ConfirmOptions } from './feedback.js';

/**
 * Map of widget kind to its options type.
 * Provides type-safe options access by widget kind.
 */
export interface WidgetOptionsMap {
  // Display (14)
  'metric': MetricOptions;
  'metric-group': MetricGroupOptions;
  'table': TableOptions;
  'card': CardOptions;
  'cardlist': CardListOptions;
  'chart-line': ChartLineOptions;
  'chart-bar': ChartBarOptions;
  'chart-pie': ChartPieOptions;
  'chart-area': ChartAreaOptions;
  'timeline': TimelineOptions;
  'tree': TreeOptions;
  'json': JsonOptions;
  'diff': DiffOptions;
  'logs': LogsOptions;

  // Form (6)
  'form': FormOptions;
  'input': InputOptions;
  'select': SelectOptions;
  'checkbox-group': CheckboxGroupOptions;
  'switch': SwitchOptions;
  'date-picker': DatePickerOptions;

  // Layout (5)
  'section': SectionOptions;
  'grid': GridOptions;
  'stack': StackOptions;
  'tabs': TabsOptions;
  'modal': ModalOptions;

  // Navigation (3)
  'breadcrumb': BreadcrumbOptions;
  'stepper': StepperOptions;
  'menu': MenuOptions;

  // Feedback (2 - confirm uses ConfirmOptions, alert uses AlertOptions)
  'alert': AlertOptions;
  'confirm': ConfirmOptions;
}

/**
 * Helper type to get options for a specific widget kind.
 */
export type OptionsForKind<K extends StudioWidgetKind> = K extends keyof WidgetOptionsMap
  ? WidgetOptionsMap[K]
  : never;
