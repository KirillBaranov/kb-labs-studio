import { type ComponentType, type ReactNode } from 'react';
import { useRole } from '../providers/auth-provider';

export type UserRole = 'viewer' | 'operator' | 'admin';

interface WithRoleProps {
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function withRole<P extends object>(Component: ComponentType<P>, allowedRoles: UserRole[]) {
  return function WithRoleComponent(props: P & WithRoleProps) {
    const role = useRole();
    const { allowedRoles: _, fallback, ...restProps } = props;

    if (!allowedRoles.includes(role)) {
      return fallback || null;
    }

    return <Component {...(restProps as P)} />;
  };
}

