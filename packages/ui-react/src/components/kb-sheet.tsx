import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../lib/utils';

const KBSheet = DialogPrimitive.Root;
const KBSheetTrigger = DialogPrimitive.Trigger;
const KBSheetClose = DialogPrimitive.Close;

const KBSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
));
KBSheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface KBSheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const KBSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  KBSheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <KBSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 gap-4 bg-white dark:bg-gray-800 p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
        side === 'top' && 'inset-x-0 top-0 border-b border-gray-200 dark:border-gray-700 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        side === 'bottom' &&
          'inset-x-0 bottom-0 border-t border-gray-200 dark:border-gray-700 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        side === 'left' &&
          'inset-y-0 left-0 h-full w-3/4 border-r border-gray-200 dark:border-gray-700 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        side === 'right' &&
          'inset-y-0 right-0 h-full w-3/4 border-l border-gray-200 dark:border-gray-700 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white dark:ring-offset-gray-800 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 dark:focus:ring-gray-300 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-700">
        ×
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
KBSheetContent.displayName = DialogPrimitive.Content.displayName;

const KBSheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
KBSheetHeader.displayName = 'KBSheetHeader';

const KBSheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
KBSheetFooter.displayName = 'KBSheetFooter';

const KBSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold text-gray-950 dark:text-white', className)} {...props} />
));
KBSheetTitle.displayName = DialogPrimitive.Title.displayName;

const KBSheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-gray-500 dark:text-gray-400', className)} {...props} />
));
KBSheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  KBSheet,
  KBSheetOverlay,
  KBSheetTrigger,
  KBSheetClose,
  KBSheetContent,
  KBSheetHeader,
  KBSheetFooter,
  KBSheetTitle,
  KBSheetDescription,
};

