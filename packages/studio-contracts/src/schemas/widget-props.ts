/**
 * @module @kb-labs/studio-contracts/schemas
 * Zod runtime validation schemas for widget props
 *
 * This provides both compile-time types (TypeScript) and runtime validation (Zod).
 * Use these schemas to validate widget data from external sources (API, user input).
 */

import { z } from 'zod';

// =============================================================================
// Base Widget Schema
// =============================================================================

/**
 * Base schema shared by all widgets
 */
export const BaseWidgetPropsSchema = z.object({
  id: z.string().min(1, 'Widget ID is required'),
  kind: z.string().min(1, 'Widget kind is required'),
  options: z.record(z.unknown()).optional(),
  data: z.unknown().optional(),
});

// =============================================================================
// Display Widgets (14)
// =============================================================================

/**
 * Metric widget - displays single numeric value with trend
 */
export const MetricWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('metric'),
  options: z.object({
    label: z.string().optional(),
    suffix: z.string().optional(),
    prefix: z.string().optional(),
  }).optional(),
  data: z.object({
    value: z.union([z.string(), z.number()]),
    trend: z.enum(['up', 'down', 'neutral']).optional(),
  }).optional(),
});

/**
 * Metric Group widget - displays multiple metrics in a grid
 */
export const MetricGroupWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('metric-group'),
  data: z.object({
    metrics: z.array(z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      trend: z.enum(['up', 'down', 'neutral']).optional(),
    })),
  }).optional(),
});

/**
 * Table widget - displays data in rows and columns
 */
export const TableWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('table'),
  options: z.object({
    columns: z.array(z.object({
      key: z.string(),
      title: z.string(),
      dataIndex: z.string(),
      width: z.number().optional(),
      align: z.enum(['left', 'center', 'right']).optional(),
    })),
    pagination: z.boolean().optional(),
    pageSize: z.number().int().positive().optional(),
  }).optional(),
  data: z.object({
    rows: z.array(z.record(z.unknown())),
  }).optional(),
});

/**
 * Card widget - displays single card with title, content, actions
 */
export const CardWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('card'),
  data: z.object({
    title: z.string(),
    content: z.string(),
    footer: z.string().optional(),
  }).optional(),
});

/**
 * Card List widget - displays list of cards
 */
export const CardListWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('cardlist'),
  data: z.object({
    cards: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      footer: z.string().optional(),
    })),
  }).optional(),
});

/**
 * Chart Line widget - line chart
 */
export const ChartLineWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('chart-line'),
  options: z.object({
    xAxisLabel: z.string().optional(),
    yAxisLabel: z.string().optional(),
    height: z.number().int().positive().optional(),
  }).optional(),
  data: z.object({
    series: z.array(z.object({
      name: z.string(),
      data: z.array(z.object({
        x: z.union([z.string(), z.number()]),
        y: z.number(),
      })),
    })),
  }).optional(),
});

/**
 * Chart Bar widget - bar chart
 */
export const ChartBarWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('chart-bar'),
  options: z.object({
    xAxisLabel: z.string().optional(),
    yAxisLabel: z.string().optional(),
    height: z.number().int().positive().optional(),
    horizontal: z.boolean().optional(),
  }).optional(),
  data: z.object({
    categories: z.array(z.string()),
    series: z.array(z.object({
      name: z.string(),
      data: z.array(z.number()),
    })),
  }).optional(),
});

/**
 * Chart Pie widget - pie/donut chart
 */
export const ChartPieWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('chart-pie'),
  options: z.object({
    height: z.number().int().positive().optional(),
    donut: z.boolean().optional(),
  }).optional(),
  data: z.object({
    slices: z.array(z.object({
      label: z.string(),
      value: z.number(),
      color: z.string().optional(),
    })),
  }).optional(),
});

/**
 * Chart Area widget - area chart
 */
export const ChartAreaWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('chart-area'),
  options: z.object({
    xAxisLabel: z.string().optional(),
    yAxisLabel: z.string().optional(),
    height: z.number().int().positive().optional(),
  }).optional(),
  data: z.object({
    series: z.array(z.object({
      name: z.string(),
      data: z.array(z.object({
        x: z.union([z.string(), z.number()]),
        y: z.number(),
      })),
    })),
  }).optional(),
});

