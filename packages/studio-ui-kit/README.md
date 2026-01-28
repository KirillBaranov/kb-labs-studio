# @kb-labs/studio-ui-kit

Professional React UI components using Ant Design and design tokens from `@kb-labs/studio-ui-core`.

## 🎯 Key Principles

- ✅ **NO hardcoded colors** - All colors from Ant Design tokens via `theme.useToken()`
- ✅ **NO inline styles** - All spacing/typography from design tokens
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Composable** - Build complex components from primitives

## 📦 Installation

```bash
pnpm add @kb-labs/studio-ui-kit
```

## 🚀 Usage

```tsx
import { UIText, UIBox, UIFlex, UIMetricCard, UIBadge } from '@kb-labs/studio-ui-kit';

function MyComponent() {
  return (
    <UIBox p={4}>
      <UIText size="2xl" weight="bold">Hello World</UIText>

      <UIFlex gap={2} align="center">
        <UIBadge variant="success">Active</UIBadge>
        <UIText size="sm" color="secondary">User is online</UIText>
      </UIFlex>

      <UIMetricCard
        label="Active Users"
        value={1234}
        trend="up"
        delta={15.3}
        unit="users"
      />
    </UIBox>
  );
}
```

<!-- AUTO-GENERATED:START -->

## 📊 Component Stats

- **Total Components:** 29
- **With Tests:** 4/29 (14%)

**By Category:**

- Primitives: 3
- Core: 6
- Layout: 1
- Form: 6
- Navigation: 3
- Composite: 2
- Feedback: 4
- Overlay: 2
- Content: 2

## 📚 Component Reference

### Primitives

Foundation components for layout and typography

| Component | Description | Tests |
|-----------|-------------|-------|
| **UIBox** | Box component - Layout primitive with spacing tokens | ❌ |
| **UIFlex** | Flex component - Flexbox layout primitive | ❌ |
| **UIText** | Text component - Typography primitive with design tokens | ✅ |

### Core

Essential UI components

| Component | Description | Tests |
|-----------|-------------|-------|
| **UIBadge** | Badge component - Status indicator with semantic colors | ❌ |
| **UIButton** | UIButton component - Action button with semantic variants | ✅ |
| **UICard** | UICard component - Card container with header/footer | ❌ |
| **UIIcon** | UIIcon component - Icon wrapper | ❌ |
| **UITag** | UITag component - Label/category tag with semantic colors | ❌ |
| **UITitle** | UITitle component - Page/section titles with hierarchy | ❌ |

### Layout

Layout and container components

| Component | Description | Tests |
|-----------|-------------|-------|
| **UIStack** | UIStack component - Vertical/horizontal spacing layout | ❌ |

### Form

Form controls and inputs

| Component | Description | Tests |
|-----------|-------------|-------|
| **UICheckbox** | UICheckbox component - Checkbox input | ❌ |
| **UIDatePicker** | UIDatePicker component - Date/time picker | ❌ |
| **UIForm** | UIForm component - Form wrapper with validation | ❌ |
| **UIInput** | UIInput component - Text input with variants | ✅ |
| **UISelect** | UISelect component - Dropdown select with icon support | ❌ |
| **UISwitch** | UISwitch component - Toggle switch | ❌ |

### Navigation

Navigation and menu components

| Component | Description | Tests |
|-----------|-------------|-------|
| **UIAccordion** | UIAccordion component - Collapsible panels | ❌ |
| **UIBreadcrumb** | UIBreadcrumb component - Navigation breadcrumb trail | ❌ |
| **UITabs** | UITabs component - Tabbed navigation | ❌ |

### Composite

Complex composed components

| Component | Description | Tests |
|-----------|-------------|-------|
| **UIHeader** | UIHeader component - Page header with title, subtitle, and breadcrumbs | ✅ |
| **UIPage** | UIPage component - Page container with padding and max-width | ❌ |

### Feedback

Feedback and notification components

| Component | Description | Tests |
|-----------|-------------|-------|
| **UIAlert** | UIAlert component - Alert messages and notifications | ❌ |
| **UIEmptyState** | UIEmptyState component - Empty state placeholder | ❌ |
| **UIErrorState** | UIErrorState component - Error state display | ❌ |
| **UISkeleton** | UISkeleton component - Loading skeleton | ❌ |

### Overlay

Modal and overlay components

| Component | Description | Tests |
|-----------|-------------|-------|
| **UIModal** | UIModal component - Modal dialog | ❌ |
| **UITooltip** | UITooltip component - Tooltip overlay | ❌ |

### Content

Content display components

| Component | Description | Tests |
|-----------|-------------|-------|
| **UIJsonViewer** | UIJsonViewer component - JSON content viewer | ❌ |
| **UIMarkdownViewer** | UIMarkdownViewer component - Markdown content viewer | ❌ |

<!-- AUTO-GENERATED:END -->

## 🎨 Design Tokens

All components use design tokens from `@kb-labs/studio-ui-core`:

### Typography
```tsx
<UIText size="xs">Extra small text</UIText>
<UIText size="sm">Small text</UIText>
<UIText size="base">Base text</UIText>
<UIText size="lg">Large text</UIText>
<UIText size="xl">Extra large text</UIText>
<UIText size="2xl">2X large text</UIText>
```

### Colors
```tsx
<UIText color="primary">Primary text</UIText>
<UIText color="secondary">Secondary text</UIText>
<UIText color="success">Success text</UIText>
<UIText color="warning">Warning text</UIText>
<UIText color="error">Error text</UIText>
<UIText color="info">Info text</UIText>
```

### Spacing
```tsx
<UIBox p={2}>Padding 0.5rem</UIBox>
<UIBox p={4}>Padding 1rem</UIBox>
<UIBox p={6}>Padding 1.5rem</UIBox>
<UIBox m={2}>Margin 0.5rem</UIBox>
```

## 🏗️ Component Hierarchy

```
Primitives (Tier 1)
  ├── UIText - Typography
  ├── UIBox - Spacing
  └── UIFlex - Layout

Components (Tier 2)
  ├── UIBadge - Status indicators
  └── UIMetricCard - Metric displays
```

## 📖 Examples

### Metric Display
```tsx
<UIMetricCard
  label="Revenue"
  value={45230}
  unit="USD"
  trend="up"
  delta={12.5}
  showDelta={true}
  size="default"
/>
```

### Badge Variants
```tsx
<UIBadge variant="success">Success</UIBadge>
<UIBadge variant="warning">Warning</UIBadge>
<UIBadge variant="error">Error</UIBadge>
<UIBadge variant="info">Info</UIBadge>
<UIBadge variant="default">Default</UIBadge>
```

### Layout Composition
```tsx
<UIBox p={4} mb={3}>
  <UIFlex direction="column" gap={2}>
    <UIText size="lg" weight="bold">Header</UIText>
    <UIText size="sm" color="secondary">Description</UIText>
  </UIFlex>
</UIBox>
```

## 🔗 Dependencies

- `react` (peer) - ^18.3.1
- `react-dom` (peer) - ^18.3.1
- `antd` (peer) - ^5.22.5
- `@kb-labs/studio-ui-core` - Design tokens

## 📝 License

Private - KB Labs
