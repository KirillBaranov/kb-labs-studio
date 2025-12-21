/**
 * @module @kb-labs/studio-contracts/options/display
 * Options for display widgets (14 widgets).
 */

/**
 * Trend indicator for metrics.
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Options for `metric` widget.
 */
export interface MetricOptions {
  /** Value format (e.g., 'number', 'currency', 'percent') */
  format?: 'number' | 'currency' | 'percent' | 'duration';
  /** Number of decimal places */
  precision?: number;
  /** Currency code for currency format */
  currencyCode?: string;
  /** Show trend indicator */
  showTrend?: boolean;
  /** Trend threshold for color change */
  trendThreshold?: number;
  /** Invert trend colors (red for up, green for down) */
  invertTrend?: boolean;
  /** Show sparkline chart */
  showSparkline?: boolean;
  /** Compact mode (smaller text) */
  compact?: boolean;
}

/**
 * Options for `metric-group` widget.
 */
export interface MetricGroupOptions {
  /** Number of columns */
  columns?: number | { sm: number; md: number; lg: number };
  /** Gap between metrics in pixels */
  gap?: number;
  /** Inherit options for all child metrics */
  metricDefaults?: Partial<MetricOptions>;
}

/**
 * Column definition for table widget.
 */
export interface TableColumn {
  /** Column key (field name in data) */
  key: string;
  /** Column header label */
  label: string;
  /** Column width */
  width?: number | string;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Enable sorting */
  sortable?: boolean;
  /** Custom cell renderer type */
  renderer?: 'text' | 'number' | 'date' | 'badge' | 'link' | 'actions';
  /** Renderer options */
  rendererOptions?: Record<string, unknown>;
  /** Fixed column position */
  fixed?: 'left' | 'right';
  /** Hide column by default */
  hidden?: boolean;
}

/**
 * Options for `table` widget.
 */
export interface TableOptions {
  /** Column definitions */
  columns: TableColumn[];
  /** Row key field */
  rowKey?: string;
  /** Enable row selection */
  selectable?: boolean;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple';
  /** Enable pagination */
  paginated?: boolean;
  /** Items per page */
  pageSize?: number;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Enable search/filter */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Enable virtual scrolling for large datasets */
  virtualScroll?: boolean;
  /** Row height for virtual scrolling */
  rowHeight?: number;
  /** Striped rows */
  striped?: boolean;
  /** Bordered cells */
  bordered?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Enable row click handler */
  rowClickable?: boolean;
  /** Expandable rows */
  expandable?: boolean;
}

/**
 * Options for `card` widget.
 */
export interface CardOptions {
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Show header section */
  showHeader?: boolean;
  /** Show footer section */
  showFooter?: boolean;
  /** Clickable card (hover effect) */
  clickable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Cover image position */
  coverPosition?: 'top' | 'left' | 'right';
}

/**
 * Options for `cardlist` widget.
 */
