/**
 * GarmentOptionCard — large interactive frosted-glass selection card.
 * Supports 'camera' (lavender & blush) and 'gallery' (pearl blue & mint) variants
 * with smooth press scale animations, thin-line icons, and subtle ambient glows.
 */
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { luxuryPastel } from '@/shared/theme/tokens';

export interface GarmentOptionCardProps {
  type: 'camera' | 'gallery';
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}

export function GarmentOptionCard({
  type,
  title,
  subtitle,
  onPress,
  disabled = false,
}: GarmentOptionCardProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isCamera = type === 'camera';

  const gradientColors = isCamera
    ? (['rgba(217, 207, 241, 0.45)', 'rgba(241, 217, 229, 0.35)'] as const)
    : (['rgba(212, 233, 236, 0.55)', 'rgba(215, 234, 227, 0.45)'] as const);

  const glowColor = isCamera ? '#D9CFF1' : '#D4E9EC';

  function handlePressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 24,
      bounciness: 4,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.wrapper]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={styles.cardPressable}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Card Content Row */}
          <View style={styles.cardInner}>
            {/* Left: Icon with pearlescent glow background */}
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconGlow,
                  { backgroundColor: glowColor, shadowColor: glowColor },
                ]}
              />
              <View style={styles.iconCircle}>
                {isCamera ? (
                  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                      stroke={luxuryPastel.dustyMauve}
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle
                      cx={12}
                      cy={13}
                      r={4}
                      stroke={luxuryPastel.dustyMauve}
                      strokeWidth={1.75}
                    />
                  </Svg>
                ) : (
                  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                    <Rect
                      x={3}
                      y={3}
                      width={18}
                      height={18}
                      rx={3}
                      stroke={luxuryPastel.dustyMauve}
                      strokeWidth={1.75}
                    />
                    <Circle
                      cx={8.5}
                      cy={8.5}
                      r={1.5}
                      fill={luxuryPastel.dustyMauve}
                    />
                    <Path
                      d="m21 15-5-5L5 21"
                      stroke={luxuryPastel.dustyMauve}
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </View>
            </View>

            {/* Middle: Title & Subtitle */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {/* Right: Thin line forward arrow */}
            <View style={styles.arrowContainer}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 18l6-6-6-6"
                  stroke={luxuryPastel.dustyMauve}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 7,
  },
  cardPressable: {
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    overflow: 'hidden',
    shadowColor: luxuryPastel.shadowMauve,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  cardGradient: {
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  iconContainer: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: luxuryPastel.textMauve,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: luxuryPastel.textSecondary,
    fontWeight: '400',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
