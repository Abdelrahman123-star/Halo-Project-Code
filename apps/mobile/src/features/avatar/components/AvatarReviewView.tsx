/** Final review: all three photos, per-photo retake, and Create My Avatar. */
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthButton } from '@/features/auth/components/AuthComponents';
import { DashboardCard } from '@/features/home/dashboard/DashboardCard';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import type { AvatarCaptureState } from '../avatarCaptureState';
import { CAPTURE_STEPS, type CaptureStepId } from '../avatarSteps';
import { CheckIcon } from './AvatarIcons';

type AvatarReviewViewProps = {
  photos: AvatarCaptureState['photos'];
  onRetake: (step: CaptureStepId) => void;
  onCreate: () => void;
  isCreating?: boolean;
};

const GAP = 10;

export function AvatarReviewView({ photos, onRetake, onCreate, isCreating = false }: AvatarReviewViewProps) {
  const { width } = useWindowDimensions();
  const thumbWidth = (width - 40 - GAP * 2) / 3;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title} accessibilityRole="header">
          Review your photos
        </Text>
        <Text style={styles.subtitle}>Make sure each one is clear and well lit. Tap retake to try any angle again.</Text>
      </View>

      <View style={styles.grid}>
        {CAPTURE_STEPS.map((step) => {
          const photo = photos[step.id];
          return (
            <View key={step.id} style={{ width: thumbWidth }}>
              <View style={[styles.thumb, { height: thumbWidth * (4 / 3) }]}>
                {photo ? (
                  <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="cover" accessibilityLabel={`${step.title} photo`} />
                ) : null}
                <LinearGradient colors={dashboardTheme.pearlGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.check}>
                  <CheckIcon size={11} color={dashboardTheme.plum} />
                </LinearGradient>
              </View>
              <Text style={styles.thumbLabel}>{step.shortTitle}</Text>
              <Pressable onPress={() => onRetake(step.id)} accessibilityRole="button" accessibilityLabel={`Retake ${step.title}`} hitSlop={6}>
                <Text style={styles.retake}>Retake</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <DashboardCard style={styles.completeCard}>
        <LinearGradient colors={dashboardTheme.pearlGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.completeIcon}>
          <CheckIcon size={18} color={dashboardTheme.plum} />
        </LinearGradient>
        <View style={styles.completeText}>
          <Text style={styles.completeTitle}>All 3 photos captured</Text>
          <Text style={styles.completeSub}>Front, back and face close-up are ready.</Text>
        </View>
      </DashboardCard>

      <AuthButton label="Create My Avatar" onPress={onCreate} loading={isCreating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18 },
  title: { fontSize: 26, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.3 },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 22, color: dashboardTheme.muted },
  grid: { flexDirection: 'row', gap: GAP },
  thumb: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#2E2540',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  image: { width: '100%', height: '100%' },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLabel: { marginTop: 6, fontSize: 13, fontWeight: '700', color: dashboardTheme.text, textAlign: 'center' },
  retake: { marginTop: 2, fontSize: 12, fontWeight: '600', color: dashboardTheme.accent, textAlign: 'center' },
  completeCard: { flexDirection: 'row', alignItems: 'center' },
  completeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  completeText: { flex: 1 },
  completeTitle: { fontSize: 15, fontWeight: '700', color: dashboardTheme.text },
  completeSub: { marginTop: 2, fontSize: 13, color: dashboardTheme.muted },
});
