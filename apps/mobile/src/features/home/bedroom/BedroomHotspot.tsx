/**
 * A tappable piece of furniture, almost invisible until needed:
 * - idle: a hairline of light that slowly breathes along its edges,
 * - pressed / hovered: the rim brightens and its label is revealed (via onReveal),
 * - selected: a soft diagonal shimmer sweeps across it like light on glass.
 * The whole object is the touch target.
 */
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Rect } from './bedroomLayout';

type BedroomHotspotProps = {
  rect: Rect;
  radius: number;
  /** Shared 0–1 breathing value, so the room's lights pulse together. */
  pulse: Animated.Value;
  /** 0–1 sweep progress, driven by the room when this object is selected. */
  shimmer: Animated.Value;
  isSelected: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  onReveal: (visible: boolean) => void;
  /** Colour of the faint breathing outline (per room scene). */
  outlineColor?: string;
};

export function BedroomHotspot({
  rect,
  radius,
  pulse,
  shimmer,
  isSelected,
  accessibilityLabel,
  onPress,
  onReveal,
  outlineColor,
}: BedroomHotspotProps) {
  const press = useRef(new Animated.Value(0)).current;

  function setActive(active: boolean) {
    Animated.timing(press, { toValue: active ? 1 : 0, duration: 220, useNativeDriver: true }).start();
    onReveal(active);
  }

  const idleOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.3] });
  const bandWidth = Math.max(rect.width, rect.height) * 0.45;
  const sweepX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-bandWidth * 1.6, rect.width + bandWidth] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setActive(true)}
      onPressOut={() => {
        if (!isSelected) setActive(false);
      }}
      onHoverIn={() => setActive(true)}
      onHoverOut={() => {
        if (!isSelected) setActive(false);
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.hit, { left: rect.x, top: rect.y, width: rect.width, height: rect.height }]}
    >
      <Animated.View pointerEvents="none" style={[styles.rim, styles.idleRim, outlineColor ? { borderColor: outlineColor } : null, { borderRadius: radius, opacity: idleOpacity }]} />
      <Animated.View
        pointerEvents="none"
        style={[styles.rim, styles.activeRim, { borderRadius: radius, opacity: isSelected ? 1 : press }]}
      />

      {/* Reflection-like sweep, clipped to the object's shape. */}
      <View pointerEvents="none" style={[styles.clip, { borderRadius: radius }]}>
        <Animated.View
          style={[
            styles.band,
            { width: bandWidth, height: rect.height * 1.6, opacity: isSelected ? 1 : 0 },
            { transform: [{ translateX: sweepX }, { rotate: '18deg' }] },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,250,255,0.42)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute' },
  rim: { ...StyleSheet.absoluteFill },
  // A hairline of light — no heavy border or shadow.
  idleRim: { borderWidth: 1, borderColor: 'rgba(195, 96, 195, 0.95)' },
  activeRim: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    backgroundColor: 'rgba(226, 212, 252, 0.10)',
    shadowColor: '#E6D9FF',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  clip: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  band: { position: 'absolute', top: '-30%' },
});
