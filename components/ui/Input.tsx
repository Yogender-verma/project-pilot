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
          <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-[#0a071a]/50 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-white/10 hover:border-white/20 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 focus:outline-none px-4 py-3 transition-all duration-200 glass-panel',
              leftIcon && 'pl-11',
              rightElement && 'pr-11',
              error && 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400">
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
