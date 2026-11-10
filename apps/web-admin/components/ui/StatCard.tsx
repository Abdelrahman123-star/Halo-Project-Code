import { type ReactNode } from 'react';
import { GlassCard } from './GlassCard';

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
};

export function StatCard({ title, value, subtitle, icon, trend, trendUp }: StatCardProps) {
  return (
    <GlassCard className="p-5 flex flex-col justify-between hover:shadow-glass-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-halo-plumMuted uppercase">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-halo-plum mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/70 border border-white flex items-center justify-center text-halo-periwinkle shadow-glass-sm">
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between text-xs">
          {subtitle && <span className="text-halo-plumMuted">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                trendUp ? 'bg-halo-mint text-emerald-800' : 'bg-halo-rose text-rose-800'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}

