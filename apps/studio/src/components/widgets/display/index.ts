/**
 * @module @kb-labs/studio-app/components/widgets/display
 * Display widgets (14 total)
 */

// Data visualization
export { Metric } from './Metric';
export type { MetricProps, MetricOptions } from './Metric';

export { MetricGroup } from './MetricGroup';
export type { MetricGroupProps, MetricGroupOptions } from './MetricGroup';

export { Table } from './Table';
export type { TableProps, TableOptions } from './Table';

export { Card } from './Card';
export type { CardProps, CardOptions } from './Card';

export { CardList } from './CardList';
export type { CardListProps, CardListOptions, CardItem } from './CardList';

// Charts
export { ChartLine } from './ChartLine';
export type { ChartLineProps, ChartLineOptions, ChartSeries, ChartSeriesPoint } from './ChartLine';

export { ChartBar } from './ChartBar';
export type { ChartBarProps, ChartBarOptions } from './ChartBar';

export { ChartPie } from './ChartPie';
export type { ChartPieProps, ChartPieOptions } from './ChartPie';

export { ChartArea } from './ChartArea';
export type { ChartAreaProps, ChartAreaOptions } from './ChartArea';

// Timeline & Tree
export { Timeline } from './Timeline';
export type { TimelineProps, TimelineOptions, TimelineEvent } from './Timeline';

export { Tree } from './Tree';
export type { TreeProps, TreeOptions, TreeNode } from './Tree';

// Code/Data viewers
export { Json } from './Json';
export type { JsonProps, JsonOptions } from './Json';

export { Diff } from './Diff';
export type { DiffProps, DiffOptions, DiffHunk, DiffPayload } from './Diff';

export { Logs } from './Logs';
export type { LogsProps, LogsOptions } from './Logs';
