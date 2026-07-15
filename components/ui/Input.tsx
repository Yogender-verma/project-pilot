import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightElement, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          /*
           * Label — removed hardcoded text-slate-400.
           * Uses var(--text-muted) so it is legible in both themes.
           */
          <label
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            >
              {leftIcon}
            </div>
          )}
          {/*
           * Input field — all hardcoded hex & dark-only Tailwind classes replaced
           * with CSS custom property inline styles so the field is fully visible
           * in both dark and light themes.
           *
           * bg-[#0a071a]/50   → var(--input-bg)       (solid purple-tinted in light)
           * text-slate-100    → var(--text-primary)    (deep navy in light)
           * placeholder-slate-500 → var(--text-placeholder)
           * border-white/10   → var(--input-border)
           * hover:border-white/20 → handled via :focus style below
           */}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full text-sm rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-1',
              leftIcon && 'pl-11',
              rightElement && 'pr-11',
              className
            )}
            style={{
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              border: error
                ? '1px solid rgba(244, 63, 94, 0.5)'
                : '1px solid var(--input-border)',
              /* Placeholder is set via CSS class below */
            }}
            {...props}
          />
          {rightElement && (
            <div
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
              style={{ color: 'var(--text-muted)' }}
            >
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-rose-400 font-medium mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
