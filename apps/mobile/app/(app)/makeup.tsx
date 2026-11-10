/** Makeup — opened from the bathroom's makeup shelf (UI prototype, sample data). */
import { StyleSheet, Text } from 'react-native';
import { LookCard, ShadeMatchCard } from '@/features/home/bathroom/MakeupCards';
import { SAMPLE_LOOKS, SAMPLE_SHADE_MATCH } from '@/features/home/bathroom/beautySampleData';
import { SparkleIcon } from '@/features/home/dashboard/DashboardIcons';
import { FeaturePageShell } from '@/features/home/dashboard/FeaturePageShell';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';

export default function MakeupScreen() {
  return (
    <FeaturePageShell title="Makeup" subtitle="Your shade and a few looks for what's ahead.">
      <ShadeMatchCard icon={<SparkleIcon color={dashboardTheme.toneInk.champagne} />} shade={SAMPLE_SHADE_MATCH} />
      <Text style={styles.sectionTitle}>Looks for you</Text>
      {SAMPLE_LOOKS.map((look) => (
        <LookCard key={look.id} look={look} />
      ))}
    </FeaturePageShell>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { marginTop: 4, fontSize: 13, fontWeight: '700', letterSpacing: 1.2, color: dashboardTheme.muted },
});
