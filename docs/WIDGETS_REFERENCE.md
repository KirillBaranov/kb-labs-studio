# Widgets Reference

## Overview

All widgets support a unified interface `BaseWidgetProps<T, O>`:
- `data?: T` - widget data
- `loading: boolean` - loading state
- `error?: string | null` - error (if any)
- `options?: O` - widget options (typed per widget)

All widgets automatically show:
- **Skeleton** when `loading === true`
- **ErrorState** when `error` is present
- **EmptyState** when `data` is missing

---

## Metric

**Description:** Displays a single metric with optional trend (delta) and sparkline.

**Data:** `KPIMetric`
```typescript
{
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  delta?: number;
  status?: 'ok' | 'warn' | 'crit';
  sparkline?: number[];
}
```

**Options:** `MetricOptions`
```typescript
{
  showDelta?: boolean;      // Show delta (default: true)
  showSparkline?: boolean;  // Show sparkline (default: false)
  compact?: boolean;        // Compact mode (default: false)
}
```

**Example:**
```typescript
<Metric
  data={{
    id: 'total-users',
    label: 'Total Users',
    value: 1250,
    unit: 'users',
    delta: 5.2,
    status: 'ok'
  }}
  loading={false}
  error={null}
  options={{ showDelta: true }}
/>
```

---

## KPIList

**Description:** Displays a grid of KPI cards.

**Data:** `KPIMetric[]` (array of metrics)

**Options:** `KPIListOptions`
```typescript
{
  columns?: number;  // Number of columns (default: 3)
  compact?: boolean; // Compact mode (default: false)
}
```

**Example:**
```typescript
<KPIList
  data={[
    { id: 'kpi1', label: 'Users', value: 1250, status: 'ok' },
    { id: 'kpi2', label: 'Revenue', value: 50000, unit: '$', status: 'warn' },
  ]}
  options={{ columns: 2 }}
/>
```

---

## Table

**Description:** Table with pagination, sorting, and sticky header.

**Data:** `T[]` (array of objects of any type)

**Options:** `TableOptions<T>`
```typescript
{
  columns?: Column<T>[];  // Column definitions
  pageSize?: number;       // Page size (default: 20)
  sortable?: boolean;      // Enable sorting (default: true)
  stickyHeader?: boolean;  // Sticky header (default: false)
}
```

**Example:**
```typescript
<Table
  data={[
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
  ]}
  options={{
    columns: [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'age', label: 'Age', sortable: true },
    ],
    pageSize: 10
  }}
/>
```

---

## CardList

**Description:** List of entity cards with tags and statuses.

**Data:** `CardItem[]`
```typescript
{
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  status?: 'ok' | 'warn' | 'crit';
  meta?: Record<string, unknown>;
}
```

**Options:** `CardListOptions`
```typescript
{
  columns?: number;  // Number of columns (default: 3)
  compact?: boolean; // Compact mode (default: false)
}
```

**Example:**
```typescript
<CardList
  data={[
    {
      id: 'card1',
      title: 'Feature A',
      description: 'Description',
      tags: ['frontend', 'react'],
      status: 'ok'
    }
  ]}
  onCardClick={(card) => console.log(card)}
/>
```

---

## Timeline

**Description:** Timeline of events over time.

**Data:** `TimelineEvent[]`
```typescript
{
  ts: number;              // Timestamp
  title: string;
  description?: string;
  kind?: 'error' | 'success' | 'info';
  link?: string;
}
```

**Options:** `TimelineOptions`
```typescript
{
  showIcons?: boolean;   // Show icons (default: true)
  showLinks?: boolean;   // Show links (default: true)
  compact?: boolean;     // Compact mode (default: false)
}
```

**Example:**
```typescript
<Timeline
  data={[
    {
      ts: Date.now(),
      title: 'Deployment completed',
      kind: 'success',
      description: 'Version 1.0.0 deployed'
    }
  ]}
  onEventClick={(event) => console.log(event)}
/>
```

---

## Tree

**Description:** Hierarchical tree structure with expandable nodes.

**Data:** `TreeNode`
```typescript
{
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
}
```

**Options:** `TreeOptions`
```typescript
{
  expanded?: string[];    // IDs of nodes expanded by default
  showIcons?: boolean;    // Show icons (default: true)
  expandable?: boolean;   // Allow expansion (default: true)
}
```

**Example:**
```typescript
<Tree
  data={{
    id: 'root',
    label: 'Root',
    children: [
      { id: 'child1', label: 'Child 1' },
      { id: 'child2', label: 'Child 2' }
    ]
  }}
  onNodeClick={(node) => console.log(node)}
/>
```

---

## LogViewer

**Description:** Log viewer with search and filtering.

**Data:** `LogLine[]`
```typescript
{
  ts: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  msg: string;
}
```

**Options:** `LogViewerOptions`
```typescript
{
  showTimestamp?: boolean; // Show timestamp (default: true)
  showLevel?: boolean;     // Show log level (default: true)
  searchable?: boolean;    // Enable search (default: false)
  maxLines?: number;       // Maximum lines (default: 1000)
}
```

**Example:**
```typescript
<LogViewer
  data={[
    { ts: Date.now(), level: 'info', msg: 'Application started' },
    { ts: Date.now(), level: 'error', msg: 'Failed to connect' }
  ]}
  options={{ searchable: true, maxLines: 500 }}
/>
```

---

## JsonViewer

**Description:** JSON viewer with expandable nodes and copy functionality.

