import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  subtle?: boolean;
};

export function GlassCard({ children, className, subtle = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        subtle ? 'glass-panel-subtle shadow-glass-sm' : 'glass-panel shadow-glass-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

