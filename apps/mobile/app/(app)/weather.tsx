/** Weather page (UI prototype, sample data — no weather API). */
import { FeaturePageShell } from '@/features/home/dashboard/FeaturePageShell';
import { HourlyForecastCard } from '@/features/home/dashboard/HourlyForecastCard';
import { SAMPLE_HOURLY, SAMPLE_WEATHER } from '@/features/home/dashboard/sampleData';
import { WeatherCard } from '@/features/home/dashboard/WeatherCard';

export default function WeatherScreen() {
  return (
    <FeaturePageShell title="Weather" subtitle="Today's forecast and what to wear.">
      <WeatherCard weather={SAMPLE_WEATHER} />
      <HourlyForecastCard hours={SAMPLE_HOURLY} />
    </FeaturePageShell>
  );
}
