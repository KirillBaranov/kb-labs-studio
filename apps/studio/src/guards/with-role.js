import { jsx as _jsx } from "react/jsx-runtime";
import { useRole } from '../providers/auth-provider';
export function withRole(Component, allowedRoles) {
    return function WithRoleComponent(props) {
        const role = useRole();
        const { allowedRoles: _, fallback, ...restProps } = props;
        if (!allowedRoles.includes(role)) {
            return fallback || null;
        }
        return _jsx(Component, { ...restProps });
    };
}
//# sourceMappingURL=with-role.js.map