import { cn } from '@/lib/utils';
import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'glow' | 'outline';
}

/*
 * Badge — all variants previously used dark-only colours (bg-white/5, text-slate-300, etc.).
 * Replaced with theme-adaptive inline styles using CSS custom properties where needed,
 * and semi-opaque accent colours that remain visible on both dark and light backgrounds.
 */
export const Badge: React.FC<BadgeProps> = ({ className, children, variant = 'default', style: externalStyle, ...props }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border tracking-wide transition-all';

  /*
   * Each variant gets a separate style object so colours are set via inline styles
   * rather than Tailwind utilities — this makes them override-friendly and theme-aware.
   */
  const variantStyles: Record<NonNullable<BadgeProps['variant']>, React.CSSProperties> = {
    // Default: neutral — uses text-muted so it reads on both themes
    default: {
      backgroundColor: 'var(--hover-bg-strong)',
      borderColor: 'var(--border-medium)',
      color: 'var(--text-secondary)',
    },
    // Primary: indigo-tinted — sufficient contrast on both backgrounds
    primary: {
      backgroundColor: 'rgba(99, 102, 241, 0.12)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      color: '#6366f1',
    },
    // Success: emerald
    success: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      color: '#10b981',
    },
    // Warning: amber
    warning: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      color: '#f59e0b',
    },
    // Danger: rose
    danger: {
      backgroundColor: 'rgba(244, 63, 94, 0.12)',
      borderColor: 'rgba(244, 63, 94, 0.3)',
      color: '#f43f5e',
    },
    // Glow: indigo with shadow
    glow: {
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: 'rgba(99, 102, 241, 0.4)',
      color: '#6366f1',
      boxShadow: '0 0 8px rgba(99, 102, 241, 0.25)',
    },
    // Outline: ghost-style
    outline: {
      backgroundColor: 'transparent',
      borderColor: 'var(--border-medium)',
      color: 'var(--text-secondary)',
    },
  };

  return (
    <span
      className={cn(baseStyles, className)}
      style={{ ...variantStyles[variant ?? 'default'], ...externalStyle }}
      {...props}
    >
      {children}
    </span>
  );
};
