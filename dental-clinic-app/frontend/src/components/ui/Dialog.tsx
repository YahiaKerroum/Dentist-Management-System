import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

interface DialogContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

/**
 * Convenience wrapper: pairs Radix's accessible dialog primitives (focus trap,
 * Escape-to-close, portal) with the animation the app previously had none of.
 */
export const DialogPanel: React.FC<DialogContentProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  footer,
}) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div
              className="fixed inset-0 z-50 bg-surface-950/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content asChild forceMount>
            <motion.div
              className={cn(
                'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[90vh] flex flex-col',
                className
              )}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {title && (
                <div className="flex items-center justify-between gap-4 border-b border-surface-100 px-6 py-4">
                  <div>
                    <DialogPrimitive.Title className="text-lg font-semibold text-surface-900">
                      {title}
                    </DialogPrimitive.Title>
                    {description && (
                      <DialogPrimitive.Description className="mt-0.5 text-sm text-surface-500">
                        {description}
                      </DialogPrimitive.Description>
                    )}
                  </div>
                  <DialogPrimitive.Close className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 focus-visible:outline-none focus-visible:shadow-focus">
                    <X size={18} />
                  </DialogPrimitive.Close>
                </div>
              )}
              <div className="overflow-y-auto px-6 py-5">{children}</div>
              {footer && <div className="border-t border-surface-100 px-6 py-4">{footer}</div>}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  </DialogPrimitive.Root>
);
