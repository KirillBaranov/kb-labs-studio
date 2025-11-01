import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { cn } from '../lib/utils';
const KBBadge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };
    return (_jsx("div", { ref: ref, className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variantClasses[variant], className), ...props }));
});
KBBadge.displayName = 'KBBadge';
export { KBBadge };
//# sourceMappingURL=kb-badge.js.map