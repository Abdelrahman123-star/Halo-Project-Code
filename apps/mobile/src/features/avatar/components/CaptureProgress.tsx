/**
 * Three-step progress indicator (Front · Back · Face). Completed steps get a
 * pearl check, the current step a lilac ring. Every step is tappable, so the
 * user can jump around without losing photos.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import type { AvatarCaptureState } from '../avatarCaptureState';
import { CAPTURE_STEPS, type CaptureStepId } from '../avatarSteps';
import { CheckIcon } from './AvatarIcons';

type CaptureProgressProps = {
  photos: AvatarCaptureState['photos'];
  currentStep: CaptureStepId | null;
  onSelectStep: (step: CaptureStepId) => void;
};

export function CaptureProgress({ photos, currentStep, onSelectStep }: CaptureProgressProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {CAPTURE_STEPS.map((step, index) => {
        const isDone = photos[step.id] !== undefined;
        const isCurrent = step.id === currentStep;
        const status = isDone ? 'Completed' : 'Not completed';

        return (
          <View key={step.id} style={styles.segment}>
            {index > 0 ? (
              <View style={[styles.connector, photos[CAPTURE_STEPS[index - 1].id] && styles.connectorDone]} />
            ) : null}
            <Pressable
              onPress={() => onSelectStep(step.id)}
              hitSlop={8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isCurrent }}
              accessibilityLabel={`${step.title}, ${status}`}
              style={styles.stepButton}
            >
              {isDone ? (
                <LinearGradient
                  colors={dashboardTheme.pearlGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.dot, isCurrent && styles.dotCurrent]}
                >
                  <CheckIcon size={14} color={dashboardTheme.plum} />
                </LinearGradient>
              ) : (
                <View style={[styles.dot, styles.dotEmpty, isCurrent && styles.dotCurrent]}>
                  <Text style={[styles.dotNumber, isCurrent && styles.dotNumberCurrent]}>{index + 1}</Text>
                </View>
              )}
              <Text style={[styles.label, isCurrent && styles.labelCurrent]}>{step.shortTitle}</Text>
              <Text style={[styles.status, isDone && styles.statusDone]}>{isDone ? 'Done' : 'To do'}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const DOT = 34;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  segment: { flex: 1, alignItems: 'center' },
  connector: {
    position: 'absolute',
    top: DOT / 2,
    right: '50%',
    width: '100%',
    height: 2,
    marginRight: DOT / 2,
    borderRadius: 1,
    backgroundColor: dashboardTheme.track,
  },
  connectorDone: { backgroundColor: '#C9B6F6' },
  stepButton: { alignItems: 'center', gap: 4 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, alignItems: 'center', justifyContent: 'center' },
  dotEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  dotCurrent: { borderWidth: 2, borderColor: '#A996F2' },
  dotNumber: { fontSize: 13, fontWeight: '700', color: dashboardTheme.muted },
  dotNumberCurrent: { color: dashboardTheme.accent },
  label: { fontSize: 12, fontWeight: '600', color: dashboardTheme.text },
  labelCurrent: { color: dashboardTheme.plum, fontWeight: '700' },
  status: { fontSize: 10, color: dashboardTheme.muted },
  statusDone: { color: dashboardTheme.accent, fontWeight: '600' },
});
