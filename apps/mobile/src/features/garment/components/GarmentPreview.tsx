/**
 * GarmentPreview — review captured or selected clothing image before AI processing.
 * Displays large rounded image preview within a frosted glass frame,
 * "Choose Another" / "Retake" secondary action, and a prominent lavender "Continue" button.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { FrostedGlassCard } from '@/features/garment/components/FrostedGlassCard';
import { luxuryPastel } from '@/shared/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_WIDTH = Math.min(SCREEN_WIDTH - 48, 380);

interface GarmentPreviewProps {
  imageUri: string;
  sourceType: 'camera' | 'gallery' | null;
  onRetakeOrChooseAnother: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function GarmentPreview({
  imageUri,
  sourceType,
  onRetakeOrChooseAnother,
  onConfirm,
  isLoading = false,
}: GarmentPreviewProps): React.JSX.Element {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const retakeLabel = sourceType === 'camera' ? 'Retake Photo' : 'Choose Another';

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Headings */}
      <View style={styles.headerBox}>
        <Text style={styles.title}>Your Garment</Text>
        <Text style={styles.subtitle}>
          Let's prepare this piece for your digital wardrobe.
        </Text>
      </View>

      {/* Large Rounded Image Preview on Frosted Glass Card */}
      <FrostedGlassCard variant="panel" style={styles.previewCard}>
        <View style={styles.imageHolder}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Subtle iridescent border overlay */}
          <View style={styles.imageBorderOverlay} pointerEvents="none" />
        </View>

        {/* Source Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>
              {sourceType === 'camera' ? '📷 Captured' : '🖼️ Gallery Photo'}
            </Text>
          </View>
        </View>
      </FrostedGlassCard>

      {/* Action Buttons */}
      <View style={styles.actionsBox}>
        {/* Prominent Continue Button */}
        <Pressable
          onPress={onConfirm}
          disabled={isLoading}
          style={styles.continuePressable}
          accessibilityRole="button"
          accessibilityLabel="Continue to garment processing"
        >
          <LinearGradient
            colors={['#C4AEE8', '#D9CFF1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12h14M12 5l7 7-7 7"
                stroke={luxuryPastel.textMauve}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </LinearGradient>
        </Pressable>

        {/* Choose Another / Retake Button */}
        <Pressable
          onPress={onRetakeOrChooseAnother}
          disabled={isLoading}
          style={styles.secondaryBtn}
          accessibilityRole="button"
          accessibilityLabel={retakeLabel}
        >
          <Text style={styles.secondaryBtnText}>{retakeLabel}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 18,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: luxuryPastel.textMauve,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 14,
    color: luxuryPastel.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  previewCard: {
    width: PREVIEW_WIDTH,
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  imageHolder: {
    width: '100%',
    height: PREVIEW_WIDTH * 1.15,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F7F3EE',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageBorderOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  badgeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  badgePill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(217, 207, 241, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: luxuryPastel.textMauve,
  },
  actionsBox: {
    width: PREVIEW_WIDTH,
    gap: 12,
  },
  continuePressable: {
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: luxuryPastel.shadowMauve,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  continueText: { fontSize: 16, fontWeight: '700', color: luxuryPastel.textMauve, letterSpacing: 0.5 },
  secondaryBtn: {
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: luxuryPastel.textMauve },
});
