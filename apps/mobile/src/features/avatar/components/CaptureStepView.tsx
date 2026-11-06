/**
 * One capture step: title, instructions, tips, then either the live camera
 * or — once taken — the captured photo with Retake / Use photo.
 */
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthButton } from '@/features/auth/components/AuthComponents';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import type { CapturedPhoto } from '../avatarCaptureState';
import { CAPTURE_STEP_ORDER, type CaptureStepConfig } from '../avatarSteps';
import { CheckIcon } from './AvatarIcons';
import { CameraCapture } from './CameraCapture';
import { CaptureFrame } from './CaptureFrame';
import { SoftButton } from './SoftButton';

type CaptureStepViewProps = {
  step: CaptureStepConfig;
  photo: CapturedPhoto | undefined;
  frameHeight: number;
  cameraActive: boolean;
  isLastMissing: boolean;
  onCaptured: (photo: CapturedPhoto) => void;
  onRetake: () => void;
  onConfirm: () => void;
};

export function CaptureStepView({
  step,
  photo,
  frameHeight,
  cameraActive,
  isLastMissing,
  onCaptured,
  onRetake,
  onConfirm,
}: CaptureStepViewProps) {
  const stepNumber = CAPTURE_STEP_ORDER.indexOf(step.id) + 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          Step {stepNumber} of {CAPTURE_STEP_ORDER.length}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {step.title}
        </Text>
        <Text style={styles.instructions}>{step.instructions}</Text>
        <View style={styles.tips}>
          {step.tips.map((tip) => (
            <View key={tip} style={styles.tip}>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>

      {photo ? (
        <View style={styles.previewBlock}>
          <CaptureFrame height={frameHeight}>
            <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" accessibilityLabel={`${step.title} photo`} />
            <View style={styles.capturedBadge}>
              <LinearGradient colors={dashboardTheme.pearlGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badgeDot}>
                <CheckIcon size={12} color={dashboardTheme.plum} />
              </LinearGradient>
              <Text style={styles.badgeText}>Photo captured</Text>
            </View>
          </CaptureFrame>
          <View style={styles.actions}>
            <View style={styles.actionHalf}>
              <SoftButton label="Retake" onPress={onRetake} />
            </View>
            <View style={styles.actionHalf}>
              <AuthButton label={isLastMissing ? 'Review photos' : 'Use photo'} onPress={onConfirm} />
            </View>
          </View>
        </View>
      ) : (
        <CameraCapture key={step.id} step={step} height={frameHeight} isActive={cameraActive} onCaptured={onCaptured} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18 },
  header: { gap: 6 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: dashboardTheme.accent, letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.3 },
  instructions: { fontSize: 15, lineHeight: 22, color: dashboardTheme.muted },
  tips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  tipText: { fontSize: 11, fontWeight: '600', color: dashboardTheme.text },
  previewBlock: { gap: 16 },
  photo: { width: '100%', height: '100%' },
  capturedBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  badgeDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 12, fontWeight: '700', color: dashboardTheme.plum },
  actions: { flexDirection: 'row', gap: 12 },
  actionHalf: { flex: 1 },
});
