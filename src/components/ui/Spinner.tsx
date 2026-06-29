import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
}

export function Spinner({ className, size = 'md', variant = 'primary' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const variantClasses = {
    primary: 'border-primary/20 border-t-primary',
    secondary: 'border-secondary/20 border-t-secondary',
    white: 'border-white/20 border-t-white',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
    />
  );
}
