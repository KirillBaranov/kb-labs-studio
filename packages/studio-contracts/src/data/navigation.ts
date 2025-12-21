/**
 * @module @kb-labs/studio-contracts/data/navigation
 * Data contracts for navigation widgets (3 widgets).
 */

import type { BreadcrumbItemDef, StepDef, MenuItemDef } from '../options/navigation.js';

/**
 * Data for `breadcrumb` widget.
 */
export interface BreadcrumbData {
  /** Breadcrumb items */
  items: BreadcrumbItemDef[];
}

/**
 * Data for `stepper` widget.
 */
export interface StepperData {
  /** Step definitions */
  steps: StepDef[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Completed step indices */
  completedSteps?: number[];
  /** Error step indices */
  errorSteps?: number[];
}

/**
 * Data for `menu` widget.
 */
export interface MenuData {
  /** Menu items */
  items: MenuItemDef[];
  /** Selected item ID */
  selectedId?: string;
  /** Open submenu IDs */
  openIds?: string[];
}
