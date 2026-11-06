/** Hourly forecast strip for the Weather page (sample data). */
import { StyleSheet, Text, View } from 'react-native';
import { CardHeader, DashboardCard } from './DashboardCard';
import { CloudSunIcon } from './DashboardIcons';
import { dashboardTheme } from './dashboardTheme';
import type { HourlyForecast } from './sampleData';

export function HourlyForecastCard({ hours }: { hours: readonly HourlyForecast[] }) {
  const temperatures = hours.map((hour) => hour.temperatureC);
  const min = Math.min(...temperatures);
  const span = Math.max(...temperatures) - min || 1;

  return (
    <DashboardCard>
      <CardHeader icon={<CloudSunIcon color={dashboardTheme.toneInk.blue} />} tone="blue" title="Later today" />
      <View style={styles.row}>
        {hours.map((hour, index) => {
          // Warmer hours get a taller pill, so the day's shape reads at a glance.
          const fill = 0.35 + 0.65 * ((hour.temperatureC - min) / span);
          return (
            <View key={hour.label} style={styles.column}>
              <Text style={styles.temperature}>{hour.temperatureC}°</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { height: `${Math.round(fill * 100)}%` }, index === 0 && styles.fillNow]} />
              </View>
              <Text style={[styles.label, index === 0 && styles.labelNow]}>{hour.label}</Text>
            </View>
          );
        })}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1, alignItems: 'center', gap: 6 },
  temperature: { fontSize: 14, fontWeight: '700', color: dashboardTheme.plum },
  track: {
    width: 10,
    height: 56,
    borderRadius: 5,
    justifyContent: 'flex-end',
    backgroundColor: dashboardTheme.track,
    overflow: 'hidden',
  },
  fill: { width: '100%', borderRadius: 5, backgroundColor: '#B9D6F6' },
  fillNow: { backgroundColor: '#B9A8F3' },
  label: { fontSize: 11, color: dashboardTheme.muted },
  labelNow: { fontWeight: '700', color: dashboardTheme.accent },
});