/**
 * Timeline widget - vertical timeline of events
 */
export const TimelineWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('timeline'),
  data: z.object({
    items: z.array(z.object({
      id: z.string(),
      timestamp: z.string(),
      title: z.string(),
      description: z.string().optional(),
    })),
  }).optional(),
});

/**
 * Tree widget - hierarchical tree structure
 */
export const TreeWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('tree'),
  data: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      label: z.string(),
      children: z.array(z.unknown()).optional(),
    }).passthrough()), // Allow nested children
  }).optional(),
});

/**
 * JSON widget - formatted JSON viewer
 */
export const JsonWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('json'),
  data: z.object({
    value: z.unknown(),
  }).optional(),
});

/**
 * Diff widget - side-by-side diff viewer
 */
export const DiffWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('diff'),
  data: z.object({
    before: z.string(),
    after: z.string(),
  }).optional(),
});

/**
 * Logs widget - log viewer with filtering
 */
export const LogsWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('logs'),
  options: z.object({
    maxLines: z.number().int().positive().optional(),
    showTimestamp: z.boolean().optional(),
    showLevel: z.boolean().optional(),
  }).optional(),
  data: z.object({
    logs: z.array(z.object({
      timestamp: z.string(),
      level: z.enum(['debug', 'info', 'warn', 'error']),
      message: z.string(),
    })),
  }).optional(),
});

// =============================================================================
// Form Widgets (6)
// =============================================================================

/**
 * Form widget - form container with fields
 */
export const FormWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('form'),
  options: z.object({
    fields: z.array(z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'number', 'email', 'password']),
      required: z.boolean().optional(),
    })),
  }).optional(),
});

/**
 * Input widget - single text input
 */
export const InputWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('input'),
  options: z.object({
    label: z.string().optional(),
    placeholder: z.string().optional(),
    type: z.enum(['text', 'number', 'email', 'password']).optional(),
  }).optional(),
});

/**
 * Select widget - dropdown select
 */
export const SelectWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('select'),
  options: z.object({
    label: z.string().optional(),
    placeholder: z.string().optional(),
    options: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })),
  }).optional(),
});

/**
 * Checkbox Group widget - multiple checkboxes
 */
export const CheckboxGroupWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('checkbox-group'),
  options: z.object({
    label: z.string().optional(),
    options: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })),
  }).optional(),
});

/**
 * Switch widget - toggle switch
 */
export const SwitchWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('switch'),
  options: z.object({
    label: z.string().optional(),
  }).optional(),
});

/**
 * Date Picker widget - date selection
 */
export const DatePickerWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('date-picker'),
  options: z.object({
    label: z.string().optional(),
    format: z.string().optional(),
  }).optional(),
});

// =============================================================================
// Layout Widgets (5)
// =============================================================================

/**
 * Section widget - container with header
 */
export const SectionWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('section'),
  options: z.object({
    title: z.string().optional(),
    collapsible: z.boolean().optional(),
  }).optional(),
});

/**
 * Grid widget - CSS grid layout
 */
export const GridWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('grid'),
  options: z.object({
    columns: z.number().int().positive().optional(),
    gap: z.number().int().nonnegative().optional(),
  }).optional(),
});

/**
 * Stack widget - vertical/horizontal stack
 */
export const StackWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('stack'),
  options: z.object({
    direction: z.enum(['vertical', 'horizontal']).optional(),
    spacing: z.number().int().nonnegative().optional(),
  }).optional(),
});

/**
 * Tabs widget - tabbed interface
 */
export const TabsWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('tabs'),
  options: z.object({
    tabs: z.array(z.object({
      key: z.string(),
      label: z.string(),
    })),
  }).optional(),
});

/**
 * Modal widget - modal dialog
 */
export const ModalWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('modal'),
  options: z.object({
    title: z.string().optional(),
    width: z.number().int().positive().optional(),
  }).optional(),
});

