import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowColor?: string;
  animate?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hoverEffect = true, glowColor, animate = false, ...props }, ref) => {
    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            'glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300',
            hoverEffect && 'glass-panel-hover',
            className
          )}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          {...(props as any)}
        >
          {glowColor && (
            <div
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-[60px] opacity-10 pointer-events-none"
              style={{ backgroundColor: glowColor }}
            />
          )}
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300',
          hoverEffect && 'glass-panel-hover',
          className
        )}
        {...props}
      >
        {glowColor && (
          <div
            className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-[60px] opacity-10 pointer-events-none"
            style={{ backgroundColor: glowColor }}
          />
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
    {children}
  </div>
);

/*
 * CardTitle — removed hardcoded `text-white`.
 * Inherits colour from var(--text-primary) via the body rule so it reads
 * as near-white on dark and deep navy on light.
 */
export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    style={{ color: 'var(--text-primary)' }}
    {...props}
  >
    {children}
  </h3>
);

/*
 * CardDescription — removed hardcoded `text-slate-400`.
 * Uses var(--text-muted) so it is visible in both themes.
 */
export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn('text-sm', className)}
    style={{ color: 'var(--text-muted)' }}
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('pt-0', className)} {...props}>
    {children}
  </div>
);

/*
 * CardFooter — removed hardcoded `border-white/5`.
 * Uses var(--border-subtle) so the divider line shows on both themes.
 */
export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex items-center pt-4 mt-4', className)}
    style={{ borderTop: '1px solid var(--border-subtle)' }}
    {...props}
  >
    {children}
  </div>
);
