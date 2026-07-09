import { Toaster as SonnerToaster } from 'sonner';

export { toast } from 'sonner';

export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    toastOptions={{
      classNames: {
        toast: 'rounded-lg border border-surface-200 shadow-md font-sans',
        title: 'text-surface-900 font-medium',
        description: 'text-surface-500',
        success: '!border-success-100',
        error: '!border-danger-100',
      },
    }}
  />
);
