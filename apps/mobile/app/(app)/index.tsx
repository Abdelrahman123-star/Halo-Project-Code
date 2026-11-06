/**
 * HomeScreen — first screen after login. Same pastel orb background and
 * frosted components as the auth screens; the HALO house is the focal point
 * with the user's avatar standing outside in the foreground.
 */
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { FadeInView } from '@/features/home/components/FadeInView';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeShortcutsCard } from '@/features/home/components/HomeShortcutsCard';
import { HouseHero } from '@/features/home/components/HouseHero';
import { useDisplayName } from '@/features/profile/hooks/useDisplayName';

const SCREEN_GUTTER = 20;

export default function HomeScreen() {
  const router = useRouter();
  const displayName = useDisplayName();
  const { width } = useWindowDimensions();
  const houseWidth = Math.min(width - SCREEN_GUTTER * 2 - 16, 340);

  return (
    <View style={styles.root}>
      <PastelBlobBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <FadeInView fromTranslateY={-10}>
            <HomeHeader displayName={displayName} onProfilePress={() => router.push('/(app)/profile')} />
          </FadeInView>

          <FadeInView delayMs={150} fromTranslateY={0} fromScale={0.92}>
            <HouseHero
              width={houseWidth}
              onPress={() => router.push('/(app)/house-entrance')}
              onAvatarPress={() => router.push('/(app)/create-avatar')}
            />
          </FadeInView>

          <FadeInView delayMs={300} fromTranslateY={24}>
            <HomeShortcutsCard onOpenWardrobe={() => router.push('/(app)/garment')} />
          </FadeInView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 24,
  },
});
