/**
 * LaunchScreen — HALO app startup animation.
 *
 * Plays a soft pastel fade-in / scale-up / glow sequence then calls
 * onFinished so the root layout can reveal the main navigator.
 *
 * Animation timeline (≈ 2.7 s total):
 *   0–600 ms    background fades in
 *   600–1300 ms  halo glow expands + logo appears
 *   1300–2000 ms hold
 *   2000–2600 ms everything fades out → onFinished()
 *
 * Fix notes:
 * - root always has the cream background colour so there is never a black
 *   flash before the gradient fades in.
 * - LinearGradient is always mounted at full opacity; we animate a plain
 *   View overlay on top that fades from cream→transparent, which avoids
 *   the useNativeDriver + non-Image-child limitation on Android.
 */
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

// Soft pastel palette: blush pink → lavender → warm cream
const PASTEL = {
  bgGradient: ['#F7E8EF', '#EDE4F5', '#FAF3EC'] as const,
  // Starting colour of the fade-in overlay (matches the gradient's avg tone)
  fadeOverlay: '#F4EDF5',
  logoText: '#C5A8C8',
  logoRing: '#D4B8D8',
};

type Props = {
  onFinished: () => void;
};

export function LaunchScreen({ onFinished }: Props) {
  // Overlay fades OUT (1→0) to reveal the gradient beneath
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const glowScale      = useRef(new Animated.Value(0.4)).current;
  const glowOpacity    = useRef(new Animated.Value(0)).current;
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(0.82)).current;
  const masterOpacity  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Phase 1: reveal the pastel gradient by fading the overlay away
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Phase 2: glow expands + logo appears
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.05)),
          useNativeDriver: true,
        }),
      ]),
      // Phase 3: hold
      Animated.delay(700),
      // Phase 4: gentle fade-out of entire screen
      Animated.timing(masterOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => onFinished());
  }, [overlayOpacity, glowOpacity, glowScale, logoOpacity, logoScale, masterOpacity, onFinished]);

  return (
    <Animated.View style={[styles.root, { opacity: masterOpacity }]}>
      {/* Pastel gradient — always mounted, full opacity, no animation on it directly */}
      <LinearGradient
        colors={PASTEL.bgGradient}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/*
       * Plain-colour overlay that starts opaque and fades out,
       * "revealing" the gradient underneath. This avoids the
       * useNativeDriver limitation with LinearGradient children.
       */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: PASTEL.fadeOverlay, opacity: overlayOpacity },
        ]}
      />

      {/* Dreamy radial halo glow */}
      <Animated.View
        style={[
          styles.glowContainer,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      >
        <View style={styles.glowOuter} />
        <View style={styles.glowInner} />
      </Animated.View>

      {/* HALO logo: concentric ring mark + wordmark */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        {/* Ring mark: three concentric circles */}
        <View style={styles.markWrapper}>
          <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
            <Circle cx={32} cy={32} r={29} stroke={PASTEL.logoRing} strokeWidth={1.6} strokeOpacity={0.85} />
            <Circle cx={32} cy={32} r={18} stroke={PASTEL.logoRing} strokeWidth={1.3} strokeOpacity={0.6} />
            <Circle cx={32} cy={32} r={6}  stroke={PASTEL.logoRing} strokeWidth={1.1} strokeOpacity={0.45} />
          </Svg>
        </View>

        {/* Wordmark */}
        <Animated.Text style={styles.wordmark}>HALO</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const GLOW_OUTER_SIZE = SCREEN_W * 0.88;
const GLOW_INNER_SIZE = SCREEN_W * 0.50;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    // Solid fallback so there is NEVER a black/transparent flash
    backgroundColor: '#F4EDF5',
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: GLOW_OUTER_SIZE,
    height: GLOW_OUTER_SIZE,
  },
  glowOuter: {
    position: 'absolute',
    width: GLOW_OUTER_SIZE,
    height: GLOW_OUTER_SIZE,
    borderRadius: GLOW_OUTER_SIZE / 2,
    backgroundColor: 'rgba(220, 190, 230, 0.22)',
    shadowColor: '#D4B0E0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 65,
    elevation: 8,
  },
  glowInner: {
    position: 'absolute',
    width: GLOW_INNER_SIZE,
    height: GLOW_INNER_SIZE,
    borderRadius: GLOW_INNER_SIZE / 2,
    backgroundColor: 'rgba(230, 200, 240, 0.35)',
    shadowColor: '#C8A0D8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 44,
    elevation: 12,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 20,
  },
  markWrapper: {
    shadowColor: '#C0A0D0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 4,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: 14,
    color: PASTEL.logoText,
    shadowColor: '#C8A0D8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 0,
    // Compensate optical shift from wide letterSpacing
    marginLeft: 14,
  },
});
