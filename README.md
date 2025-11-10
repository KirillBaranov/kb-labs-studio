# KB Labs Studio (@kb-labs/studio)

> **Unified web dashboard for observing and managing the KB Labs ecosystem.** React-based web application that provides observability and management capabilities for the KB Labs ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.18.0+-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0.0+-orange.svg)](https://pnpm.io/)

## 🎯 Vision

KB Labs Studio is a React-based web application that provides observability and management capabilities for the KB Labs ecosystem, including audit, release management, devlink, mind, and analytics. This project serves as the central dashboard for the **@kb-labs** ecosystem and enables unified monitoring and management across all products.

The project solves the problem of fragmented observability across multiple KB Labs tools by providing a unified dashboard for monitoring and managing the entire ecosystem. Instead of switching between different CLI tools and separate interfaces, developers can use Studio to observe KPIs, audit results, release status, dependency graphs, knowledge freshness, and analytics in one place.

This project is part of the **@kb-labs** ecosystem and integrates seamlessly with REST API, API Contracts, UI, and all other KB Labs tools.

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/kirill-baranov/kb-labs-studio.git
cd kb-labs-studio

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Studio will be available at http://localhost:3000
```

### Building

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

### Running Locally with Mocks

By default, Studio runs with mock data sources. No backend required for development.

To switch to HTTP sources:

```bash
VITE_DATA_SOURCE_MODE=http \
VITE_API_BASE_URL=http://localhost:5050/api/v1 \
VITE_EVENTS_BASE_URL=http://localhost:5050/api/v1 \
pnpm dev
```

## ✨ Features

- **Dashboard**: KPIs overview, activity charts, and recent activity
- **Audit**: Package audit results and reports
- **Release**: Package release preview and execution
- **DevLink**: Dependency graph and cycle detection (coming soon)
- **Mind**: Knowledge freshness verification (coming soon)
- **Analytics**: Event metrics and performance charts (coming soon)
- **Settings**: Configuration and data source management
- **SSE-aware registry**: Auto-retry registry feed with configurable base URL/path and optional access token via query string (`VITE_EVENTS_AUTH_TOKEN`).
- **Theme System**: Light/Dark/Auto theme switching with CSS variables
- **Data Visualization**: Interactive charts with drill-down capabilities

## 📁 Repository Structure

```
kb-labs-studio/
├── apps/                    # Applications
│   └── studio/              # Main React SPA application
├── packages/                # Core packages
│   ├── ui-core/             # Design tokens and themes (framework-agnostic)
│   ├── ui-react/            # Shared React components (future kb-labs-ui)
│   └── data-client/         # API SDK with versioned contracts and mocks
├── docs/                    # Documentation
│   └── adr/                 # Architecture Decision Records
└── scripts/                 # Utility scripts
```

### Directory Descriptions

- **`apps/studio/`** - Main React SPA application with dashboard, audit, release, and settings modules
- **`packages/ui-core/`** - Framework-agnostic design tokens and themes
- **`packages/ui-react/`** - Shared React component library with KB-prefixed wrappers around Ant Design
- **`packages/data-client/`** - API SDK with versioned contracts, mocks, and TanStack Query hooks
- **`docs/`** - Documentation including ADRs and guides

## 📦 Packages

| Package | Description |
|---------|-------------|
| [@kb-labs/ui-core](./packages/ui-core/) | Design tokens and themes (framework-agnostic) |
| [@kb-labs/ui-react](./packages/ui-react/) | Shared React component library (KB-prefixed wrappers) |
| [@kb-labs/data-client](./packages/data-client/) | API SDK with versioned contracts and mocks |

### Package Details

**@kb-labs/ui-core** provides the design system foundation:
- Design tokens (colors, spacing, typography, radius, shadows)
- Theme system (light/dark) with CSS variable generator
- Framework-agnostic design system

**@kb-labs/ui-react** provides shared React components:
- KB-prefixed components wrapping Ant Design React
- Generic business components (StatCard, EmptyState, Charts)
- Layout components (KBPageLayout, KBHeader, KBSidebar, KBContent)
- Chart components (KBLineChart, KBColumnChart, KBAreaChart, KBPieChart, KBBarChart)
- Theme integration via CSS variables and Ant Design tokens

**@kb-labs/data-client** provides the data layer:
- TypeScript interfaces + Zod schemas (v1.0)
- Audit, Release, System data source interfaces
- Deterministic mock implementations with fixtures
- TanStack Query hooks for data fetching
- Factory for switching between mock and HTTP modes

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm test:coverage` | Run tests with coverage reporting |
| `pnpm lint` | Lint all code |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | TypeScript type checking |
| `pnpm check` | Run lint, type-check, and tests |
| `pnpm ci` | Full CI pipeline (clean, build, check) |
| `pnpm clean` | Clean build artifacts |
| `pnpm clean:all` | Clean all node_modules and build artifacts |

## 🏗️ Architecture

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

### Configuration

#### Environment Variables

- `VITE_DATA_SOURCE_MODE`: `mock` (default) or `http`
- `VITE_API_BASE_URL`: Base URL for HTTP data sources (REST API)
- `VITE_EVENTS_BASE_URL`: Base URL for SSE events (defaults to `VITE_API_BASE_URL`)
- `VITE_EVENTS_REGISTRY_PATH`: Path for registry SSE stream (default `/events/registry`)
- `VITE_EVENTS_AUTH_TOKEN`: Optional access token appended to SSE URL as `access_token=<token>`
- `VITE_EVENTS_HEADERS`: JSON object of additional headers for SSE (if terminating proxy injects them upstream)

#### Studio Config

Located in `apps/studio/src/config/studio.config.ts`:
- Data source mode
- API base URL
- Feature flags (enableDevlink, enableMind, enableAnalytics)
- SSE configuration (base URL, registry path, retry delays, custom headers/token)

## 📋 Development Policies

- **Code Style**: ESLint + Prettier, TypeScript strict mode
- **Testing**: Vitest + Testing Library with comprehensive test coverage
- **Versioning**: SemVer with automated releases through Changesets
- **Architecture**: Document decisions in ADRs (see `docs/adr/`)
- **UI Components**: KB-prefixed wrappers around Ant Design for consistency
- **Data Layer**: Mock-first development with deterministic fixtures

## 🔧 Requirements

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.11.0

## 📚 Documentation

- [Documentation Standard](./docs/DOCUMENTATION.md) - Full documentation guidelines
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Architecture Decisions](./docs/adr/) - ADRs for this project

**Guides:**
- [ADR-0018: Ant Design Migration](./docs/adr/0018-ant-design-migration.md) - UI library migration details

## 🔗 Related Packages

### Dependencies

- [@kb-labs/api-contracts](https://github.com/KirillBaranov/kb-labs-api-contracts) - API contracts and schemas
- [@kb-labs/rest-api](https://github.com/KirillBaranov/kb-labs-rest-api) - REST API backend

### Used By

- All KB Labs ecosystem users (web dashboard)

### Ecosystem

- [KB Labs](https://github.com/KirillBaranov/kb-labs) - Main ecosystem repository

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and contribution process.

## 📄 License

MIT © KB Labs

---

**See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and contribution process.**
