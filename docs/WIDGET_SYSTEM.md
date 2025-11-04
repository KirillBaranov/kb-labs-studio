# Widget System

## Overview

The widget system is a sandbox where the backend controls what, how, and why to display widgets through manifest-driven configuration.

## Architecture

- **KB Labs Studio = dumb sandbox** - only renders what the backend decides to show
- **Backend through manifest fully controls:** what to show, how to show it, why to show it
- **Future:** add `condition?: string` for v-if conditions (not implemented yet)

## Widget Types

The system supports 14 base widget types:

1. **Metric** - single metric with trend (min/avg/max, delta, sparkline)
2. **KPIList** - set of KPI cards
3. **Table** - pagination, sorting, sticky header
4. **CardList** - entity cards (title, description, tags, status)
5. **Timeline** - events over time
6. **Tree** - hierarchical structures
7. **LogViewer** - lazy virtualized list
8. **JsonViewer** - collapsed/expanded JSON with copy
9. **DiffViewer** - unified/side-by-side diff
10. **ChartLine** - line chart
11. **ChartBar** - bar chart
12. **ChartPie** - pie chart
13. **StatusBadges** - list/cloud of status badges
14. **Progress** - progress bars (multi/stacked)

## Layouts

Two layout types are supported:

1. **DashboardGrid** - responsive CSS Grid with `layoutHint` support
2. **TwoPane** - flex-based with optional resizer (min 20% / max 80%)

## Data Sources

Widgets can load data from:

- **REST**: `{ type: "rest", routeId: string, method?: "GET" | "POST", headers?: Record<string, string> }`
- **Mock**: `{ type: "mock", fixtureId: string }`

## Registry

The registry is generated at build time from plugin manifests and loaded at runtime from:
- `/registry.json`
- `/dist/studio/registry.json`

## Widget States

All widgets support unified states:
- **Loading**: displays skeleton
- **Error**: displays error with retry (if retryable)
- **Empty**: displays empty state
- **Data**: displays widget content


