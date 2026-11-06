/**
 * Shared layout for the dashboard feature pages (wellness, reminders,
 * weather, calendar): pastel orb background, back button, title, scrollable
 * content, and the "sample data" label required while the data is static.
 */
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { FadeInView } from '@/features/home/components/FadeInView';
import { GlassIconButton } from '@/features/home/components/GlassIconButton';
import { ChevronLeftIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme } from './dashboardTheme';

type FeaturePageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function FeaturePageShell({ title, subtitle, children }: FeaturePageShellProps) {
  const router = useRouter();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(app)');
  }

  return (
    <View style={styles.root}>
      <PastelBlobBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <GlassIconButton onPress={goBack} accessibilityLabel="Back to home">
              <ChevronLeftIcon />
            </GlassIconButton>
          </View>

          <FadeInView fromTranslateY={-8}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </FadeInView>

          <FadeInView delayMs={120} fromTranslateY={20} style={styles.body}>
            {children}
          </FadeInView>

          <Text style={styles.previewNote}>Preview · sample data</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 18 },
  topBar: { flexDirection: 'row' },
  title: { fontSize: 26, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.3 },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 22, color: dashboardTheme.muted },
  body: { gap: 14 },
  previewNote: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: dashboardTheme.muted,
    opacity: 0.8,
  },
});
