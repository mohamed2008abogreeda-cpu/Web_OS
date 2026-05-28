import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-97 select-none',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:-translate-y-0.5',
        destructive: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/25',
        outline: 'border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]',
        secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700/80',
        ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]',
        link: 'text-indigo-400 underline-offset-4 hover:underline',
        neumorphic: 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] shadow-inner hover:shadow-md hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] hover:-translate-y-0.5',
      },
      size: {
        default: 'h-10 px-4 py-2 sm:h-11 sm:px-5 sm:py-2.5', // Touch target optimized
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 sm:h-11 sm:w-11', // Optimized touch area for icons
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
