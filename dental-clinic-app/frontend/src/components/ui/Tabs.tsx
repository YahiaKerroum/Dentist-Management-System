import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../utils/cn';

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('inline-flex items-center gap-1 rounded-md bg-surface-100 p-1', className)}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'rounded-sm px-3.5 py-1.5 text-sm font-medium text-surface-500 transition-colors',
      'data-[state=active]:bg-white data-[state=active]:text-surface-900 data-[state=active]:shadow-sm',
      'hover:text-surface-800 focus-visible:outline-none focus-visible:shadow-focus',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 animate-fade-in-up focus-visible:outline-none', className)}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';
