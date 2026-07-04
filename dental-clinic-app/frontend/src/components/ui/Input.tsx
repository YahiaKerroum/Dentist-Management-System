import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leadingIcon, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-surface-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-400">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-10 w-full rounded-md border border-surface-300 bg-white px-3 text-sm text-surface-900 placeholder:text-surface-400 transition-shadow duration-150 focus:outline-none focus:border-primary-500 focus:shadow-focus',
              leadingIcon && 'pl-10',
              error && 'border-danger-500 focus:border-danger-500 focus:shadow-none focus:ring-2 focus:ring-danger-500/25',
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-danger-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-surface-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
