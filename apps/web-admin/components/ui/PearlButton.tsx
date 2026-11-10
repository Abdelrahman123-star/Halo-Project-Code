import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type PearlButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'pearl' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
};

export const PearlButton = forwardRef<HTMLButtonElement, PearlButtonProps>(
  ({ className, variant = 'pearl', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none',
          size === 'sm' && 'text-xs px-3 py-1.5 gap-1.5',
          size === 'md' && 'text-sm px-4 py-2 gap-2',
          size === 'lg' && 'text-base px-6 py-2.5 gap-2.5',
          variant === 'pearl' &&
            'bg-pearl-gradient text-halo-plum shadow-glass-sm hover:shadow-glass-md hover:brightness-105 border border-white/80',
          variant === 'secondary' &&
            'glass-panel text-halo-plum hover:bg-white/80 border border-white/90',
          variant === 'danger' &&
            'bg-halo-rose text-red-700 hover:bg-red-200 border border-red-300/80',
          variant === 'ghost' &&
            'text-halo-plumMuted hover:text-halo-plum hover:bg-white/40',
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-halo-plum/30 border-t-halo-plum rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  },
);

PearlButton.displayName = 'PearlButton';

