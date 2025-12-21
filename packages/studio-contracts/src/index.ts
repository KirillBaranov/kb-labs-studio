/**
 * @module @kb-labs/studio-contracts
 * Studio widget system type contracts.
 *
 * This package is the source of truth for all Studio-related types.
 * Other packages (sdk, plugin-contracts, rest-api-contracts) re-export from here.
 *
 * @example
 * ```typescript
 * import {
 *   StudioWidgetKind,
 *   StudioWidgetDecl,
 *   MetricOptions,
 *   MetricData,
 * } from '@kb-labs/studio-contracts';
 * ```
 */

// =============================================================================
// Core Types
// =============================================================================

export {
  type StudioWidgetKind,
  type CompositeWidgetKind,
  type LeafWidgetKind,
  type WidgetCategory,
  WIDGET_CATEGORIES,
  COMPOSITE_WIDGET_KINDS,
  isCompositeKind,
} from './kinds.js';

export {
  type StudioWidgetDecl,
  type LeafWidgetDecl,
  type CompositeWidgetDecl,
  type LayoutHint,
  type SchemaRef,
  type WidgetData,
  type WidgetDeclByKind,
  isCompositeWidget,
  isLeafWidget,
} from './widget.js';

export {
  type StudioLayoutDecl,
  type StudioMenuDecl,
  type StudioConfig,
  type LayoutKind,
  type LayoutConfig,
  type GridLayoutConfig,
  type StackLayoutConfig,
  isGridConfig,
  isStackConfig,
} from './layout.js';

// =============================================================================
// Data Sources
// =============================================================================

export {
  type DataSource,
  type StaticDataSource,
  type RestDataSource,
  type MockDataSource,
  isStaticDataSource,
  isRestDataSource,
  isMockDataSource,
} from './data-source.js';

// =============================================================================
// Actions
// =============================================================================

export {
  type ActionHandler,
  type ActionHandlerType,
  type RestActionHandler,
  type NavigateActionHandler,
  type EmitActionHandler,
  type WidgetAction,
  type ActionConfirm,
  isRestActionHandler,
  isNavigateActionHandler,
  isEmitActionHandler,
} from './actions.js';

// =============================================================================
// Events
// =============================================================================

export {
  type WidgetEventConfig,
  type WidgetEvent,
  type StandardEventName,
  STANDARD_EVENTS,
} from './events.js';

// =============================================================================
// Visibility / RBAC
// =============================================================================

export { type VisibilityRule, type UserContext, matchesVisibility } from './visibility.js';

// =============================================================================
// Registry
// =============================================================================

export {
  type StudioRegistry,
  type StudioPluginEntry,
  type FlattenedRegistry,
  STUDIO_SCHEMA_VERSION,
  STUDIO_SCHEMA_VERSION_NUMBER,
  createEmptyRegistry,
  flattenRegistry,
  validateSchemaVersion,
  needsMigration,
} from './registry.js';

// =============================================================================
// Widget Options
// =============================================================================

export type {
  // Display (14)
  MetricOptions,
  MetricGroupOptions,
  TableOptions,
  TableColumn,
  CardOptions,
  CardListOptions,
  ChartLineOptions,
  ChartBarOptions,
  ChartPieOptions,
  ChartAreaOptions,
  TimelineOptions,
  TreeOptions,
  JsonOptions,
  DiffOptions,
  LogsOptions,
  TrendDirection,
  LogLevel,
  // Form (6)
  FormOptions,
  FormFieldDef,
  InputOptions,
  SelectOptions,
  SelectOptionItem,
  CheckboxGroupOptions,
  CheckboxItem,
  SwitchOptions,
  DatePickerOptions,
  ValidationRule,
  // Layout (5)
  SectionOptions,
  GridOptions,
  StackOptions,
  TabsOptions,
  TabDef,
  ModalOptions,
  // Navigation (3)
  BreadcrumbOptions,
  BreadcrumbItemDef,
  StepperOptions,
  StepDef,
  MenuOptions,
  MenuItemDef,
  // Feedback (2)
  AlertOptions,
  AlertType,
  ConfirmOptions,
  // Map
  WidgetOptionsMap,
  OptionsForKind,
} from './options/index.js';

// =============================================================================
// Widget Data Contracts
// =============================================================================

export type {
  // Display (14)
  MetricData,
  MetricGroupData,
  TableData,
  TableRow,
  CardData,
  CardListData,
  ChartLineData,
  ChartBarData,
  ChartPieData,
  ChartAreaData,
  ChartDataPoint,
  ChartSeries,
  PieSlice,
  TimelineData,
  TimelineItem,
  TreeData,
  TreeNode,
  JsonData,
  DiffData,
  LogsData,
  LogEntry,
  // Form (6)
  FormData,
  FormFieldError,
  InputData,
  SelectData,
  CheckboxGroupData,
  SwitchData,
  DatePickerData,
  // Navigation (3)
  BreadcrumbData,
  StepperData,
  MenuData,
  // Feedback (3)
  AlertData,
  ModalData,
  ConfirmData,
  // Map
  WidgetDataMap,
  DataForKind,
} from './data/index.js';
