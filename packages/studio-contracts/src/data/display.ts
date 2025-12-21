/**
 * @module @kb-labs/studio-contracts/data/display
 * Data contracts for display widgets (14 widgets).
 */

import type { TrendDirection, LogLevel } from '../options/display.js';

/**
 * Data for `metric` widget.
 */
export interface MetricData {
  /** Primary value */
  value: number | string;
  /** Label text */
  label?: string;
  /** Unit suffix (e.g., '%', 'ms', 'GB') */
  unit?: string;
  /** Trend direction */
  trend?: TrendDirection;
  /** Trend value (e.g., '+12%') */
  trendValue?: string;
  /** Sparkline data points */
  sparkline?: number[];
  /** Previous value (for comparison) */
  previousValue?: number;
  /** Target value */
  targetValue?: number;
  /** Additional description */
  description?: string;
  /** Status indicator */
  status?: 'success' | 'warning' | 'error' | 'default';
}

/**
 * Data for `metric-group` widget.
 */
export interface MetricGroupData {
  /** List of metrics */
  metrics: MetricData[];
}

/**
 * Table row data (generic).
 */
export type TableRow = Record<string, unknown>;

/**
 * Data for `table` widget.
 */
export interface TableData {
  /** Table rows */
  rows: TableRow[];
  /** Total count (for pagination) */
  total?: number;
  /** Current page (1-indexed) */
  page?: number;
  /** Page size */
  pageSize?: number;
  /** Loading state */
  loading?: boolean;
}

/**
 * Data for `card` widget.
 */
export interface CardData {
  /** Card title */
  title?: string;
  /** Card description/content */
  description?: string;
  /** Cover image URL */
  cover?: string;
  /** Avatar/icon URL */
  avatar?: string;
  /** Meta information */
  meta?: {
    label: string;
    value: string;
  }[];
  /** Tags/badges */
  tags?: {
    label: string;
    color?: string;
  }[];
  /** Footer content */
  footer?: string;
  /** Link URL */
  href?: string;
  /** Status */
  status?: 'success' | 'warning' | 'error' | 'default';
}

/**
 * Data for `cardlist` widget.
 */
export interface CardListData {
  /** List of cards */
  cards: CardData[];
  /** Total count (for pagination) */
  total?: number;
  /** Loading state */
  loading?: boolean;
}

/**
 * Data point for line/area charts.
 */
export interface ChartDataPoint {
  /** X-axis value (date, category, number) */
  x: string | number;
  /** Y-axis value */
  y: number;
  /** Optional label */
  label?: string;
}

/**
 * Chart series (for multi-line charts).
 */
export interface ChartSeries {
  /** Series name */
  name: string;
  /** Data points */
  data: ChartDataPoint[];
  /** Series color */
  color?: string;
}

/**
 * Data for `chart-line` widget.
 */
export interface ChartLineData {
  /** Series data */
  series: ChartSeries[];
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
}

/**
 * Data for `chart-bar` widget.
 */
export interface ChartBarData {
  /** Series data */
  series: ChartSeries[];
  /** Categories (x-axis labels) */
  categories?: string[];
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
}

/**
 * Pie chart slice.
 */
export interface PieSlice {
  /** Slice name */
  name: string;
  /** Slice value */
  value: number;
  /** Slice color */
  color?: string;
}

/**
 * Data for `chart-pie` widget.
 */
export interface ChartPieData {
  /** Pie slices */
  slices: PieSlice[];
  /** Total value (for center label) */
  total?: number;
  /** Center label */
  centerLabel?: string;
}

/**
 * Data for `chart-area` widget.
 */
export interface ChartAreaData {
  /** Series data */
  series: ChartSeries[];
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
}

/**
 * Timeline event item.
 */
export interface TimelineItem {
  /** Event ID */
  id: string;
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Event timestamp */
  timestamp: string;
  /** Event icon */
  icon?: string;
  /** Event color */
  color?: string;
  /** Event status */
  status?: 'success' | 'warning' | 'error' | 'default' | 'pending';
  /** Additional content */
  content?: string;
  /** Tags */
  tags?: string[];
}

/**
 * Data for `timeline` widget.
 */
export interface TimelineData {
  /** Timeline items */
  items: TimelineItem[];
  /** Loading state */
  loading?: boolean;
}

/**
 * Tree node item.
 */
export interface TreeNode {
  /** Node ID (unique) */
  id: string;
  /** Node label */
  label: string;
  /** Node icon */
  icon?: string;
  /** Child nodes */
  children?: TreeNode[];
  /** Disabled state */
  disabled?: boolean;
  /** Selectable state */
  selectable?: boolean;
  /** Checked state (for checkable trees) */
  checked?: boolean;
  /** Expanded state */
  expanded?: boolean;
  /** Leaf node (no children) */
  isLeaf?: boolean;
  /** Additional data */
  data?: unknown;
}

/**
 * Data for `tree` widget.
 */
export interface TreeData {
  /** Tree nodes */
  nodes: TreeNode[];
  /** Selected node IDs */
  selectedIds?: string[];
  /** Checked node IDs */
  checkedIds?: string[];
  /** Expanded node IDs */
  expandedIds?: string[];
  /** Loading state */
  loading?: boolean;
}

/**
 * Data for `json` widget.
 */
export interface JsonData {
  /** JSON content (object, array, or string) */
  content: unknown;
  /** Title/filename */
  title?: string;
}

/**
 * Data for `diff` widget.
 */
export interface DiffData {
  /** Original content */
  original: string;
  /** Modified content */
  modified: string;
  /** Original title/filename */
  originalTitle?: string;
  /** Modified title/filename */
  modifiedTitle?: string;
  /** Language for syntax highlighting */
  language?: string;
}

/**
 * Log entry item.
 */
export interface LogEntry {
  /** Entry ID */
  id: string;
  /** Log message */
  message: string;
  /** Log level */
  level: LogLevel;
  /** Timestamp */
  timestamp: string;
  /** Source/logger name */
  source?: string;
  /** Additional metadata */
  meta?: Record<string, unknown>;
}

/**
 * Data for `logs` widget.
 */
export interface LogsData {
  /** Log entries */
  entries: LogEntry[];
  /** Has more entries */
  hasMore?: boolean;
  /** Loading state */
  loading?: boolean;
}
