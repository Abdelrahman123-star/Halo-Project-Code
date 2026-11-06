/** Compact weather tile with an outfit suggestion (ties into HALO's styling). */
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { DashboardCard } from './DashboardCard';
import { PartlyCloudyIllustration } from './DashboardIcons';
import { dashboardTheme } from './dashboardTheme';
import type { WeatherSnapshot } from './sampleData';

export function WeatherCard({ weather, style }: { weather: WeatherSnapshot; style?: StyleProp<ViewStyle> }) {
  return (
    <DashboardCard compact style={style}>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>Today</Text>
        <PartlyCloudyIllustration size={44} />
      </View>

      <View>
        <Text style={styles.temperature}>{weather.temperatureC}°</Text>
        <Text style={styles.condition}>{weather.condition}</Text>
        <Text style={styles.range}>
          H {weather.highC}° · L {weather.lowC}°
        </Text>
      </View>

      <View style={styles.tip}>
        <View style={styles.tipHeader}>
          <HangerIcon size={14} color={dashboardTheme.accent} />
          <Text style={styles.tipLabel}>Outfit tip</Text>
        </View>
        <Text style={styles.tipText}>{weather.outfitTip}</Text>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  eyebrow: { fontSize: 11, fontWeight: '600', color: dashboardTheme.muted, letterSpacing: 0.4, textTransform: 'uppercase' },
  temperature: { fontSize: 34, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -1 },
  condition: { marginTop: -2, fontSize: 13, fontWeight: '600', color: dashboardTheme.text },
  range: { marginTop: 2, fontSize: 12, color: dashboardTheme.muted },
  // Pushed to the bottom so the tile height matches the calendar next to it.
  tip: {
    marginTop: 'auto',
    padding: 10,
    gap: 4,
    borderRadius: 14,
    backgroundColor: dashboardTheme.toneChip.lilac,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tipLabel: { fontSize: 11, fontWeight: '700', color: dashboardTheme.accent },
  tipText: { fontSize: 12, lineHeight: 17, color: dashboardTheme.text },
});