**Data:** `unknown` (any JSON-compatible object)

**Options:** `JsonViewerOptions`
```typescript
{
  collapsed?: boolean;  // Collapse by default (default: false)
  copyable?: boolean;   // Show copy button (default: true)
}
```

**Example:**
```typescript
<JsonViewer
  data={{
    name: 'John',
    age: 30,
    nested: { value: 'test' }
  }}
  options={{ collapsed: false }}
/>
```

---

## DiffViewer

**Description:** Diff viewer (unified/side-by-side mode).

**Data:** `DiffPayload`
```typescript
{
  mode?: 'unified' | 'split';
  hunks: Array<{
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    header?: string;
    lines: string[];
  }>;
}
```

**Options:** `DiffViewerOptions`
```typescript
{
  mode?: 'unified' | 'split';  // Display mode (default: 'unified')
  collapsed?: boolean;         // Collapse all hunks (default: false)
}
```

**Example:**
```typescript
<DiffViewer
  data={{
    mode: 'unified',
    hunks: [{
      oldStart: 1,
      oldLines: 3,
      newStart: 1,
      newLines: 3,
      lines: ['-old line', '+new line', ' context']
    }]
  }}
/>
```

---

## ChartLine

**Description:** Line chart.

**Data:** `ChartSeries[]`
```typescript
{
  name: string;
  points: Array<{ x: number | string; y: number }>;
}
```

**Options:** `ChartLineOptions`
```typescript
{
  showLegend?: boolean;  // Show legend (default: true)
  showTooltip?: boolean; // Show tooltip (default: true)
  height?: number;       // Chart height (default: 300)
}
```

**Example:**
```typescript
<ChartLine
  data={[{
    name: 'Series 1',
    points: [
      { x: '2024-01', y: 100 },
      { x: '2024-02', y: 120 }
    ]
  }]}
/>
```

---

## ChartBar

**Description:** Bar chart.

**Data:** `ChartSeries[]` (same structure as ChartLine)

**Options:** `ChartBarOptions`
```typescript
{
  showLegend?: boolean;  // Show legend (default: true)
  showTooltip?: boolean; // Show tooltip (default: true)
  height?: number;       // Chart height (default: 300)
  stacked?: boolean;     // Stacked bars (default: false)
}
```

---

## ChartPie

**Description:** Pie chart.

**Data:** `ChartSeries[]` (same structure as ChartLine)

**Options:** `ChartPieOptions`
```typescript
{
  showLegend?: boolean;  // Show legend (default: true)
  showTooltip?: boolean; // Show tooltip (default: true)
  height?: number;       // Chart height (default: 300)
  showPercent?: boolean; // Show percentages (default: true)
}
```

---

## StatusBadges

**Description:** List/cloud of status badges.

**Data:** `StatusBadge[]`
```typescript
{
  id: string;
  label: string;
  status: 'ok' | 'warn' | 'crit';
  count?: number;
}
```

**Options:** `StatusBadgesOptions`
```typescript
{
  layout?: 'list' | 'cloud';  // Layout (default: 'list')
  showCount?: boolean;        // Show count (default: true)
}
```

**Example:**
```typescript
<StatusBadges
  data={[
    { id: 'status1', label: 'Active', status: 'ok', count: 10 },
    { id: 'status2', label: 'Warning', status: 'warn', count: 2 }
  ]}
  options={{ layout: 'cloud' }}
/>
```

---

## Progress

**Description:** Progress bars (multiple or stacked).

**Data:** `ProgressItem[]`
```typescript
{
  id: string;
  label: string;
  value: number;
  max?: number;      // Default: 100
  color?: string;    // Progress bar color
}
```

**Options:** `ProgressOptions`
```typescript
{
  stacked?: boolean;      // Stacked mode (default: false)
  showLabels?: boolean;   // Show labels (default: true)
  showValues?: boolean;   // Show values (default: true)
}
```

**Example:**
```typescript
<Progress
  data={[
    { id: 'p1', label: 'Task 1', value: 75, max: 100 },
    { id: 'p2', label: 'Task 2', value: 50, max: 100, color: '#52c41a' }
  ]}
  options={{ stacked: false, showValues: true }}
/>
```

---

## Common Patterns

### Loading State
All widgets automatically show `Skeleton` when `loading === true`:
```typescript
<Metric loading={true} data={undefined} error={null} />
```

### Error State
All widgets automatically show `ErrorState` when an error is present:
```typescript
<Metric loading={false} data={undefined} error="Failed to load data" />
```

### Empty State
All widgets automatically show `EmptyState` when data is missing:
```typescript
<Metric loading={false} data={null} error={null} />
```

### Data State
Widgets display data only when `loading === false`, `error === null`, and `data !== null/undefined`:
```typescript
<Metric
  loading={false}
  data={{ id: 'metric1', label: 'Total', value: 100 }}
  error={null}
/>
```

---

## Data Contracts

All widgets use schemas from `@kb-labs/api-contracts`:
- `KPIMetric` - for Metric and KPIList
- `TimelineEvent` - for Timeline
- `TreeNode` - for Tree
- `LogLine` - for LogViewer
- `ChartSeries` - for ChartLine, ChartBar, ChartPie
- `FindingsTableRow` - for Table (or any custom type)
- `DiffPayload` - for DiffViewer

Schemas are defined in `kb-labs-api-contracts/packages/api-contracts/src/studio.ts` with aliases `kb.v1.studio.*`.

