/**
 * The tappable HALO house — the home page's focal point. The image keeps its
 * original proportions; a soft lilac glow underneath grounds it on the pastel
 * background. A full-body avatar silhouette stands in front on the pathway.
 */
import { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { authTheme } from '@/features/auth/components/AuthComponents';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { PreviewAvatarFigure } from '@/features/avatar/components/PreviewAvatarFigure';
import { PREVIEW_AVATAR_ASPECT_RATIO } from '@/features/avatar/previewAvatar';
import { AvatarSilhouette, SILHOUETTE_ASPECT_RATIO } from './AvatarSilhouette';

// Source asset is 477 × 523 px.
const HOUSE_ASPECT_RATIO = 523 / 477;

const GROUND_GLOW_STOPS: readonly GlowStop[] = [
  { offset: 0, color: '#C9B6F6', opacity: 0.6 },
  { offset: 0.55, color: '#E3C8EE', opacity: 0.28 },
  { offset: 1, color: '#EEF0FA', opacity: 0 },
];

type HouseHeroProps = {
  width: number;
  onPress: () => void;
  onAvatarPress?: () => void;
  /** true: show the user's avatar; false: the "+" silhouette; null: still loading (show nothing). */
  hasAvatar?: boolean | null;
};

function springTo(value: Animated.Value, toValue: number) {
  Animated.spring(value, { toValue, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
}

export function HouseHero({ width, onPress, onAvatarPress, hasAvatar = false }: HouseHeroProps) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const height = width * HOUSE_ASPECT_RATIO;
  const glowSize = width * 1.15;
  // Scaled avatar height (~52% of house height for a prominent, full-body presence)
  const avatarHeight = height * 0.52;
  const avatarLeft = width * 0.14;
  const avatarBottom = height * 0.03;
  // The avatar image is cropped tightly, so it is a bit shorter than the
  // silhouette's box and centred on the same spot.
  const figureHeight = avatarHeight * 0.94;
  const figureLeft =
    avatarLeft + (avatarHeight * SILHOUETTE_ASPECT_RATIO - figureHeight * PREVIEW_AVATAR_ASPECT_RATIO) / 2;

  return (
    <View style={styles.container}>
      <View style={{ width, height }}>
        <View
          pointerEvents="none"
          style={[
            styles.groundGlow,
            { left: (width - glowSize) / 2, top: height * 0.94 - glowSize / 2 },
          ]}
        >
          <SoftGlow id="house-ground-glow" size={glowSize} stops={GROUND_GLOW_STOPS} />
        </View>

        <Pressable
          onPress={onPress}
          onPressIn={() => springTo(pressScale, 0.98)}
          onPressOut={() => springTo(pressScale, 1)}
          accessibilityRole="button"
          accessibilityLabel="Enter your HALO house"
        >
          <Animated.View style={{ width, height, transform: [{ scale: pressScale }] }}>
            <Image
              source={require('../../../../assets/halo-house.png')}
              style={{ width, height }}
              resizeMode="contain"
              accessible={false}
            />
          </Animated.View>
        </Pressable>

        {onAvatarPress != null && hasAvatar === true ? (
          <PreviewAvatarFigure
            height={figureHeight}
            style={[styles.avatarSlot, { left: figureLeft, bottom: avatarBottom }]}
            onPress={onAvatarPress}
          />
        ) : null}
        {onAvatarPress != null && hasAvatar === false ? (
          <AvatarSilhouette
            height={avatarHeight}
            style={{ left: avatarLeft, bottom: avatarBottom }}
            onPress={onAvatarPress}
          />
        ) : null}
      </View>

      <View style={styles.hintPill} pointerEvents="none">
        <Text style={styles.hintText}>Tap the house to step inside</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  // Squashed vertically so the circular glow reads as a floor reflection.
  groundGlow: { position: 'absolute', transform: [{ scaleY: 0.22 }] },
  avatarSlot: { position: 'absolute', zIndex: 10 },
  hintPill: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: authTheme.socialBtnBg,
    borderWidth: 1,
    borderColor: authTheme.socialBtnBorder,
  },
  hintText: { fontSize: 12, fontWeight: '600', color: authTheme.textMuted, letterSpacing: 0.2 },
});
