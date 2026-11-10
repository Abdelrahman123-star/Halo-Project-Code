/**
 * Shared choreography for interactive room screens: a breathing light for the
 * hotspots, per-object label reveal, and the tap sequence
 * (label + shimmer → zoom toward the object + pastel veil → navigate).
 * Everything resets when the screen regains focus. Reduced motion skips the
 * breathing and the zoom.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { Rect } from '../bedroom/bedroomLayout';

export function useRoomInteraction<T extends string>(targets: readonly T[]) {
  const [target, setTarget] = useState<T | null>(null);
  const isNavigating = useRef(false);
  const reduceMotion = useRef(false);
  const zoom = useRef(new Animated.Value(0)).current;
  const veil = useRef(new Animated.Value(0)).current;
  const hud = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const reveal = useRef(
    Object.fromEntries(targets.map((id) => [id, new Animated.Value(0)])) as Record<T, Animated.Value>,
  ).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.current = enabled;
      if (enabled) {
        pulse.setValue(0.6);
        return;
      }
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();
    });
    return () => pulse.stopAnimation();
  }, [pulse]);

  // Coming back to the room: un-zoom, hide labels' highlight, draw callouts in again.
  useFocusEffect(
    useCallback(() => {
      isNavigating.current = false;
      setTarget(null);
      [zoom, veil, hud, shimmer, ...Object.values<Animated.Value>(reveal)].forEach((value) => value.setValue(0));
      const fadeIn = Animated.timing(hud, {
        toValue: 1,
        duration: 1100,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
      fadeIn.start();
      return () => fadeIn.stop();
    }, [hud, reveal, shimmer, veil, zoom]),
  );

  const setRevealed = useCallback(
    (which: T, visible: boolean) => {
      if (isNavigating.current) return;
      Animated.timing(reveal[which], { toValue: visible ? 1 : 0, duration: visible ? 200 : 320, useNativeDriver: true }).start();
    },
    [reveal],
  );

  function open(which: T, navigate: () => void) {
    if (isNavigating.current) return;
    isNavigating.current = true;
    setTarget(which);

    if (reduceMotion.current) {
      navigate();
      return;
    }
    // Label + shimmer first, so the tap feels acknowledged, then the camera moves in.
    Animated.parallel([
      Animated.timing(reveal[which], { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(380),
        Animated.parallel([
          Animated.timing(hud, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(zoom, { toValue: 1, duration: 700, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(360),
            Animated.timing(veil, { toValue: 1, duration: 340, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]),
        ]),
      ]),
    ]).start(() => navigate());
  }

  /**
   * Transform for the room layer that brings `focus`'s centre to the screen
   * centre while scaling up (RN applies transforms about the view centre:
   * p' = c + t + s·(p − c)).
   */
  function zoomTransform(focus: Rect, scaleTo: number, screen: { width: number; height: number }) {
    const dx = -scaleTo * (focus.x + focus.width / 2 - screen.width / 2);
    const dy = -scaleTo * (focus.y + focus.height / 2 - screen.height / 2);
    return [
      { translateX: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
      { translateY: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
      { scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, scaleTo] }) },
    ];
  }

  return { target, pulse, shimmer, veil, hud, reveal, setRevealed, open, zoomTransform };
}
