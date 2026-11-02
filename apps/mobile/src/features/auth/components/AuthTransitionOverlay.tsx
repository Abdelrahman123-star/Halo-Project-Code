/**
 * AuthTransitionOverlay — hero transition that plays when the user leaves
 * the welcome / onboarding screen toward login or register.
 *
 * Animation timeline (total ≈ 1 170 ms):
 *   0 – 350 ms   Pastel background fades in over the welcome screen.
 *   0 – 280 ms   HALO logo fades in at 1.3× scale, centered on screen.
 *   200 – 950 ms  Logo shrinks (1.3 → 1.0) and travels upward to the exact
 *                 position the logo occupies on the login/register screen.
 *   380 – 950 ms  White card placeholder slides up from below the viewport.
 *   750 ms        Navigation fires (destination screen starts rendering under
 *                 the overlay, invisibly, so it is ready before the reveal).
 *   950 –1 170 ms Overlay fades out, revealing the fully-rendered destination
 *                 screen whose logo and card are in the same visual positions.
 */
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';
import { type Href, useRouter } from 'expo-router';
import { PastelBackground } from './PastelBackground';
import { useAuthTransition } from '../hooks/useAuthTransition';

const { height: SH } = Dimensions.get('window');

// The logo center on the login screen is approximately 22 % from the top.
// From the screen center (50 %) it needs to travel upward 28 % of SH.
const LOGO_TRAVEL_Y = SH * 0.28;

// White card placeholder top edge — just below where the logo ends up.
// logo center end = SH * 0.22  →  logo bottom = SH * 0.22 + 40  →  + 24 gap
const CARD_TOP = SH * 0.22 + 64;

export function AuthTransitionOverlay() {
  const { active, destination, clear } = useAuthTransition();
  const router = useRouter();

  // All animation values — held in refs so they survive re-renders.
  const bgOpacity      = useRef(new Animated.Value(0)).current;
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(1.3)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(SH * 0.65)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  // Guard so the navigate call fires exactly once per transition.
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!active || !destination) return;

    // Reset to initial state before each run.
    bgOpacity.setValue(0);
    logoOpacity.setValue(0);
    logoScale.setValue(1.3);
    logoTranslateY.setValue(0);
    cardTranslateY.setValue(SH * 0.65);
    overlayOpacity.setValue(1);
    hasNavigated.current = false;

    const ease = Easing.out(Easing.cubic);
    const timers: ReturnType<typeof setTimeout>[] = [];

    // ── Phase 1: bg + logo appear (immediate) ───────────────────────────────
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 350,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 280,
        easing: ease,
        useNativeDriver: true,
      }),
    ]).start();

    // ── Phase 2: logo travels + card slides up (starts at 200 ms) ───────────
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 750,
          easing: ease,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: -LOGO_TRAVEL_Y,
          duration: 750,
          easing: ease,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 570,
          delay: 180,
          easing: Easing.out(Easing.back(1.05)),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200));

    // ── Phase 3: navigate at 750 ms ─────────────────────────────────────────
    timers.push(setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace(destination as Href);
      }
    }, 750));

    // ── Phase 4: fade out overlay at 950 ms, then clear context ─────────────
    timers.push(setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => clear());
    }, 950));

    return () => {
      // Cleanup on unmount / re-trigger.
      timers.forEach(clearTimeout);
      [bgOpacity, logoOpacity, logoScale, logoTranslateY, cardTranslateY, overlayOpacity]
        .forEach((v) => v.stopAnimation());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, destination]);

  // Nothing to show when the transition isn't running.
  if (!active) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { opacity: overlayOpacity }]}
      // Non-interactive — the destination screen handles all touches after
      // the overlay fades out.
      pointerEvents="none"
    >
      {/* ── Pastel blob background ─────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <PastelBackground />
      </Animated.View>

      {/* ── HALO logo — centred, animates up and shrinks ────────────────────── */}
      <Animated.Image
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require('../../../../assets/halo-logo.png')}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { translateY: logoTranslateY },
            ],
          },
        ]}
        resizeMode="contain"
      />

      {/* ── White card placeholder — slides up from below the viewport ─────── */}
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: cardTranslateY }] },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    // Cream base so there is no flash before the pastel blobs render.
    backgroundColor: '#F5F0FC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9000,
  },
  logo: {
    // Absolute + centred; transform handles movement.
    position: 'absolute',
    width: 160,
    height: 80,
  },
  card: {
    position: 'absolute',
    top: CARD_TOP,
    left: 20,
    right: 20,
    // Extend past the bottom of the screen so there is no visible gap.
    bottom: -120,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: '#A090C0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
});
