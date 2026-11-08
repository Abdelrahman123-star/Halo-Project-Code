/** Intro: what the user is creating and the three photos it takes. */
import { StyleSheet, Text, View } from 'react-native';
import { AuthButton } from '@/features/auth/components/AuthComponents';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { DashboardCard } from '@/features/home/dashboard/DashboardCard';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { CAPTURE_STEPS } from '../avatarSteps';
import { CaptureGuide } from './CaptureGuides';

const HALO_STOPS: readonly GlowStop[] = [
  { offset: 0, color: '#E4D6FA', opacity: 0.85 },
  { offset: 0.6, color: '#F3D3E8', opacity: 0.35 },
  { offset: 1, color: '#EEF0FA', opacity: 0 },
];

type AvatarIntroViewProps = {
  hasPhotos: boolean;
  onStart: () => void;
};

export function AvatarIntroView({ hasPhotos, onStart }: AvatarIntroViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.glow} pointerEvents="none">
          <SoftGlow id="avatar-intro-glow" size={240} stops={HALO_STOPS} />
        </View>
        <CaptureGuide kind="front" height={200} variant="illustration" idSuffix="intro" />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title} accessibilityRole="header">
          Create Your Avatar
        </Text>
        <Text style={styles.description}>Let&apos;s capture a few photos to create your personalized HALO avatar.</Text>
      </View>

      <DashboardCard>
        <Text style={styles.cardIntro}>
          Three angles help HALO shape an avatar that truly looks like you:
        </Text>
        {CAPTURE_STEPS.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.stepThumb}>
              <CaptureGuide kind={step.id} height={step.id === 'face' ? 30 : 38} variant="illustration" idSuffix={`row-${step.id}`} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>
                {index + 1}. {step.title}
              </Text>
              <Text style={styles.stepTip}>{step.tips[0]}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.note}>Takes about two minutes · Photos are analysed, never stored</Text>
      </DashboardCard>

      <AuthButton label={hasPhotos ? 'Continue' : "Let's begin"} onPress={onStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  hero: { height: 220, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
  copy: { alignItems: 'center', gap: 8 },
  title: { fontSize: 28, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.4, textAlign: 'center' },
  description: { fontSize: 15, lineHeight: 22, color: dashboardTheme.muted, textAlign: 'center', maxWidth: 300 },
  cardIntro: { fontSize: 14, lineHeight: 20, color: dashboardTheme.text },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepThumb: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dashboardTheme.toneChip.lilac,
  },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: dashboardTheme.text },
  stepTip: { fontSize: 12, color: dashboardTheme.muted, marginTop: 2 },
  note: { fontSize: 12, color: dashboardTheme.muted, textAlign: 'center' },
});
