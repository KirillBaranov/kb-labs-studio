# Contributing to KB Labs Studio

Thanks for considering a contribution! 🚀

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build
pnpm build

# Run tests
pnpm test

# Type-check
pnpm type-check

# Lint
pnpm lint
```

---

## Development Guidelines

### Coding Standards

- **ESLint + Prettier**: All code must pass linting. Run `pnpm lint` before pushing.
- **TypeScript**: Strict mode, no `any` without justification.
- **Testing**: Cover new features with tests. Run `pnpm test`.
- **Commits**: Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.

### Component Organization

**Key Principle: Generic vs Domain Separation**

- **`packages/ui-react/`**: ONLY generic, reusable components (KBButton, KBCard, StatCard)
  - These may be extracted to standalone `@kb-labs/ui` later
  - Must be framework-agnostic in behavior
  
- **`apps/studio/src/components/`**: ONLY Studio-specific components
  - RunBadge, HealthIndicator, StudioNav, etc.
  - Domain-specific, NOT meant for extraction

**Decision Tree:**
```
Is it reusable across products? → ui-react
Is it Studio-specific?           → studio/src/components
```

### Data Layer Patterns

- **Contracts**: All data structures in `packages/data-client/src/contracts/`
- **Mock-first**: Build features with mock data, swap to real API later
- **Factory pattern**: Use `createDataSources()` to switch modes
- **Query keys**: Centralized in `packages/data-client/src/query-keys.ts`

See [ADR-0011: Mock-First Data Strategy](docs/adr/0011-mock-first-data-strategy.md)

### Styling

- **Tailwind CSS**: Preferred for styling
- **Design tokens**: Use `ui-core` tokens via CSS variables
- **Dark mode**: Add `dark:` variants for all components
- **Responsive**: Mobile-first, desktop-focused for MVP

### Testing

- **Unit tests**: Vitest + Testing Library
- **E2E tests**: Playwright for smoke tests
- **Coverage**: Aim for 80%+ on business logic
- **Contract tests**: Zod schemas validate fixtures

### Architectural Decisions

- **ADRs required**: For architectural changes
- **Create ADR**: `docs/adr/XXXX-descriptive-name.md`
- **Follow template**: See `docs/adr/0000-template.md`
- **Link from README**: Reference in relevant docs

---

## DevKit Integration

Studio uses `@kb-labs/devkit` for shared tooling configurations.

### Key Points

- **Presets enforced**: No local configs outside devkit presets (except rare overrides)
- **ESLint**: Extends `@kb-labs/devkit/eslint/react.js`
- **TypeScript**: Extends `@kb-labs/devkit/tsconfig/react-app.json`
- **Vitest**: Uses `@kb-labs/devkit/vitest/react.js`
- **Vite**: Uses `@kb-labs/devkit/vite/react-app.js`
- **Tsup**: Uses `@kb-labs/devkit/tsup/react-lib.js`

### DevKit Commands

```bash
pnpm devkit:sync    # Sync configurations (auto on install)
pnpm devkit:check   # Check if sync needed
pnpm devkit:force   # Force sync
pnpm devkit:help    # Show help
```

### Customization

- **Prefer extending**: Don't override, extend devkit presets
- **Document reasons**: If override needed, explain in ADR
- **Stay updated**: Run `pnpm install` after devkit updates

See [ADR-0005: Use DevKit for Shared Tooling](docs/adr/0005-use-devkit-for-shared-tooling.md)

---

## Pull Request Process

1. **Branch**: Create feature branch from `main`
2. **Develop**: Make changes following guidelines
3. **Check**: Run `pnpm check` (lint + type-check + tests)
4. **E2E**: Run `pnpm test:e2e` for smoke tests
5. **Commit**: Use conventional commits
6. **PR**: Submit with clear description

### PR Checklist

- [ ] Code passes `pnpm check`
- [ ] Tests added/updated
- [ ] Documentation updated (if needed)
- [ ] ADR created (if architectural change)
- [ ] No console warnings/errors
- [ ] Build succeeds
- [ ] Type-check passes

---

## Package Structure

```
kb-labs-studio/
├── apps/studio/              # React SPA application
├── packages/
│   ├── ui-core/              # Design tokens, themes (no React)
│   ├── ui-react/             # Generic React components
│   └── data-client/          # Data layer, contracts, mocks
├── tests/e2e/                # Playwright E2E tests
└── docs/adr/                 # Architecture Decision Records
```

---

## Common Tasks

### Adding a New Component

**Generic component** (in ui-react):
```bash
# 1. Create component
packages/ui-react/src/components/kb-new-component.tsx

# 2. Export in index
packages/ui-react/src/index.ts

# 3. Use in Studio
import { KBNewComponent } from '@kb-labs/ui-react'
```

**Studio-specific component**:
```bash
# 1. Create component
apps/studio/src/components/new-component.tsx

# 2. Use directly
import { NewComponent } from '@/components/new-component'
```

### Adding a New Module

1. Create `apps/studio/src/modules/new-module/pages/`
2. Add route in `apps/studio/src/router.tsx`
3. Add navigation item in `StudioNav`
4. Follow flat composition pattern: page → containers → UI

### Adding a New Data Source

1. Define interface in `packages/data-client/src/sources/`
2. Create mock in `packages/data-client/src/mocks/`
3. Add fixture in `packages/data-client/src/mocks/fixtures/`
4. Update factory in `packages/data-client/src/factory.ts`
5. Create hooks in `packages/data-client/src/hooks/`
6. Add query keys in `packages/data-client/src/query-keys.ts`

---

## Questions?

- Check [README.md](./README.md) for overview
- Review [ADRs](./docs/adr/) for architecture decisions
- See [DevKit docs](../kb-labs-devkit/README.md) for tooling

---

**Thank you for contributing to KB Labs Studio!** 🎉
