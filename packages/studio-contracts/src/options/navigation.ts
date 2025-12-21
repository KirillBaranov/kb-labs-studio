/**
 * @module @kb-labs/studio-contracts/options/navigation
 * Options for navigation widgets (3 widgets).
 */

/**
 * Breadcrumb item definition.
 */
export interface BreadcrumbItemDef {
  /** Item label */
  label: string;
  /** Link target (layout ID or URL) */
  href?: string;
  /** Icon */
  icon?: string;
}

/**
 * Options for `breadcrumb` widget.
 */
export interface BreadcrumbOptions {
  /** Static items (alternative to data-driven) */
  items?: BreadcrumbItemDef[];
  /** Separator character/icon */
  separator?: string;
  /** Max items to show (rest collapsed) */
  maxItems?: number;
  /** Items to show before collapse */
  itemsBeforeCollapse?: number;
  /** Items to show after collapse */
  itemsAfterCollapse?: number;
  /** Show home icon */
  showHome?: boolean;
  /** Home icon */
  homeIcon?: string;
}

/**
 * Step definition for stepper widget.
 */
export interface StepDef {
  /** Step ID */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Step icon */
  icon?: string;
  /** Step status */
  status?: 'wait' | 'process' | 'finish' | 'error';
  /** Disabled state */
  disabled?: boolean;
  /** Subtitle text */
  subtitle?: string;
}

/**
 * Options for `stepper` widget.
 */
export interface StepperOptions {
  /** Static steps (alternative to data-driven) */
  steps?: StepDef[];
  /** Current step index */
  currentStep?: number;
  /** Stepper direction */
  direction?: 'horizontal' | 'vertical';
  /** Label placement */
  labelPlacement?: 'horizontal' | 'vertical';
  /** Clickable steps */
  clickable?: boolean;
  /** Show progress connector */
  progressDot?: boolean;
  /** Size */
  size?: 'sm' | 'md';
  /** Navigation type */
  type?: 'default' | 'navigation';
  /** Allow going to previous steps only */
  previousOnly?: boolean;
  /** Show step numbers */
  showNumbers?: boolean;
}

/**
 * Menu item definition.
 */
export interface MenuItemDef {
  /** Item ID */
  id: string;
  /** Item label */
  label: string;
  /** Icon */
  icon?: string;
  /** Link target */
  href?: string;
  /** Action on click */
  action?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Divider before this item */
  divider?: boolean;
  /** Danger variant (red) */
  danger?: boolean;
  /** Sub-menu items */
  children?: MenuItemDef[];
  /** Badge text */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'primary' | 'danger';
  /** Shortcut text (display only) */
  shortcut?: string;
}

/**
 * Options for `menu` widget.
 */
export interface MenuOptions {
  /** Static items (alternative to data-driven) */
  items?: MenuItemDef[];
  /** Menu mode */
  mode?: 'vertical' | 'horizontal' | 'inline';
  /** Trigger for dropdown */
  trigger?: 'click' | 'hover';
  /** Placement for dropdown */
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight';
  /** Collapsed state (for inline mode) */
  collapsed?: boolean;
  /** Selected item ID */
  selectedId?: string;
  /** Open sub-menu IDs */
  openIds?: string[];
  /** Theme variant */
  theme?: 'light' | 'dark';
  /** Show icons */
  showIcons?: boolean;
  /** Indent for nested items (pixels) */
  indent?: number;
}
