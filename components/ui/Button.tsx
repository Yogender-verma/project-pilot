import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'glass' | 'ghost' | 'glow' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', size = 'md', isLoading, leftIcon, rightIcon, disabled, style: externalStyle, ...props }, ref) => {

    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-98 select-none relative z-10 cursor-pointer';

    /*
     * Hardcoded dark-only Tailwind utilities removed from ghost/glass/glow/outline.
     * These now use CSS custom properties via inline styles (see variantStyles below)
     * so they adapt to both light and dark themes.
     *
     * premium and default use explicit colours (white text on coloured bg) — those
     * are always legible regardless of theme, so they remain as Tailwind classes.
     */
    const variantClassNames: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.5)]',
      premium: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.6)] border-0 hover:brightness-110',
      // The following rely on inline variantStyles for theme-awareness
      outline: 'border',
      glass:   'border backdrop-blur-md',
      ghost:   '',
      glow:    'border shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_20px_rgba(99,102,241,0.35)]',
    };

    /*
     * Inline style objects for variants that need theme-aware colours.
     * These override nothing for 'default' and 'premium' since those use
     * class-based styles with fixed brand colours.
     */
    const variantStyles: Partial<Record<NonNullable<ButtonProps['variant']>, React.CSSProperties>> = {
      outline: {
        borderColor: 'rgba(99, 102, 241, 0.35)',
        color: '#6366f1',
        backgroundColor: 'transparent',
      },
      glass: {
        backgroundColor: 'var(--hover-bg)',
        borderColor: 'var(--border-medium)',
        color: 'var(--text-secondary)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
      },
      glow: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(99, 102, 241, 0.35)',
        color: '#6366f1',
      },
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
      icon: 'h-10 w-10 p-0'
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={{ y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        className={cn(baseStyles, variantClassNames[variant], sizes[size], className)}
        style={{ ...variantStyles[variant], ...externalStyle }}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="mr-2 shrink-0">{leftIcon}</span>}
        <span className="relative z-10 flex items-center">{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
