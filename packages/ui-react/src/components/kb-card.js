import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { cn } from '../lib/utils';
const KBCard = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('rounded-lg border bg-white dark:bg-gray-800 shadow dark:border-gray-700', className), ...props })));
KBCard.displayName = 'KBCard';
const KBCardHeader = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex flex-col space-y-1.5 p-6', className), ...props })));
KBCardHeader.displayName = 'KBCardHeader';
const KBCardTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx("h3", { ref: ref, className: cn('text-2xl font-semibold leading-none tracking-tight', className), ...props })));
KBCardTitle.displayName = 'KBCardTitle';
const KBCardContent = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('p-6 pt-0', className), ...props })));
KBCardContent.displayName = 'KBCardContent';
export { KBCard, KBCardHeader, KBCardTitle, KBCardContent };
//# sourceMappingURL=kb-card.js.map