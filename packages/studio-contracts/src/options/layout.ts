/**
 * @module @kb-labs/studio-contracts/options/layout
 * Options for layout/composite widgets (5 widgets).
 */

/**
 * Options for `section` widget.
 */
export interface SectionOptions {
  /** Collapsible section */
  collapsible?: boolean;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Section variant */
  variant?: 'default' | 'card' | 'bordered';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Header actions (besides collapse) */
  headerActions?: boolean;
  /** Divider below header */
  showDivider?: boolean;
  /** Icon for section header */
  icon?: string;
  /** Badge in header */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

/**
 * Options for `grid` widget.
 */
export interface GridOptions {
  /** Number of columns */
  columns?: number;
  /** Responsive column configuration */
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Gap between items in pixels */
  gap?: number;
  /** Row gap (overrides gap for rows) */
  rowGap?: number;
  /** Column gap (overrides gap for columns) */
  colGap?: number;
  /** Alignment of items */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** Justify content */
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  /** Auto-flow direction */
  autoFlow?: 'row' | 'column' | 'dense';
  /** Minimum child width for auto-fit */
  minChildWidth?: number;
}

/**
 * Options for `stack` widget.
 */
export interface StackOptions {
  /** Stack direction */
  direction?: 'horizontal' | 'vertical';
  /** Gap between items in pixels */
  gap?: number;
  /** Align items */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Wrap items */
  wrap?: boolean;
  /** Reverse order */
  reverse?: boolean;
  /** Divider between items */
  divider?: boolean;
  /** Divider style */
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Tab definition for tabs widget.
 */
export interface TabDef {
  /** Tab ID */
  id: string;
  /** Tab label */
  label: string;
  /** Tab icon */
  icon?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Badge text */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'primary' | 'danger';
  /** Closable tab */
  closable?: boolean;
}

/**
 * Options for `tabs` widget.
 */
export interface TabsOptions {
  /** Tab definitions */
  tabs?: TabDef[];
  /** Children by tab ID */
  tabChildren?: Record<string, string[]>;
  /** Default active tab */
  defaultActiveTab?: string;
  /** Tab position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Tab style variant */
  variant?: 'line' | 'card' | 'button';
  /** Tab size */
  size?: 'sm' | 'md' | 'lg';
  /** Centered tabs */
  centered?: boolean;
  /** Full width tabs */
  fullWidth?: boolean;
  /** Lazy load tab content */
  lazy?: boolean;
  /** Animated transitions */
  animated?: boolean;
  /** Destroy inactive tabs */
  destroyInactive?: boolean;
  /** Addable tabs */
  addable?: boolean;
}

/**
 * Options for `modal` widget.
 */
export interface ModalOptions {
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Custom width */
  width?: number | string;
  /** Show close button */
  closable?: boolean;
  /** Close on mask click */
  maskClosable?: boolean;
  /** Close on escape key */
  keyboard?: boolean;
  /** Centered vertically */
  centered?: boolean;
  /** Show footer */
  showFooter?: boolean;
  /** OK button text */
  okText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** OK button variant */
  okVariant?: 'primary' | 'danger';
  /** Confirm loading state */
  confirmLoading?: boolean;
  /** Mask visible */
  mask?: boolean;
  /** Z-index */
  zIndex?: number;
  /** Destroy on close */
  destroyOnClose?: boolean;
}
