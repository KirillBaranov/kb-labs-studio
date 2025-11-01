import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../lib/utils';
function KBSkeleton({ className, ...props }) {
    return _jsx("div", { className: cn('animate-pulse rounded-md bg-gray-200', className), ...props });
}
export { KBSkeleton };
//# sourceMappingURL=kb-skeleton.js.map