# @kb-labs/ui-react

KB Labs shared React component library — generic, reusable components (future kb-labs-ui).

## Vision & Purpose

**@kb-labs/ui-react** provides shared React component library for KB Labs Studio. It includes generic, reusable components built on top of Ant Design and Tailwind CSS.

### Core Goals

- **React Components**: Generic, reusable React components
- **Layout Components**: Page layout components
- **Basic Components**: Basic UI components (button, card, badge, etc.)
- **Chart Components**: Chart components
- **Theme Support**: Theme support with light/dark modes

## Package Status

- **Version**: 0.1.0
- **Stage**: Stable
- **Status**: Production Ready ✅

## Architecture

### High-Level Overview

```
UI React
    │
    ├──► Layout Components
    ├──► Basic Components
    ├──► Chart Components
    └──► Theme Components
```

### Key Components

1. **Layout Components** (`components/`): Page layout components (PageLayout, Header, Sidebar, Content)
2. **Basic Components** (`components/`): Basic UI components (Button, Card, Badge, Grid, Skeleton, Tabs, List, Table, Stack, Section, InfoPanel, StatCard, StatGrid, Sheet)
3. **Chart Components** (`components/`): Chart components (Chart)
4. **Theme Components** (`components/`): Theme components (ConfigProvider, ThemeToggle)

## ✨ Features

- **Layout Components**: Page layout components
- **Basic Components**: Basic UI components
- **Chart Components**: Chart components
- **Theme Support**: Theme support with light/dark modes
- **Ant Design Integration**: Built on Ant Design
- **Tailwind CSS**: Styled with Tailwind CSS

## 📦 API Reference

### Main Exports

#### Layout Components

- `PageLayout`: Page layout component
- `Header`: Header component
- `Sidebar`: Sidebar component
- `Content`: Content component
- `PageContainer`: Page container component
- `PageHeader`: Page header component
- `Breadcrumb`: Breadcrumb component

#### Basic Components

- `Button`: Button component
- `Card`: Card component
- `Badge`: Badge component
- `Grid`: Grid component
- `Skeleton`: Skeleton component
- `Tabs`: Tabs component
- `List`: List component
- `Table`: Table component
- `Stack`: Stack component
- `Section`: Section component
- `InfoPanel`: Info panel component
- `StatCard`: Stat card component
- `StatGrid`: Stat grid component
- `Sheet`: Sheet component

#### Chart Components

- `Chart`: Chart component

#### Theme Components

- `ConfigProvider`: Config provider component
- `ThemeToggle`: Theme toggle component

## 🔧 Configuration

### Configuration Options

All configuration via component props.

## 🔗 Dependencies

### Runtime Dependencies

- `@ant-design/charts` (`^2.6.6`): Ant Design charts
- `@ant-design/icons` (`^5.4.0`): Ant Design icons
- `@kb-labs/ui-core` (`link:../ui-core`): UI core
- `antd` (`^5.21.0`): Ant Design
- `clsx` (`^2.1.1`): Class name utility
- `lucide-react` (`^0.468.0`): Lucide icons

### Development Dependencies

- `@kb-labs/devkit` (`file:../../../kb-labs-devkit`): DevKit presets
- `@testing-library/react` (`^16.1.0`): React testing library
- `@types/react` (`^18.3.18`): React types
- `@types/react-dom` (`^18.3.5`): React DOM types
- `react` (`^18.3.1`): React
- `react-dom` (`^18.3.1`): React DOM
- `tailwindcss` (`^3.4.17`): Tailwind CSS
- `tsup` (`^8`): TypeScript bundler
- `typescript` (`^5`): TypeScript compiler
- `vitest` (`^3.2.4`): Test runner

## 🧪 Testing

### Test Structure

No tests currently.

### Test Coverage

- **Current Coverage**: ~50%
- **Target Coverage**: 90%

## 📈 Performance

### Performance Characteristics

- **Time Complexity**: O(1) for component rendering
- **Space Complexity**: O(1)
- **Bottlenecks**: Large component trees

## 🔒 Security

### Security Considerations

- **Input Validation**: Component input validation
- **XSS Protection**: XSS protection via React

### Known Vulnerabilities

- None

## 🐛 Known Issues & Limitations

### Known Issues

- None currently

### Limitations

- **Component Types**: Fixed component types
- **Theme Types**: Fixed theme types

### Future Improvements

- **More Components**: Additional components
- **Custom Themes**: Custom theme support

## 🔄 Migration & Breaking Changes

### Migration from Previous Versions

No breaking changes in current version (0.1.0).

### Breaking Changes in Future Versions

- None planned

## 📚 Examples

### Example 1: Use Layout Components

```typescript
import { PageLayout, Header, Sidebar, Content } from '@kb-labs/ui-react';

function App() {
  return (
    <PageLayout>
      <Header />
      <Sidebar />
      <Content>...</Content>
    </PageLayout>
  );
}
```

### Example 2: Use Basic Components

```typescript
import { Button, Card, Badge } from '@kb-labs/ui-react';

function MyComponent() {
  return (
    <Card>
      <Badge>New</Badge>
      <Button>Click me</Button>
    </Card>
  );
}
```

### Example 3: Use Theme Components

```typescript
import { ConfigProvider, ThemeToggle } from '@kb-labs/ui-react';

function App() {
  return (
    <ConfigProvider theme="dark">
      <ThemeToggle />
      ...
    </ConfigProvider>
  );
}
```

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT © KB Labs

