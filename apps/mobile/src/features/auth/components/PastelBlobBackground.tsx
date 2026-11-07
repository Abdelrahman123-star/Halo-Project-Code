/**
 * PastelBlobBackground — full-screen HALO auth background: a pale lilac canvas,
 * soft drifting corner glows, and a floating animated iridescent orb.
 * Animations stop when the OS "reduce motion" setting is on.
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, StyleSheet, View } from 'react-native';
import { IridescentOrb, loopOscillate, SoftGlow, type GlowStop } from './IridescentOrb';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
// The cap keeps the orb sensible on tablets; raise both numbers to grow it.
const ORB_SIZE = Math.min(SCREEN_W * 1.05, 520);
const CORNER_SIZE = Math.max(SCREEN_W, 320) * 0.95;

function cornerStops(color: string, opacity: number): readonly GlowStop[] {
  return [
    { offset: 0, color, opacity },
    { offset: 0.5, color, opacity: opacity * 0.4 },
    { offset: 1, color, opacity: 0 },
  ];
}

function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

type PastelBlobBackgroundProps = {
  animated?: boolean;
  showOrb?: boolean;
};

export function PastelBlobBackground({ animated = true, showOrb = true }: PastelBlobBackgroundProps = {}) {
  const reduceMotion = useReduceMotion();
  const shouldAnimate = animated && !reduceMotion;

  const floatX = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const cornerDriftA = useRef(new Animated.Value(0)).current;
  const cornerDriftB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const values = [floatX, floatY, cornerDriftA, cornerDriftB];
    if (!shouldAnimate) {
      values.forEach((value) => value.setValue(0));
      return;
    }
    const loops = [
      ...(showOrb ? [loopOscillate(floatY, -16, 16, 10400), loopOscillate(floatX, -10, 12, 14200)] : []),
      loopOscillate(cornerDriftA, -1, 1, 16000),
      loopOscillate(cornerDriftB, -1, 1, 19000),
    ];
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [shouldAnimate, showOrb, floatX, floatY, cornerDriftA, cornerDriftB]);

  const driftA = cornerDriftA.interpolate({ inputRange: [-1, 1], outputRange: [-24, 24] });
  const driftB = cornerDriftB.interpolate({ inputRange: [-1, 1], outputRange: [-28, 28] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.baseCanvas} />

      <Animated.View style={[styles.cornerTopRight, { transform: [{ translateX: driftA }, { translateY: driftB }] }]}>
        <SoftGlow id="corner-top-right" size={CORNER_SIZE} stops={cornerStops('#C9B6F6', 0.7)} />
      </Animated.View>

      {showOrb && (
        <Animated.View style={[styles.orbAnchor, { transform: [{ translateX: floatX }, { translateY: floatY }] }]}>
          <IridescentOrb size={ORB_SIZE} animated={shouldAnimate} />
        </Animated.View>
      )}
    </View>
  );
}

export const PastelBackground = PastelBlobBackground;

const styles = StyleSheet.create({
  baseCanvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EEF0FA',
  },
  cornerTopRight: {
    position: 'absolute',
    top: -CORNER_SIZE * 0.45,
    right: -CORNER_SIZE * 0.45,
  },
  orbAnchor: {
    position: 'absolute',
    top: (SCREEN_H - ORB_SIZE) / 2,
    left: (SCREEN_W - ORB_SIZE) / 2,
  },
});
