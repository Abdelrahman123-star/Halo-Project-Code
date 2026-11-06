/** Daily reminders page (UI prototype, sample data — no real notifications). */
import { FeaturePageShell } from '@/features/home/dashboard/FeaturePageShell';
import { RemindersCard } from '@/features/home/dashboard/RemindersCard';
import { SAMPLE_REMINDERS } from '@/features/home/dashboard/sampleData';

export default function RemindersScreen() {
  return (
    <FeaturePageShell title="Today's reminders" subtitle="Little things to keep your day glowing.">
      <RemindersCard reminders={SAMPLE_REMINDERS} />
    </FeaturePageShell>
  );
}
