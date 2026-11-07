/**
 * GarmentPreview — Review captured or selected clothing image before AI analysis & wardrobe save.
 * Uses crisp SVG icons (zero emoji icons), frosted glass styling, and tactile buttons.
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
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { FrostedGlassCard } from '@/features/garment/components/FrostedGlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_WIDTH = Math.min(SCREEN_WIDTH - 40, 380);

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
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const isCamera = sourceType === 'camera';
  const retakeLabel = isCamera ? 'Retake Photo' : 'Choose Another Photo';

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.headerBox}>
        <Text style={styles.title}>Review Your Garment</Text>
        <Text style={styles.subtitle}>
          Confirm this photo to run CV analysis and save it to your digital wardrobe.
        </Text>
      </View>

      <FrostedGlassCard variant="panel" style={styles.previewCard}>
        <View style={styles.imageHolder}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel="Selected garment preview"
          />
          <View style={styles.imageBorderOverlay} pointerEvents="none" />
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            {isCamera ? (
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                  stroke="#644498"
                  strokeWidth={2}
                />
                <Circle cx={12} cy={13} r={3.5} stroke="#644498" strokeWidth={2} />
              </Svg>
            ) : (
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={3} width={18} height={18} rx={3} stroke="#4865B8" strokeWidth={2} />
                <Path d="m21 15-5-5L5 21" stroke="#4865B8" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            )}
            <Text style={styles.badgeText}>
              {isCamera ? 'Captured Photo' : 'Gallery Selection'}
            </Text>
          </View>
        </View>
      </FrostedGlassCard>

      <View style={styles.actionsBox}>
        <Pressable
          onPress={onConfirm}
          disabled={isLoading}
          style={({ pressed }) => [styles.continuePressable, pressed && styles.btnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Analyze and save garment to wardrobe"
        >
          <LinearGradient
            colors={['#686EE8', '#9475F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Analyze & Save to Wardrobe</Text>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="#FFFFFF"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={onRetakeOrChooseAnother}
          disabled={isLoading}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
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
  container: { width: '100%', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24 },
  headerBox: { alignItems: 'center', marginBottom: 16, gap: 5 },
  title: { fontSize: 24, fontWeight: '800', color: '#2E2242', letterSpacing: -0.3 },
  subtitle: { fontSize: 13.5, color: '#6D5B85', textAlign: 'center', lineHeight: 19, maxWidth: 310 },
  previewCard: { width: PREVIEW_WIDTH, padding: 14, alignItems: 'center', marginBottom: 20 },
  imageHolder: { width: '100%', height: PREVIEW_WIDTH * 1.05, borderRadius: 18, overflow: 'hidden', backgroundColor: '#FFFFFF', position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageBorderOverlay: { ...StyleSheet.absoluteFill, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(217, 207, 241, 0.5)' },
  badgeRow: { width: '100%', flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  badgePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14, backgroundColor: 'rgba(139, 123, 239, 0.12)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.9)' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#4F3E6A' },
  actionsBox: { width: PREVIEW_WIDTH, gap: 10 },
  continuePressable: { borderRadius: 18, overflow: 'hidden', shadowColor: '#686EE8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 4 },
  continueGradient: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 8 },
  continueText: { fontSize: 15.5, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
  secondaryBtn: { minHeight: 48, borderRadius: 18, paddingHorizontal: 20, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderWidth: 1.2, borderColor: 'rgba(255, 255, 255, 0.96)', alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: '#5A4A7A' },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
});
