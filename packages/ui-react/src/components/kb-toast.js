import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cn } from '../lib/utils';
const KBToastProvider = ToastPrimitives.Provider;
const KBToastViewport = React.forwardRef(({ className, ...props }, ref) => (_jsx(ToastPrimitives.Viewport, { ref: ref, className: cn('fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className), ...props })));
KBToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const KBToast = React.forwardRef(({ className, ...props }, ref) => {
    return (_jsx(ToastPrimitives.Root, { ref: ref, className: cn('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-gray-200 bg-white p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full', className), ...props }));
});
KBToast.displayName = ToastPrimitives.Root.displayName;
const KBToastAction = React.forwardRef(({ className, ...props }, ref) => (_jsx(ToastPrimitives.Action, { ref: ref, className: cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-gray-100/40 group-[.destructive]:hover:border-red-500/30 group-[.destructive]:hover:bg-red-500 group-[.destructive]:hover:text-gray-50 group-[.destructive]:focus:ring-red-500', className), ...props })));
KBToastAction.displayName = ToastPrimitives.Action.displayName;
const KBToastClose = React.forwardRef(({ className, ...props }, ref) => (_jsx(ToastPrimitives.Close, { ref: ref, className: cn('absolute right-2 top-2 rounded-md p-1 text-gray-950/50 opacity-0 transition-opacity hover:text-gray-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600', className), "toast-close": "", ...props, children: "\u00D7" })));
KBToastClose.displayName = ToastPrimitives.Close.displayName;
const KBToastTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx(ToastPrimitives.Title, { ref: ref, className: cn('text-sm font-semibold', className), ...props })));
KBToastTitle.displayName = ToastPrimitives.Title.displayName;
const KBToastDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx(ToastPrimitives.Description, { ref: ref, className: cn('text-sm opacity-90', className), ...props })));
KBToastDescription.displayName = ToastPrimitives.Description.displayName;
export { KBToastProvider, KBToastViewport, KBToast, KBToastTitle, KBToastDescription, KBToastClose, KBToastAction, };
//# sourceMappingURL=kb-toast.js.map