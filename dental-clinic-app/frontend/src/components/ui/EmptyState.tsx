import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Empty state with the brand's ECG motif: the pulse line blips once,
 * then goes flat — nothing happening here.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <div className="relative flex w-52 items-center justify-center">
      <svg
        className="absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 text-surface-200"
        viewBox="0 0 208 32"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 16 H44 L52 6 L60 26 L66 16 H76 M132 16 H208"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-400">
        <Icon size={22} />
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-surface-800">{title}</p>
      {description && <p className="mt-1 text-sm text-surface-500">{description}</p>}
    </div>
    {action}
  </div>
);
