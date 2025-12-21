/**
 * @module @kb-labs/studio-contracts/data
 * All widget data contracts with WidgetDataMap.
 */

// Display widgets (14)
export type {
  MetricData,
  MetricGroupData,
  TableData,
  TableRow,
  CardData,
  CardListData,
  ChartLineData,
  ChartBarData,
  ChartPieData,
  ChartAreaData,
  ChartDataPoint,
  ChartSeries,
  PieSlice,
  TimelineData,
  TimelineItem,
  TreeData,
  TreeNode,
  JsonData,
  DiffData,
  LogsData,
  LogEntry,
} from './display.js';

// Form widgets (6)
export type {
  FormData,
  FormFieldError,
  InputData,
  SelectData,
  CheckboxGroupData,
  SwitchData,
  DatePickerData,
} from './form.js';

// Navigation widgets (3)
export type { BreadcrumbData, StepperData, MenuData } from './navigation.js';

// Feedback widgets (3)
export type { AlertData, ModalData, ConfirmData } from './feedback.js';

import type { StudioWidgetKind } from '../kinds.js';

// Import all data types for the map
import type {
  MetricData,
  MetricGroupData,
  TableData,
  CardData,
  CardListData,
  ChartLineData,
  ChartBarData,
  ChartPieData,
  ChartAreaData,
  TimelineData,
  TreeData,
  JsonData,
  DiffData,
  LogsData,
} from './display.js';

import type {
  FormData,
  InputData,
  SelectData,
  CheckboxGroupData,
  SwitchData,
  DatePickerData,
} from './form.js';

import type { BreadcrumbData, StepperData, MenuData } from './navigation.js';

import type { AlertData, ModalData, ConfirmData } from './feedback.js';

/**
 * Map of widget kind to its data contract type.
 * Provides type-safe data access by widget kind.
 */
export interface WidgetDataMap {
  // Display (14)
  'metric': MetricData;
  'metric-group': MetricGroupData;
  'table': TableData;
  'card': CardData;
  'cardlist': CardListData;
  'chart-line': ChartLineData;
  'chart-bar': ChartBarData;
  'chart-pie': ChartPieData;
  'chart-area': ChartAreaData;
  'timeline': TimelineData;
  'tree': TreeData;
  'json': JsonData;
  'diff': DiffData;
  'logs': LogsData;

  // Form (6)
  'form': FormData;
  'input': InputData;
  'select': SelectData;
  'checkbox-group': CheckboxGroupData;
  'switch': SwitchData;
  'date-picker': DatePickerData;

  // Layout (5) - composite widgets have no data (children provide content)
  'section': never;
  'grid': never;
  'stack': never;
  'tabs': never;
  'modal': ModalData;

  // Navigation (3)
  'breadcrumb': BreadcrumbData;
  'stepper': StepperData;
  'menu': MenuData;

  // Feedback (2)
  'alert': AlertData;
  'confirm': ConfirmData;
}

/**
 * Helper type to get data contract for a specific widget kind.
 */
export type DataForKind<K extends StudioWidgetKind> = K extends keyof WidgetDataMap
  ? WidgetDataMap[K]
  : never;
