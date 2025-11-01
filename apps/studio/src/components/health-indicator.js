import { jsx as _jsx } from "react/jsx-runtime";
import { KBBadge } from '@kb-labs/ui-react';
export function HealthIndicator({ status }) {
    const variantMap = {
        ok: 'success',
        degraded: 'warning',
        down: 'error',
    };
    return _jsx(KBBadge, { variant: variantMap[status], children: status.toUpperCase() });
}
//# sourceMappingURL=health-indicator.js.map