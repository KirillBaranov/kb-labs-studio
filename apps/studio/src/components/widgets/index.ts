/**
 * @module @kb-labs/studio-app/components/widgets
 * Widget components (29 total across 5 categories)
 *
 * Categories:
 * - Display (14): metric, metric-group, table, card, cardlist, chart-line, chart-bar, chart-pie, chart-area, timeline, tree, json, diff, logs
 * - Form (6): form, input, select, checkbox-group, switch, date-picker
 * - Layout (5): section, grid, stack, tabs, modal
 * - Navigation (3): breadcrumb, stepper, menu
 * - Feedback (2): alert, confirm
 */

// Display widgets (14)
export * from './display/index';

// Form widgets (6)
export * from './form/index';

// Layout widgets (5)
export * from './layout/index';

// Navigation widgets (3)
export * from './navigation/index';

// Feedback widgets (2)
export * from './feedback/index';

// Shared components
export * from './shared/index';

// Types
export type { BaseWidgetProps, WidgetState, LayoutHint, FormField, FormFieldType, FormWidgetOptions } from './types';
