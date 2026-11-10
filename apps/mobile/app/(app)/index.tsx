/**
 * HomeScreen — first screen after login. Same pastel orb background and
 * frosted components as the auth screens; the HALO house is the focal point
 * with the user's avatar standing outside in the foreground.
 */
import { useRef, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BOTTOM_NAV_CLEARANCE } from '@/features/home/components/HomeBottomNav';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { usePreviewAvatar } from '@/features/avatar/hooks/usePreviewAvatar';
import { FadeInView } from '@/features/home/components/FadeInView';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HouseHero } from '@/features/home/components/HouseHero';
import { useDisplayName } from '@/features/profile/hooks/useDisplayName';

const SCREEN_GUTTER = 20;

export default function HomeScreen() {
  const router = useRouter();
  const displayName = useDisplayName();
  const { state: avatarState } = usePreviewAvatar();
  const hasAvatar = avatarState.status === 'ready' ? avatarState.hasAvatar : null;
  const { width } = useWindowDimensions();
  const houseWidth = Math.min(width - SCREEN_GUTTER * 2 - 16, 340);
  // Android blurs only what is inside a BlurTargetView; on iOS this is a plain View.
  const blurTargetRef = useRef<ComponentRef<typeof View>>(null);

  return (
    <View style={styles.root}>
      <BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>
        <PastelBlobBackground animated={false} />

        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <FadeInView fromTranslateY={-6}>
              <HomeHeader displayName={displayName} onProfilePress={() => router.push('/(app)/profile')} />
            </FadeInView>

            <FadeInView delayMs={40} fromTranslateY={0} fromScale={0.98}>
              <HouseHero
                width={houseWidth}
                onPress={() => router.push('/(app)/house-entrance')}
                hasAvatar={hasAvatar}
                // With an avatar, tapping it opens the avatar page; otherwise the "+" starts creation.
                onAvatarPress={() => router.push(hasAvatar ? '/(app)/avatar' : '/(app)/create-avatar')}
              />
            </FadeInView>
          </ScrollView>
        </SafeAreaView>
      </BlurTargetView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  blurTarget: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: 8,
    // The bottom nav sits below this screen (not over it), so only normal breathing room is needed.
    // Room for the floating bottom nav.
    paddingBottom: BOTTOM_NAV_CLEARANCE,
    gap: 24,
  },
});
