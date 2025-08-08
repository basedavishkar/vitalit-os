import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = [
      'btn',
      'focus-ring',
      'animate-scale-in',
      'font-medium',
      'transition-all',
      'duration-200',
      'ease-out',
      'select-none',
      'touch-manipulation'
    ];

    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      outline: [
        'bg-transparent',
        'border',
        'border-current',
        'text-foreground',
        'hover:bg-muted',
        'hover:border-primary'
      ],
      destructive: [
        'bg-red-500',
        'text-white',
        'hover:bg-red-600',
        'focus:ring-red-500'
      ]
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      loading && 'opacity-75 cursor-not-allowed',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="loading-spinner mr-2" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
