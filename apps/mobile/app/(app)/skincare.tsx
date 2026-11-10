/** Skin Recommendations — opened from the bathroom's skincare shelf (UI prototype, sample data). */
import { RoutineCard, ProductPicksCard } from '@/features/home/bathroom/SkincareCards';
import {
  SAMPLE_EVENING_ROUTINE,
  SAMPLE_MORNING_ROUTINE,
  SAMPLE_PRODUCT_PICKS,
} from '@/features/home/bathroom/beautySampleData';
import { CloudSunIcon, SkincareIcon, SparkleIcon } from '@/features/home/dashboard/DashboardIcons';
import { FeaturePageShell } from '@/features/home/dashboard/FeaturePageShell';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';

export default function SkincareScreen() {
  return (
    <FeaturePageShell title="Skin recommendations" subtitle="A routine and picks shaped around your skin today.">
      <RoutineCard
        title="Morning routine"
        icon={<CloudSunIcon color={dashboardTheme.toneInk.champagne} />}
        tone="champagne"
        steps={SAMPLE_MORNING_ROUTINE}
      />
      <RoutineCard
        title="Evening routine"
        icon={<SparkleIcon color={dashboardTheme.toneInk.lilac} />}
        tone="lilac"
        steps={SAMPLE_EVENING_ROUTINE}
      />
      <ProductPicksCard icon={<SkincareIcon />} picks={SAMPLE_PRODUCT_PICKS} />
    </FeaturePageShell>
  );
}
