/** Wellness & skin page (UI prototype, sample data). */
import { FeaturePageShell } from '@/features/home/dashboard/FeaturePageShell';
import { SAMPLE_WELLNESS } from '@/features/home/dashboard/sampleData';
import { WellnessCard } from '@/features/home/dashboard/WellnessCard';

export default function WellnessScreen() {
  return (
    <FeaturePageShell title="Wellness & skin" subtitle="How your skin and wellbeing are trending.">
      <WellnessCard summary={SAMPLE_WELLNESS} />
    </FeaturePageShell>
  );
}
