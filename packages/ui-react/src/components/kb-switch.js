import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '../lib/utils';
const KBSwitch = React.forwardRef(({ className, ...props }, ref) => (_jsx(SwitchPrimitives.Root, { className: cn('peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200', className), ...props, ref: ref, children: _jsx(SwitchPrimitives.Thumb, { className: cn('pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0') }) })));
KBSwitch.displayName = SwitchPrimitives.Root.displayName;
export { KBSwitch };
//# sourceMappingURL=kb-switch.js.map