/** Cards for the Skin Recommendations page (sample data). */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CardHeader, DashboardCard } from '../dashboard/DashboardCard';
import { dashboardTheme, type Tone } from '../dashboard/dashboardTheme';
import type { ProductPick, RoutineStep } from './beautySampleData';

type RoutineCardProps = {
  title: string;
  icon: ReactNode;
  tone: Tone;
  steps: readonly RoutineStep[];
};

export function RoutineCard({ title, icon, tone, steps }: RoutineCardProps) {
  return (
    <DashboardCard>
      <CardHeader icon={icon} tone={tone} title={title} badge={`${steps.length} steps`} />
      <View>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            {/* Numbered rail, so the routine reads as an order. */}
            <View style={styles.rail}>
              <View style={[styles.stepDot, { backgroundColor: dashboardTheme.toneChip[tone] }]}>
                <Text style={[styles.stepNumber, { color: dashboardTheme.toneInk[tone] }]}>{index + 1}</Text>
              </View>
              {index < steps.length - 1 ? <View style={styles.thread} /> : null}
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepLabel}>{step.step.toUpperCase()}</Text>
              <Text style={styles.product}>{step.product}</Text>
              <Text style={styles.why}>{step.why}</Text>
            </View>
          </View>
        ))}
      </View>
    </DashboardCard>
  );
}

type ProductPicksCardProps = {
  icon: ReactNode;
  picks: readonly ProductPick[];
};

export function ProductPicksCard({ icon, picks }: ProductPicksCardProps) {
  return (
    <DashboardCard>
      <CardHeader icon={icon} tone="lilac" title="Picked for your skin" />
      {picks.map((pick) => (
        <View key={pick.id} style={styles.pick}>
          <View style={[styles.pickAccent, { backgroundColor: dashboardTheme.toneGradient[pick.tone][1] }]} />
          <View style={styles.pickBody}>
            <View style={styles.pickTop}>
              <Text style={styles.pickName}>{pick.name}</Text>
              <View style={[styles.focusChip, { backgroundColor: dashboardTheme.toneChip[pick.tone] }]}>
                <Text style={[styles.focusText, { color: dashboardTheme.toneInk[pick.tone] }]}>{pick.focus}</Text>
              </View>
            </View>
            <Text style={styles.why}>{pick.reason}</Text>
          </View>
        </View>
      ))}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 26 },
  stepDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNumber: { fontSize: 12, fontWeight: '700' },
  thread: { flex: 1, width: 1.5, marginVertical: 3, borderRadius: 1, backgroundColor: dashboardTheme.hairline },
  stepBody: { flex: 1, paddingBottom: 14, gap: 2 },
  stepLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1.2, color: dashboardTheme.muted },
  product: { fontSize: 14, fontWeight: '600', color: dashboardTheme.text },
  why: { fontSize: 12, lineHeight: 17, color: dashboardTheme.muted },
  pick: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  pickAccent: { width: 3, borderRadius: 2 },
  pickBody: { flex: 1, gap: 3, paddingVertical: 2 },
  pickTop: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  pickName: { fontSize: 14, fontWeight: '600', color: dashboardTheme.text },
  focusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  focusText: { fontSize: 10.5, fontWeight: '700' },
});