// =============================================================================
// Navigation Widgets (3)
// =============================================================================

/**
 * Breadcrumb widget - breadcrumb navigation
 */
export const BreadcrumbWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('breadcrumb'),
  data: z.object({
    items: z.array(z.object({
      label: z.string(),
      path: z.string().optional(),
    })),
  }).optional(),
});

/**
 * Stepper widget - step progress indicator
 */
export const StepperWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('stepper'),
  data: z.object({
    steps: z.array(z.object({
      label: z.string(),
      status: z.enum(['pending', 'active', 'completed', 'error']).optional(),
    })),
    currentStep: z.number().int().nonnegative().optional(),
  }).optional(),
});

/**
 * Menu widget - navigation menu
 */
export const MenuWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('menu'),
  options: z.object({
    items: z.array(z.object({
      key: z.string(),
      label: z.string(),
      path: z.string().optional(),
    })),
  }).optional(),
});

// =============================================================================
// Feedback Widgets (2)
// =============================================================================

/**
 * Alert widget - alert/notification message
 */
export const AlertWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('alert'),
  data: z.object({
    type: z.enum(['info', 'success', 'warning', 'error']),
    message: z.string(),
  }).optional(),
});

/**
 * Confirm widget - confirmation dialog
 */
export const ConfirmWidgetPropsSchema = BaseWidgetPropsSchema.extend({
  kind: z.literal('confirm'),
  data: z.object({
    title: z.string(),
    message: z.string(),
  }).optional(),
});

// =============================================================================
// Discriminated Union (All Widget Types)
// =============================================================================

/**
 * Discriminated union of all widget prop schemas
 * This allows TypeScript to narrow types based on the `kind` field
 */
export const WidgetPropsSchema = z.discriminatedUnion('kind', [
  // Display (14)
  MetricWidgetPropsSchema,
  MetricGroupWidgetPropsSchema,
  TableWidgetPropsSchema,
  CardWidgetPropsSchema,
  CardListWidgetPropsSchema,
  ChartLineWidgetPropsSchema,
  ChartBarWidgetPropsSchema,
  ChartPieWidgetPropsSchema,
  ChartAreaWidgetPropsSchema,
  TimelineWidgetPropsSchema,
  TreeWidgetPropsSchema,
  JsonWidgetPropsSchema,
  DiffWidgetPropsSchema,
  LogsWidgetPropsSchema,
  // Form (6)
  FormWidgetPropsSchema,
  InputWidgetPropsSchema,
  SelectWidgetPropsSchema,
  CheckboxGroupWidgetPropsSchema,
  SwitchWidgetPropsSchema,
  DatePickerWidgetPropsSchema,
  // Layout (5)
  SectionWidgetPropsSchema,
  GridWidgetPropsSchema,
  StackWidgetPropsSchema,
  TabsWidgetPropsSchema,
  ModalWidgetPropsSchema,
  // Navigation (3)
  BreadcrumbWidgetPropsSchema,
  StepperWidgetPropsSchema,
  MenuWidgetPropsSchema,
  // Feedback (2)
  AlertWidgetPropsSchema,
  ConfirmWidgetPropsSchema,
]);

// =============================================================================
// TypeScript Types (Inferred from Zod)
// =============================================================================

export type WidgetProps = z.infer<typeof WidgetPropsSchema>;
export type MetricWidgetProps = z.infer<typeof MetricWidgetPropsSchema>;
export type TableWidgetProps = z.infer<typeof TableWidgetPropsSchema>;
export type ChartPieWidgetProps = z.infer<typeof ChartPieWidgetPropsSchema>;
// ... export all 29 types if needed

// =============================================================================
// Validation Helper
// =============================================================================

/**
 * Validates widget props and returns typed result
 * @param widget - Unknown widget data from API
 * @returns Validation result with typed data or error
 */
export function validateWidgetProps(widget: unknown): {
  success: boolean;
  data?: WidgetProps;
  error?: z.ZodError;
} {
  const result = WidgetPropsSchema.safeParse(widget);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}
