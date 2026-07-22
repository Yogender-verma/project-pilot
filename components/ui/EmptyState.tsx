'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  onClick?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

/**
 * Reusable guidance panel for screens that do not have data yet.
 *
 * Supply either `illustration` for a fully custom visual or `icon` for the
 * default branded icon treatment. CTAs can navigate with `ctaHref` or execute
 * local recovery logic with `onClick`.
 */
export function EmptyState({
  title,
  description,
  icon,
  illustration,
  ctaLabel,
  ctaHref,
  onClick,
  secondaryLabel,
  secondaryHref,
  className,
}: EmptyStateProps) {
  const primaryButton = ctaLabel ? (
    <Button
      type="button"
      variant="premium"
      onClick={onClick}
      rightIcon={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
      className="w-full justify-center sm:w-auto"
    >
      {ctaLabel}
    </Button>
  ) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'glass-panel relative isolate flex min-h-[360px] w-full overflow-hidden rounded-3xl px-5 py-10 text-center sm:min-h-[420px] sm:px-10 sm:py-14',
        className,
      )}
      aria-labelledby="empty-state-title"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15), transparent 38%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08), transparent 35%)',
        }}
      />

      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center">
        {illustration ? (
          <div className="mb-7" aria-hidden="true">
            {illustration}
          </div>
        ) : icon ? (
          <div
            className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border shadow-[0_0_35px_rgba(99,102,241,0.14)] sm:h-24 sm:w-24"
            style={{
              backgroundColor: 'var(--hover-bg)',
              borderColor: 'var(--border-medium)',
              color: '#818cf8',
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        ) : null}

        <h2
          id="empty-state-title"
          className="text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>

        <p
          className="mt-3 max-w-lg text-sm leading-6 sm:text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          {description}
        </p>

        {(primaryButton || (secondaryLabel && secondaryHref)) && (
          <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            {primaryButton && ctaHref ? (
              <Link href={ctaHref} className="w-full sm:w-auto">
                {primaryButton}
              </Link>
            ) : (
              primaryButton
            )}

            {secondaryLabel && secondaryHref && (
              <Link href={secondaryHref} className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full justify-center sm:w-auto">
                  {secondaryLabel}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
