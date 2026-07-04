import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-100 text-surface-700 ring-surface-200',
        primary: 'bg-primary-50 text-primary-700 ring-primary-200',
        success: 'bg-success-50 text-success-700 ring-success-100',
        warning: 'bg-warning-50 text-warning-700 ring-warning-100',
        danger: 'bg-danger-50 text-danger-700 ring-danger-100',
        info: 'bg-info-50 text-info-700 ring-info-100',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
