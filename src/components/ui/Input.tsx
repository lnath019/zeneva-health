import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useRoleAccent } from '@/hooks/useRoleAccent';
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    const accent = useRoleAccent();
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-neutralBrand">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 bg-white text-neutralBrand transition-all duration-200',
            'placeholder:text-slate-400 focus:outline-none',
            accent.ringFocus,
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/15',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
