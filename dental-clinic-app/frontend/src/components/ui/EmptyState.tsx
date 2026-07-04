import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-400">
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm font-medium text-surface-800">{title}</p>
      {description && <p className="mt-1 text-sm text-surface-500">{description}</p>}
    </div>
    {action}
  </div>
);
