# KB Labs Studio

**Unified web dashboard for observing and managing the KB Labs ecosystem.**

## Overview

KB Labs Studio is a React-based web application that provides observability and management capabilities for the KB Labs ecosystem, including audit, release management, devlink, mind, and analytics.

## Features

- **Dashboard**: KPIs overview, activity charts, and recent activity
- **Audit**: Package audit results and reports  
- **Release**: Package release preview and execution
- **DevLink**: Dependency graph and cycle detection (coming soon)
- **Mind**: Knowledge freshness verification (coming soon)
- **Analytics**: Event metrics and performance charts (coming soon)
- **Settings**: Configuration and data source management
- **Theme System**: Light/Dark/Auto theme switching with CSS variables
- **Data Visualization**: Interactive charts with drill-down capabilities

## Architecture

### Monorepo Structure

```
kb-labs-studio/
├── apps/studio/                 # Main React SPA application
├── packages/
│   ├── ui-core/                 # Design tokens and themes (framework-agnostic)
│   ├── ui-react/                # Shared React components (future kb-labs-ui)
│   └── data-client/             # API SDK with versioned contracts and mocks
```

### Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **TanStack Query** for data fetching and caching
- **Ant Design React 5** via custom wrappers (@kb-labs/ui-react)
- **@ant-design/charts** for data visualization
- **CSS Variables** with design tokens from ui-core (framework-agnostic)
- **React Router v6** for navigation
- **Vitest** + **Testing Library** for testing

### Data Layer

- **Versioned contracts (v1.0)** with Zod validation
- **Mock-first approach**: Deterministic fixtures, easy swap to real API
- **Factory pattern**: Switch between mock and HTTP data sources
- **Centralized query keys**: Predictable TanStack Query cache invalidation

### Component Organization

- **`packages/ui-react/`**: Generic, reusable components (KBPageLayout, KBCard, KBButton, KBChart, StatCard)
- **`apps/studio/src/components/`**: Studio-specific components (RunBadge, HealthIndicator, EmptyState)
- **`apps/studio/src/modules/`**: Feature modules with pages and components
- **Component separation**: Generic vs domain-specific based on future extraction to kb-labs-ui

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.11.0

### Installation

```bash
cd kb-labs-studio
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Studio will be available at http://localhost:3000

### Building

Build all packages:

```bash
pnpm build
```

### Running Locally with Mocks

By default, Studio runs with mock data sources. No backend required for development.

To switch to HTTP sources:

```bash
VITE_DATA_SOURCE_MODE=http VITE_API_BASE_URL=http://localhost:8080/api pnpm dev
```

## Development Scripts

- `pnpm dev` - Start dev server
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm type-check` - TypeScript type checking

## Package Details

### @kb-labs/ui-core

Design system foundation:
- Design tokens (colors, spacing, typography, radius, shadows)
- Theme system (light/dark)
- CSS variable generator

### @kb-labs/ui-react

Shared React component library:
- KB-prefixed components wrapping Ant Design React
- Generic business components (StatCard, EmptyState, Charts)
- Layout components (KBPageLayout, KBHeader, KBSidebar, KBContent)
- Chart components (KBLineChart, KBColumnChart, KBAreaChart, KBPieChart, KBBarChart)
- Theme integration via CSS variables and Ant Design tokens

### @kb-labs/data-client

Data layer and API SDK:
- **Contracts**: TypeScript interfaces + Zod schemas (v1.0)
- **Sources**: Audit, Release, System data source interfaces
- **Mocks**: Deterministic mock implementations with fixtures
- **Hooks**: TanStack Query hooks for data fetching
- **Factory**: Switch between mock and HTTP modes

## Mock Data

Studio uses deterministic mock fixtures for development:
- `packages/data-client/src/mocks/fixtures/audit-summary.json`
- `packages/data-client/src/mocks/fixtures/release-preview.json`

All mocks include realistic delays (200-600ms) to simulate real API behavior.

## Configuration

### Environment Variables

- `VITE_DATA_SOURCE_MODE`: `mock` (default) or `http`
- `VITE_API_BASE_URL`: Base URL for HTTP data sources

### Studio Config

Located in `apps/studio/src/config/studio.config.ts`:
- Data source mode
- API base URL
- Feature flags (enableDevlink, enableMind, enableAnalytics)

## Roadmap

### Completed (MVP Phase 1)

✅ DevKit React presets (tsconfig, eslint, vitest, vite, tsup)  
✅ Monorepo initialization with workspace setup  
✅ UI Core with design tokens and themes  
✅ Data Client with versioned contracts and mocks  
✅ TanStack Query integration  
✅ Dashboard module with KPIs and charts  
✅ Audit module with summary and reports  
✅ Release module with preview and execution  
✅ Settings module with health monitoring  
✅ Navigation with all module stubs  
✅ **Ant Design React migration** with KB-prefixed component wrappers  
✅ **Theme system** with CSS variables and Ant Design token adapter  
✅ **Chart components** integration (@ant-design/charts)  
✅ **404 Not Found page**  

### Next Steps

- Enhanced chart types and drill-down functionality
- Time period navigation (week/month/quarter/year) for charts
- Widget registry for dashboard extensibility
- Role-based access control
- More detailed audit reports
- Release history
- Analytics visualizations
- Real API integration
- E2E tests with Playwright
- Documentation and guides

## Architecture Decisions

See [ADR-0018: Ant Design Migration](./docs/adr/0018-ant-design-migration.md) for details on the UI library migration from shadcn/ui to Ant Design React.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
