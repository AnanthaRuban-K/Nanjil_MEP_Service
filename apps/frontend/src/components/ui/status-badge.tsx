import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const statusBadgeVariants = cva(
  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
  {
    variants: {
      variant: {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
        'in-progress': 'bg-purple-100 text-purple-800 border-purple-300',
        completed: 'bg-green-100 text-green-800 border-green-300',
        cancelled: 'bg-red-100 text-red-800 border-red-300',
        emergency: 'bg-red-200 text-red-900 border-red-400 animate-pulse font-bold',
        available: 'bg-green-100 text-green-800 border-green-300',
        busy: 'bg-orange-100 text-orange-800 border-orange-300',
        'off-duty': 'bg-gray-100 text-gray-800 border-gray-300',
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <span
        className={cn(statusBadgeVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };
