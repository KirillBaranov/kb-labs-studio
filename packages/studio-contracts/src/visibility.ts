/**
 * @module @kb-labs/studio-contracts/visibility
 * RBAC visibility rules for widgets.
 */

/**
 * Visibility rule for RBAC filtering.
 * MVP: Simple role-based rules.
 */
export interface VisibilityRule {
  /** Required roles (OR logic) */
  roles?: string[];
  /** Required permissions (OR logic) */
  permissions?: string[];
  /** Tenant restrictions */
  tenants?: string[];
}

/**
 * User context for visibility matching.
 */
export interface UserContext {
  roles: string[];
  permissions: string[];
  tenantId?: string;
}

/**
 * Check if user matches visibility rule.
 */
export function matchesVisibility(rule: VisibilityRule, user: UserContext): boolean {
  // Roles check (OR)
  if (rule.roles?.length) {
    const hasRole = rule.roles.some((r) => user.roles.includes(r));
    if (!hasRole) return false;
  }

  // Permissions check (OR)
  if (rule.permissions?.length) {
    const hasPerm = rule.permissions.some((p) => user.permissions.includes(p));
    if (!hasPerm) return false;
  }

  // Tenant check
  if (rule.tenants?.length && user.tenantId) {
    if (!rule.tenants.includes(user.tenantId)) return false;
  }

  return true;
}
