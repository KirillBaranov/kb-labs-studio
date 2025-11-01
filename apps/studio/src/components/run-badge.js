import { jsx as _jsx } from "react/jsx-runtime";
import { KBBadge } from '@kb-labs/ui-react';
export function RunBadge({ status }) {
    const variantMap = {
        ok: 'success',
        warn: 'warning',
        fail: 'error',
        pending: 'info',
    };
    return _jsx(KBBadge, { variant: variantMap[status], children: status.toUpperCase() });
}
//# sourceMappingURL=run-badge.js.map