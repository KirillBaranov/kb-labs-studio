import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../lib/utils';
const KBTabs = TabsPrimitive.Root;
const KBTabsList = React.forwardRef(({ className, ...props }, ref) => (_jsx(TabsPrimitive.List, { ref: ref, className: cn('inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500', className), ...props })));
KBTabsList.displayName = TabsPrimitive.List.displayName;
const KBTabsTrigger = React.forwardRef(({ className, ...props }, ref) => (_jsx(TabsPrimitive.Trigger, { ref: ref, className: cn('inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm', className), ...props })));
KBTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const KBTabsContent = React.forwardRef(({ className, ...props }, ref) => (_jsx(TabsPrimitive.Content, { ref: ref, className: cn('mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2', className), ...props })));
KBTabsContent.displayName = TabsPrimitive.Content.displayName;
export { KBTabs, KBTabsList, KBTabsTrigger, KBTabsContent };
//# sourceMappingURL=kb-tabs.js.map