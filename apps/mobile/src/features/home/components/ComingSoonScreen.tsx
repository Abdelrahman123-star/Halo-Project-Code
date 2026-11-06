/**
 * Placeholder screen for home destinations that are not built yet (house
 * entrance, avatar creation). It states plainly that the feature is coming,
 * so nothing pretends to work.
 */
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthButton, AuthCard, authTheme } from '@/features/auth/components/AuthComponents';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { FadeInView } from './FadeInView';
import { GlassIconButton } from './GlassIconButton';
import { ChevronLeftIcon } from './HomeIcons';

type ComingSoonScreenProps = {
  title: string;
  message: string;
};

export function ComingSoonScreen({ title, message }: ComingSoonScreenProps) {
  const router = useRouter();

  function goHome() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(app)');
  }

  return (
    <View style={styles.root}>
      <PastelBlobBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <GlassIconButton onPress={goHome} accessibilityLabel="Back to home">
            <ChevronLeftIcon />
          </GlassIconButton>
        </View>

        <View style={styles.content}>
          <FadeInView fromScale={0.96}>
            <Image
              source={require('../../../../assets/halo-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="HALO Logo"
            />
          </FadeInView>

          <FadeInView delayMs={120} fromTranslateY={24} style={styles.cardWrap}>
            <AuthCard style={styles.card}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Coming soon</Text>
              </View>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              <Text style={styles.message}>{message}</Text>
              <AuthButton label="Back to home" onPress={goHome} />
            </AuthCard>
          </FadeInView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  safeArea: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingTop: 8 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 48 },
  logo: { width: 175, height: 95, marginBottom: 20 },
  cardWrap: { width: '100%' },
  card: { alignItems: 'stretch' },
  pill: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: authTheme.tabActiveBg,
  },
  pillText: { fontSize: 12, fontWeight: '700', color: authTheme.inputFocusBorder, letterSpacing: 0.4 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: authTheme.textMain,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  message: { fontSize: 15, lineHeight: 22, color: authTheme.textMuted, textAlign: 'center' },
});
