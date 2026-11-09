/**
 * Shared motion for the wardrobe atelier: the reduce-motion flag, and the
 * "pearl open" selection effect (soft lilac outline + a light shimmer sweeping
 * across the white photo stage, then the detail sheet opens).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => active && setReduceMotion(enabled));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduceMotion;
}

/** Outline + shimmer values and a trigger that plays them, then runs `onDone`. */
export function usePearlOpen(reduceMotion: boolean) {
  const outline = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const isPlaying = useRef(false);

  function play(onDone: () => void) {
    if (reduceMotion) {
      onDone();
      return;
    }
    if (isPlaying.current) return;
    isPlaying.current = true;
    shimmer.setValue(0);
    Animated.parallel([
      Animated.timing(outline, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      onDone();
      isPlaying.current = false;
      Animated.timing(outline, { toValue: 0, duration: 320, delay: 200, useNativeDriver: true }).start();
      shimmer.setValue(0);
    });
  }

  return { outline, shimmer, play };
}

type PhotoStageProps = {
  height: number;
  shimmer: Animated.Value;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Clean white "photograph" stage for a garment photo (whose own background is
 * white). The shimmer band sweeps across it when the piece is opened.
 */
export function PhotoStage({ height, shimmer, children, style }: PhotoStageProps) {
  const [width, setWidth] = useState(0);
  const band = Math.max(width * 0.45, 40);
  const translateX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-band * 1.4, width + band] });
  const opacity = shimmer.interpolate({ inputRange: [0, 0.05, 0.95, 1], outputRange: [0, 1, 1, 0] });

  return (
    <View style={[styles.stage, { height }, style]} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[styles.band, { width: band, opacity, transform: [{ translateX }, { rotate: '16deg' }] }]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(226, 214, 252, 0.55)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(217, 207, 241, 0.45)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  band: { position: 'absolute', top: '-30%', bottom: '-30%', left: 0 },
});
