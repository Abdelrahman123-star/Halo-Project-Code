import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { HaloLogo } from '@/shared/ui/HaloLogo';
import { Screen } from '@/shared/ui/Screen';

export default function CreateAvatarScreen() {
  const router = useRouter();
  const [pipelineNotice, setPipelineNotice] = useState<string | null>(null);

  function handleStartScan() {
    setPipelineNotice(
      'Camera scan pipeline: Camera capture & AI body parameter estimation will be linked in Phase 2.',
    );
  }

  function handleUploadPhotos() {
    setPipelineNotice(
      'Photo upload pipeline: 3-photo upload (front, back, face) will be linked in Phase 2.',
    );
  }

  return (
    <Screen variant="midnight">
      <View style={styles.container}>
        {/* Navigation & Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back to apartment entrance"
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <HaloLogo size="small" />
          <View style={styles.headerSpacer} />
        </View>

        {/* Title & Introduction */}
        <View style={styles.headingGroup}>
          <Text style={styles.title}>Let's create you.</Text>
          <Text style={styles.subtitle}>
            We'll use a few photos to build your personalized 3D avatar.
          </Text>
        </View>

        {pipelineNotice ? (
          <Banner tone="success" message={pipelineNotice} />
        ) : null}

        {/* 3 Step Visual Requirements Guide */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepCard}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Full-body front view</Text>
              <Text style={styles.stepDesc}>
                Stand upright in a neutral pose with clear, even lighting.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Full-body back view</Text>
              <Text style={styles.stepDesc}>
                Turn around keeping posture and distance consistent.
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Face close-up</Text>
              <Text style={styles.stepDesc}>
                Direct frontal photo with neutral facial expression.
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy & Honesty Note */}
        <View style={styles.privacyNote}>
          <View style={styles.privacyHaloDot} />
          <Text style={styles.privacyText}>
            Your scan photos remain encrypted and private to you under Row Level
            Security. They are never shared publicly.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionGroup}>
          <Button
            label="Start scanning"
            variant="luminous"
            onPress={handleStartScan}
          />
          <Button
            label="Upload photos instead"
            variant="ghost"
            onPress={handleUploadPhotos}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    width: '100%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  backText: {
    color: colors.lavender,
    fontSize: fontSize.body,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 48,
  },
  headingGroup: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: '300',
    color: colors.luminousWhite,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.silver,
    lineHeight: 22,
  },
  stepsContainer: {
    gap: spacing.md,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(184, 174, 216, 0.2)',
    borderWidth: 1,
    borderColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: colors.luminousWhite,
    fontSize: fontSize.small,
    fontWeight: '700',
  },
  stepInfo: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    color: colors.luminousWhite,
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  stepDesc: {
    color: colors.textMuted,
    fontSize: fontSize.small,
    lineHeight: 18,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(23, 27, 39, 0.6)',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(201, 205, 212, 0.1)',
  },
  privacyHaloDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lavender,
    marginTop: 6,
  },
  privacyText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: fontSize.small - 1,
    lineHeight: 18,
  },
  actionGroup: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