export interface CardListOptions {
  /** Layout mode */
  layout?: 'grid' | 'list';
  /** Number of columns for grid layout */
  columns?: number | { sm: number; md: number; lg: number };
  /** Gap between cards */
  gap?: number;
  /** Card options to apply to all cards */
  cardDefaults?: Partial<CardOptions>;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * Common chart options.
 */
interface BaseChartOptions {
  /** Chart height in pixels */
  height?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Legend position */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Show tooltip */
  showTooltip?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Color palette */
  colors?: string[];
  /** X-axis configuration */
  xAxis?: {
    label?: string;
    tickFormat?: string;
    tickCount?: number;
  };
  /** Y-axis configuration */
  yAxis?: {
    label?: string;
    tickFormat?: string;
    tickCount?: number;
    min?: number;
    max?: number;
  };
}

/**
 * Options for `chart-line` widget.
 */
export interface ChartLineOptions extends BaseChartOptions {
  /** Smooth line curves */
  smooth?: boolean;
  /** Show data points */
  showPoints?: boolean;
  /** Point size */
  pointSize?: number;
  /** Line stroke width */
  strokeWidth?: number;
  /** Fill area under line */
  fill?: boolean;
  /** Enable zoom */
  zoomable?: boolean;
}

/**
 * Options for `chart-bar` widget.
 */
export interface ChartBarOptions extends BaseChartOptions {
  /** Horizontal bars */
  horizontal?: boolean;
  /** Stacked bars */
  stacked?: boolean;
  /** Bar corner radius */
  borderRadius?: number;
  /** Bar width ratio (0-1) */
  barWidth?: number;
  /** Show value labels on bars */
  showLabels?: boolean;
}

/**
 * Options for `chart-pie` widget.
 */
export interface ChartPieOptions extends BaseChartOptions {
  /** Donut chart (inner radius) */
  donut?: boolean;
  /** Inner radius for donut (0-1) */
  innerRadius?: number;
  /** Show labels on slices */
  showLabels?: boolean;
  /** Label type */
  labelType?: 'value' | 'percent' | 'name';
  /** Start angle in degrees */
  startAngle?: number;
  /** Pad angle between slices */
  padAngle?: number;
}

/**
 * Options for `chart-area` widget.
 */
export interface ChartAreaOptions extends BaseChartOptions {
  /** Stacked areas */
  stacked?: boolean;
  /** Smooth curves */
  smooth?: boolean;
  /** Fill opacity (0-1) */
  fillOpacity?: number;
  /** Show line on top of area */
  showLine?: boolean;
  /** Gradient fill */
  gradient?: boolean;
}

/**
 * Options for `timeline` widget.
 */
export interface TimelineOptions {
  /** Timeline direction */
  direction?: 'vertical' | 'horizontal';
  /** Alternate sides (for vertical) */
  alternate?: boolean;
  /** Show connector lines */
  showConnectors?: boolean;
  /** Item spacing */
  spacing?: number;
  /** Date format */
  dateFormat?: string;
  /** Collapsible items */
  collapsible?: boolean;
  /** Reverse order */
  reverse?: boolean;
}

/**
 * Options for `tree` widget.
 */
export interface TreeOptions {
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Expand depth (0 = all collapsed, -1 = all expanded) */
  expandDepth?: number;
  /** Show checkboxes */
  checkable?: boolean;
  /** Check mode */
  checkMode?: 'independent' | 'cascade';
  /** Show icons */
  showIcon?: boolean;
  /** Draggable nodes */
  draggable?: boolean;
  /** Show connecting lines */
  showLines?: boolean;
  /** Search/filter enabled */
  searchable?: boolean;
  /** Virtual scroll for large trees */
  virtualScroll?: boolean;
  /** Node height for virtual scroll */
  nodeHeight?: number;
}

/**
 * Options for `json` widget.
 */
export interface JsonOptions {
  /** Syntax highlighting theme */
  theme?: 'light' | 'dark' | 'auto';
  /** Collapse depth (-1 = all expanded) */
  collapseDepth?: number;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Enable copy button */
  copyable?: boolean;
  /** Max height with scroll */
  maxHeight?: number;
  /** Language for syntax highlighting */
  language?: 'json' | 'yaml' | 'typescript' | 'javascript';
  /** Word wrap */
  wordWrap?: boolean;
}

/**
 * Options for `diff` widget.
 */
export interface DiffOptions {
  /** Diff view mode */
  mode?: 'split' | 'unified';
  /** Syntax highlighting language */
  language?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Highlight inline changes */
  highlightInline?: boolean;
  /** Context lines around changes */
  contextLines?: number;
  /** Word-level diff */
  wordDiff?: boolean;
}

/**
 * Log level for filtering.
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Options for `logs` widget.
 */
export interface LogsOptions {
  /** Show timestamps */
  showTimestamp?: boolean;
  /** Timestamp format */
  timestampFormat?: string;
  /** Show log levels */
  showLevel?: boolean;
  /** Filter by level */
  levelFilter?: LogLevel[];
  /** Enable search */
  searchable?: boolean;
  /** Auto-scroll to bottom */
  autoScroll?: boolean;
  /** Max lines to display */
  maxLines?: number;
  /** Line wrap */
  wrap?: boolean;
  /** Theme */
  theme?: 'light' | 'dark' | 'auto';
  /** Virtual scroll */
  virtualScroll?: boolean;
}
