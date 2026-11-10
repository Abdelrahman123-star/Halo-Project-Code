/** Cards for the Makeup page (sample data). */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CardHeader, DashboardCard } from '../dashboard/DashboardCard';
import { dashboardTheme } from '../dashboard/dashboardTheme';
import type { MakeupLook, ShadeMatch } from './beautySampleData';

export function ShadeMatchCard({ icon, shade }: { icon: ReactNode; shade: ShadeMatch }) {
  return (
    <DashboardCard>
      <CardHeader icon={icon} tone="champagne" title="Your shade match" />
      <View style={styles.shadeRow}>
        <View style={[styles.mainSwatch, { backgroundColor: shade.swatch }]} />
        <View style={styles.shadeText}>
          <Text style={styles.shadeName}>
            {shade.name} · {shade.code}
          </Text>
          <Text style={styles.muted}>{shade.undertone}</Text>
          <View style={styles.neighbours}>
            {shade.neighbours.map((colour) => (
              <View
                key={colour}
                style={[styles.neighbour, { backgroundColor: colour }, colour === shade.swatch && styles.neighbourActive]}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.note}>Sample shade — your personal match will come from skin analysis.</Text>
    </DashboardCard>
  );
}

export function LookCard({ look }: { look: MakeupLook }) {
  return (
    <DashboardCard compact>
      <View style={styles.lookTop}>
        <View style={styles.lookTitle}>
          <Text style={styles.lookName}>{look.name}</Text>
          <Text style={styles.muted}>{look.occasion}</Text>
        </View>
        {/* Overlapping swatches read like a little palette. */}
        <View style={styles.palette}>
          {look.palette.map((colour, index) => (
            <View key={colour} style={[styles.paletteDot, { backgroundColor: colour, marginLeft: index === 0 ? 0 : -8 }]} />
          ))}
        </View>
      </View>
      <View style={styles.steps}>
        {look.steps.map((step) => (
          <View key={step} style={styles.stepChip}>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  shadeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  mainSwatch: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: 'rgba(255, 255, 255, 0.95)' },
  shadeText: { flex: 1, gap: 3 },
  shadeName: { fontSize: 17, fontWeight: '700', color: dashboardTheme.plum },
  muted: { fontSize: 12, color: dashboardTheme.muted },
  neighbours: { flexDirection: 'row', gap: 6, marginTop: 6 },
  neighbour: { width: 22, height: 22, borderRadius: 11, opacity: 0.85 },
  neighbourActive: { opacity: 1, borderWidth: 2, borderColor: '#FFFFFF' },
  note: { fontSize: 11.5, lineHeight: 16, color: dashboardTheme.muted },
  lookTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lookTitle: { flex: 1, gap: 2 },
  lookName: { fontSize: 15, fontWeight: '700', color: dashboardTheme.text },
  palette: { flexDirection: 'row' },
  paletteDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.95)' },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stepChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  stepText: { fontSize: 11.5, fontWeight: '600', color: dashboardTheme.text },
});
