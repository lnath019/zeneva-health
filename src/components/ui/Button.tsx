import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';
import { useRoleAccent } from '@/hooks/useRoleAccent';  

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  className,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
 const accent = useRoleAccent();

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: cn(accent.bg, 'text-white', accent.bgHover, accent.ring, 'focus:ring-opacity-50'),
    secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary/50',
    tertiary: 'bg-tertiary text-neutralBrand hover:bg-tertiary-hover focus:ring-tertiary/50',
    outline: cn('border-2 bg-transparent hover:bg-tertiary', accent.border, accent.text, accent.ring, 'focus:ring-opacity-50'),
    ghost: 'text-neutralBrand bg-transparent hover:bg-tertiary-light focus:ring-neutralBrand/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" variant={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'} className="mr-2" />}
      {children}
    </button>
  );
}
