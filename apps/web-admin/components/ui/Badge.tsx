import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = {
  children: ReactNode;
  variant?: 'admin' | 'user' | 'success' | 'warning' | 'info' | 'neutral';
  className?: string;
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border',
        variant === 'admin' &&
          'bg-pearl-gradient text-halo-plum border-halo-periwinkle/30 shadow-sm',
        variant === 'user' &&
          'bg-white/60 text-halo-plumMuted border-white/80',
        variant === 'success' &&
          'bg-emerald-50 text-emerald-700 border-emerald-200',
        variant === 'warning' &&
          'bg-amber-50 text-amber-700 border-amber-200',
        variant === 'info' &&
          'bg-sky-50 text-sky-700 border-sky-200',
        variant === 'neutral' &&
          'bg-slate-100/70 text-slate-700 border-slate-200',
        className,
      )}
    >
      {children}
    </span>
  );
}

