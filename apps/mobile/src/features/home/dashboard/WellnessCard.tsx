/** Main dashboard card: wellness score ring, skin-progress trend, metric bars. */
import { StyleSheet, Text, View } from 'react-native';
import { CardHeader, DashboardCard } from './DashboardCard';
import { SparkleIcon } from './DashboardIcons';
import { dashboardTheme } from './dashboardTheme';
import { ProgressRing, Sparkline, ThinBar } from './MiniCharts';
import type { WellnessSummary } from './sampleData';

export function WellnessCard({ summary }: { summary: WellnessSummary }) {
  return (
    <DashboardCard>
      <CardHeader icon={<SparkleIcon />} tone="lilac" title="Wellness & skin" actionLabel="View details" />

      <View style={styles.hero}>
        <ProgressRing size={96} strokeWidth={8} progress={summary.score / 100} gradientId="wellness-ring">
          <Text style={styles.score}>{summary.score}</Text>
          <Text style={styles.scoreLabel}>{summary.scoreLabel}</Text>
        </ProgressRing>

        <View style={styles.trend}>
          <Text style={styles.eyebrow}>Skin progress</Text>
          <View style={styles.deltaRow}>
            <Text style={styles.delta}>{summary.trendDelta}</Text>
            <Text style={styles.deltaPeriod}>{summary.trendPeriod}</Text>
          </View>
          <Sparkline values={summary.skinTrend} height={46} gradientId="skin-trend" />
        </View>
      </View>

      <View style={styles.metrics}>
        {summary.metrics.map((metric) => (
          <View key={metric.id} style={styles.metric}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricNote}>{metric.note}</Text>
              <Text style={styles.metricValue}>{Math.round(metric.value * 100)}%</Text>
            </View>
            <ThinBar value={metric.value} colors={dashboardTheme.toneGradient[metric.tone]} />
          </View>
        ))}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  score: { fontSize: 28, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.5 },
  scoreLabel: { marginTop: -2, fontSize: 11, fontWeight: '600', color: dashboardTheme.muted },
  trend: { flex: 1, gap: 2 },
  eyebrow: { fontSize: 11, fontWeight: '600', color: dashboardTheme.muted, letterSpacing: 0.4, textTransform: 'uppercase' },
  deltaRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  delta: { fontSize: 20, fontWeight: '700', color: dashboardTheme.plum },
  deltaPeriod: { fontSize: 12, color: dashboardTheme.muted },
  metrics: { gap: 12 },
  metric: { gap: 6 },
  metricRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  metricLabel: { fontSize: 13, fontWeight: '600', color: dashboardTheme.text },
  metricNote: { flex: 1, fontSize: 11, color: dashboardTheme.muted },
  metricValue: { fontSize: 13, fontWeight: '700', color: dashboardTheme.plum },
});
