import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl hover:-translate-y-1',
        secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md',
        emergency: 'bg-emergency-500 text-white hover:bg-emergency-600 shadow-lg animate-pulse font-black',
        electrical: 'bg-electrical-500 text-white hover:bg-electrical-600 shadow-lg hover:shadow-xl hover:-translate-y-1',
        plumbing: 'bg-plumbing-500 text-white hover:bg-plumbing-600 shadow-lg hover:shadow-xl hover:-translate-y-1',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        link: 'text-primary-500 underline-offset-4 hover:underline',
        outline: 'border border-gray-300 text-gray-900 bg-transparent hover:bg-gray-100 hover:text-black'
      },
      size: {
        sm: 'h-12 px-4 text-sm',
        default: 'h-14 px-6 text-lg',
        lg: 'h-16 px-8 text-xl',
        xl: 'h-20 px-10 text-2xl font-bold',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
