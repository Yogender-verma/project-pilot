import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightElement, id, required, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || (label ? `input-${generatedId}` : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wider uppercase flex items-center justify-between"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>{label}</span>
            {required && <span className="text-rose-400 font-bold ml-1 text-xs" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            required={required}
            aria-required={required ? 'true' : undefined}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'w-full text-sm rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
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
          <span
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs text-rose-400 font-medium mt-1 flex items-center gap-1"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
