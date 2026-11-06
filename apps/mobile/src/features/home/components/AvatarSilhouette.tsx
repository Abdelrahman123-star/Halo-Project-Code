/**
 * Full-body human silhouette standing in front of the HALO house.
 * Uses a soft pearlescent gradient fill, delicate dusty mauve outline,
 * subtle ground contact shadow, and a small '+' floating badge indicating
 * the user can create or customize their 3D avatar.
 */
import { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import { PlusIcon } from './HomeIcons';

// Original viewBox proportions: 100 wide × 240 high.
export const SILHOUETTE_ASPECT_RATIO = 100 / 240;

// Symmetric full-body human silhouette outline (head to toe).
export const HUMAN_SILHOUETTE_PATH = `
M 50 10
C 56.5 10, 61.5 15.5, 61.5 23.5
C 61.5 30.5, 56.5 36.5, 53.5 42
C 53.5 45, 55.5 47.5, 59 49.5
C 66 52.5, 73 56.5, 77 62.5
C 79 65.5, 80.5 71, 80.5 78
L 80.5 116
C 80.5 123, 79.5 129, 77.5 133
C 76 135.5, 73.5 135.5, 72 133
C 70 129, 69 121, 69 114
L 68 88
C 68 83, 66.5 80, 64.5 80
C 64 88, 63 98, 63.5 105
C 64 114, 67 123, 67.5 132
C 68 148, 67 166, 65.5 195
L 63.5 225
C 63 229, 60.5 230.5, 58.5 229.5
C 57 228, 56 222, 56 215
L 54.5 186
C 53.5 171, 52 156, 50.5 144
C 50.2 140, 49.8 140, 49.5 144
C 48 156, 46.5 171, 45.5 186
L 44 215
C 44 222, 43 228, 41.5 229.5
C 39.5 230.5, 37 229, 36.5 225
L 34.5 195
C 33 166, 32 148, 32.5 132
C 33 123, 36 114, 36.5 105
C 37 98, 36 88, 35.5 80
C 33.5 80, 32 83, 32 88
L 31 114
C 31 121, 30 129, 28 133
C 26.5 135.5, 24 135.5, 22.5 133
C 20.5 129, 19.5 123, 19.5 116
L 19.5 78
C 19.5 71, 21 65.5, 23 62.5
C 27 56.5, 34 52.5, 41 49.5
C 44.5 47.5, 46.5 45, 46.5 42
C 43.5 36.5, 38.5 30.5, 38.5 23.5
C 38.5 15.5, 43.5 10, 50 10
Z`.replace(/\s+/g, ' ').trim();

export type AvatarSilhouetteProps = {
  height?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

function springTo(value: Animated.Value, toValue: number) {
  Animated.spring(value, {
    toValue,
    useNativeDriver: true,
    speed: 36,
    bounciness: 5,
  }).start();
}

export function AvatarSilhouette({ height = 150, onPress, style }: AvatarSilhouetteProps) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const width = height * SILHOUETTE_ASPECT_RATIO;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => springTo(pressScale, 0.94)}
      onPressOut={() => springTo(pressScale, 1)}
      accessibilityRole="button"
      accessibilityLabel="Create your avatar"
      accessibilityHint="Opens avatar creator"
      style={[styles.wrapper, style]}
    >
      <Animated.View style={[{ width, height }, { transform: [{ scale: pressScale }] }]}>
        <Svg width={width} height={height} viewBox="0 0 100 240" fill="none">
          <Defs>
            <LinearGradient id="avatarPearlescentFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.78} />
              <Stop offset="45%" stopColor="#EADBFC" stopOpacity={0.68} />
              <Stop offset="100%" stopColor="#D5C0EE" stopOpacity={0.58} />
            </LinearGradient>
          </Defs>

          {/* Soft ground contact shadow underneath feet */}
          <Ellipse cx={50} cy={234} rx={24} ry={4} fill="rgba(110, 85, 145, 0.24)" />

          {/* Full body outline silhouette */}
          <Path
            d={HUMAN_SILHOUETTE_PATH}
            fill="url(#avatarPearlescentFill)"
            stroke="#8E7AA6"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </Svg>

        {/* Small '+' badge near the shoulder to invite avatar creation */}
        <View style={styles.plusBadge} pointerEvents="none">
          <PlusIcon size={12} color="#7A5FA3" />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  plusBadge: {
    position: 'absolute',
    top: 14,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(235, 222, 248, 0.95)',
    shadowColor: '#7A5FA3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
});
