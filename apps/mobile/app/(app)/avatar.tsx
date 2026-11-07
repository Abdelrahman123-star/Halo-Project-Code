/**
 * Your Avatar — opened by tapping the avatar on Home. Shows the (preview)
 * avatar and lets the user delete it; Home then shows the "+" silhouette again.
 */
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthButton } from '@/features/auth/components/AuthComponents';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { CloseIcon } from '@/features/avatar/components/AvatarIcons';
import { PreviewAvatarFigure } from '@/features/avatar/components/PreviewAvatarFigure';
import { SoftButton } from '@/features/avatar/components/SoftButton';
import { usePreviewAvatar } from '@/features/avatar/hooks/usePreviewAvatar';
import { FadeInView } from '@/features/home/components/FadeInView';
import { GlassIconButton } from '@/features/home/components/GlassIconButton';
import { ChevronLeftIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';

const FIGURE_HEIGHT = 380;

const GLOW_STOPS: readonly GlowStop[] = [
  { offset: 0, color: '#E4D6FA', opacity: 0.85 },
  { offset: 0.6, color: '#F3D3E8', opacity: 0.3 },
  { offset: 1, color: '#EEF0FA', opacity: 0 },
];

export default function AvatarScreen() {
  const router = useRouter();
  const { state, remove } = usePreviewAvatar();
  const [isDeleting, setIsDeleting] = useState(false);

  function goHome() {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)');
  }

  function confirmDelete() {
    Alert.alert('Delete your avatar?', 'You can create a new one any time from the + on your home page.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void deleteAvatar() },
    ]);
  }

  async function deleteAvatar() {
    setIsDeleting(true);
    try {
      await remove();
      goHome();
    } catch {
      Alert.alert('Something went wrong', "We couldn't delete your avatar. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  function renderBody() {
    if (state.status === 'loading') return <ActivityIndicator color={dashboardTheme.accent} style={styles.loader} />;

    if (!state.hasAvatar) {
      return (
        <View style={styles.copy}>
          <Text style={styles.title}>No avatar yet</Text>
          <Text style={styles.message}>Take three quick photos and HALO will set up your avatar.</Text>
          <View style={styles.actions}>
            <AuthButton label="Create your avatar" onPress={() => router.replace('/(app)/create-avatar')} />
          </View>
        </View>
      );
    }

    return (
      <>
        <View style={styles.hero}>
          <View style={styles.glow} pointerEvents="none">
            <SoftGlow id="avatar-page-glow" size={FIGURE_HEIGHT} stops={GLOW_STOPS} />
          </View>
          <PreviewAvatarFigure height={FIGURE_HEIGHT - 20} />
        </View>

        <View style={styles.copy}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Preview avatar</Text>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Your avatar
          </Text>
          <Text style={styles.message}>
            This is your preview avatar. Your personalized avatar, built from your photos, is coming soon.
          </Text>
        </View>

        <View style={styles.actions}>
          <AuthButton label="Back to home" onPress={goHome} />
          {isDeleting ? (
            <ActivityIndicator color={dashboardTheme.accent} />
          ) : (
            <SoftButton label="Delete avatar" icon={<CloseIcon size={14} color="#C25A7A" />} onPress={confirmDelete} />
          )}
        </View>
      </>
    );
  }

  return (
    <View style={styles.root}>
      <PastelBlobBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <GlassIconButton onPress={goHome} accessibilityLabel="Back to home">
            <ChevronLeftIcon />
          </GlassIconButton>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <FadeInView fromTranslateY={14}>{renderBody()}</FadeInView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  safeArea: { flex: 1 },
  topBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 8 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 110 },
  loader: { marginTop: 120 },
  hero: { height: FIGURE_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
  copy: { alignItems: 'center', gap: 10, marginTop: 16 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255, 255, 255, 0.75)' },
  pillText: { fontSize: 12, fontWeight: '700', color: dashboardTheme.accent, letterSpacing: 0.3 },
  title: { fontSize: 28, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.4, textAlign: 'center' },
  message: { fontSize: 15, lineHeight: 22, color: dashboardTheme.muted, textAlign: 'center', maxWidth: 320 },
  actions: { alignSelf: 'stretch', gap: 12, marginTop: 24 },
});
