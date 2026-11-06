/**
 * IridescentOrb — a frosted, softly glowing sphere with pastel colour swirls
 * (pink / lavender / sky / aqua) drawn entirely with SVG radial gradients.
 *
 * Motion comes from each colour lobe orbiting the orb centre at its own speed
 * and direction while breathing in and out, so the swirls continuously
 * re-blend instead of repeating a visible loop. All animation is transform /
 * opacity only, so it runs on the native driver.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

export type GlowStop = { offset: number; color: string; opacity: number };

type Lobe = {
  id: string;
  color: string;
  /** Ellipse geometry in a 0–100 viewBox centred on the orb. */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  spinMs: number;
  clockwise: boolean;
  pulseMs: number;
  opacity: number;
};

const LOBES: readonly Lobe[] = [
  // Pearl palette: soft, milky pastels rather than saturated colour.
  { id: 'blush', color: '#F5B4D8', cx: 37, cy: 38, rx: 30, ry: 24, spinMs: 22000, clockwise: true, pulseMs: 7000, opacity: 0.9 },
  { id: 'lilac', color: '#B9A8F3', cx: 63, cy: 35, rx: 28, ry: 26, spinMs: 29000, clockwise: false, pulseMs: 9400, opacity: 0.9 },
  { id: 'powder-blue', color: '#A3CFF6', cx: 63, cy: 63, rx: 30, ry: 24, spinMs: 25000, clockwise: true, pulseMs: 8200, opacity: 0.9 },
  { id: 'mint', color: '#AEE9E0', cx: 38, cy: 64, rx: 26, ry: 22, spinMs: 33000, clockwise: false, pulseMs: 10600, opacity: 0.85 },
  { id: 'champagne', color: '#F7DCC8', cx: 50, cy: 50, rx: 18, ry: 32, spinMs: 18000, clockwise: true, pulseMs: 6200, opacity: 0.7 },
  // Listed last so it draws on top: a white sheen that travels around the
  // surface the way light slides across a real pearl.
  { id: 'sheen', color: '#FFFFFF', cx: 36, cy: 30, rx: 22, ry: 14, spinMs: 40000, clockwise: false, pulseMs: 5200, opacity: 0.8 },
];

// Milky sphere body under the swirls. Opaque almost to the rim so the orb has
// a defined silhouette even behind the translucent auth card.
const BODY_STOPS: readonly GlowStop[] = [
  { offset: 0, color: '#F6F1FC', opacity: 1 },
  { offset: 0.6, color: '#E8DFF8', opacity: 0.97 },
  { offset: 0.86, color: '#DCD0F5', opacity: 0.85 },
  { offset: 1, color: '#DCD0F5', opacity: 0 },
];



// Milky white bloom in the centre — the soft inner glow of nacre.
const VEIL_STOPS: readonly GlowStop[] = [
  { offset: 0, color: '#FFFFFF', opacity: 0.55 },
  { offset: 0.35, color: '#FFFFFF', opacity: 0.25 },
  { offset: 0.6, color: '#FFFFFF', opacity: 0 },
  { offset: 1, color: '#FFFFFF', opacity: 0 },
];

export function loopOscillate(value: Animated.Value, from: number, to: number, durationMs: number) {
  const half = durationMs / 2;
  const easing = Easing.inOut(Easing.sin);
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, { toValue: to, duration: half, easing, useNativeDriver: true }),
      Animated.timing(value, { toValue: from, duration: half, easing, useNativeDriver: true }),
    ]),
  );
}

/** A circle filled with a radial gradient — the building block for every soft glow. */
export function SoftGlow({ id, size, stops }: { id: string; size: number; stops: readonly GlowStop[] }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          {stops.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
          ))}
        </RadialGradient>
      </Defs>
      <Ellipse cx={50} cy={50} rx={50} ry={50} fill={`url(#${id})`} />
    </Svg>
  );
}

function OrbLobe({ lobe, size, animated }: { lobe: Lobe; size: number; animated: boolean }) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      spin.setValue(0);
      pulse.setValue(0.5);
      return;
    }
    const loops = [
      Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: lobe.spinMs, easing: Easing.linear, useNativeDriver: true }),
      ),
      loopOscillate(pulse, 0, 1, lobe.pulseMs),
    ];
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [animated, lobe, spin, pulse]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: lobe.clockwise ? ['0deg', '360deg'] : ['360deg', '0deg'],
  });
  // Scaling around the orb centre also pushes the lobe in and out radially,
  // which is what gives the swirls their "liquid" feel.
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.1] });
  const gradientId = `orb-lobe-${lobe.id}`;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }, { scale }] }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset={0} stopColor={lobe.color} stopOpacity={lobe.opacity} />
            <Stop offset={0.6} stopColor={lobe.color} stopOpacity={lobe.opacity * 0.75} />
            <Stop offset={1} stopColor={lobe.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={lobe.cx} cy={lobe.cy} rx={lobe.rx} ry={lobe.ry} fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}

export function IridescentOrb({ size, animated }: { size: number; animated: boolean }) {
  const veilShimmer = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) {
      veilShimmer.setValue(1);
      return;
    }
    const shimmer = loopOscillate(veilShimmer, 0.8, 1, 5600);
    shimmer.start();
    return () => shimmer.stop();
  }, [animated, veilShimmer]);

  return (
    <View style={{ width: size, height: size }}>
      <SoftGlow id="orb-body" size={size} stops={BODY_STOPS} />

      {LOBES.map((lobe) => (
        <OrbLobe key={lobe.id} lobe={lobe} size={size} animated={animated} />
      ))}

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: veilShimmer }]}>
        <SoftGlow id="orb-veil" size={size} stops={VEIL_STOPS} />
      </Animated.View>
    </View>
  );
}
