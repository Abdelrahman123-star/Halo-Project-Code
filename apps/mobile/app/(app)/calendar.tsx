/** Calendar page: real current month, sample events (no calendar integration). */
import { useMemo } from 'react';
import { CalendarCard } from '@/features/home/dashboard/CalendarCard';
import { FeaturePageShell } from '@/features/home/dashboard/FeaturePageShell';
import { SAMPLE_EVENTS } from '@/features/home/dashboard/sampleData';

export default function CalendarScreen() {
  // Captured once per mount so the calendar doesn't shift while open.
  const today = useMemo(() => new Date(), []);

  return (
    <FeaturePageShell title="Calendar" subtitle="Your month and upcoming plans.">
      <CalendarCard today={today} events={SAMPLE_EVENTS} upcomingLimit={SAMPLE_EVENTS.length} />
    </FeaturePageShell>
  );
}
