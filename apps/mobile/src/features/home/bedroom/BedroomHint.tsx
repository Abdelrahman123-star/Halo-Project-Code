/**
 * Discovery hint on a piece of furniture: a small line icon on a breathing
 * pearl glow, with a hairline callout that runs from the icon (up or down), bends, and
 * ends in a small spaced-capitals label ("PRESS TO OPEN WARDROBE").
 * The label sits on a barely-there frosted pearl chip so it stays legible on
 * bright parts of the room. The callout draws itself in as `draw` goes 0 → 1
 * (and retracts on the way out); touching brightens it.
 */
import type { ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { SoftGlow, type GlowStop } from '@/features/auth/components/IridescentOrb';
import { FEMALE_LABEL_THEME, type RoomLabelTheme } from '../rooms/roomLabelTheme';

const ICON_BOX = 44;
const ELBOW = 18;
// The bend runs straight into the label chip.
const LABEL_GAP = 0;
const CHIP_PAD_X = 8;
const CHIP_PAD_Y = 3;
/** Label line height; the first line is centred on the callout bend. */
const LABEL_LINE_HEIGHT = 13;
const LINE_WIDTH = 1.8;
// Darker than the room's gold fittings so the line stays visible even alongside them.
const LINE_COLOR = 'rgba(78, 58, 106, 0.9)';
const INK = '#5E4A78';
const LABEL_INK = '#3D2E55';

const GLOW_STOPS: readonly GlowStop[] = [
  { offset: 0, color: '#FFFFFF', opacity: 0.95 },
  { offset: 0.5, color: '#F1E8FF', opacity: 0.55 },
  { offset: 1, color: '#E6DAFA', opacity: 0 },
];

type BedroomHintProps = {
  id: string;
  /** Centre of the icon (screen coordinates). */
  anchor: { x: number; y: number };
  /** Screen y the callout line runs to: above the icon (line rises) or below it (line drops). */
  calloutY: number;
  /** Which way the line bends at the top; the label sits beyond the bend. */
  side: 'left' | 'right';
  label: string;
  /** Wrap the label beyond this width (e.g. to stop before another object). */
  maxLabelWidth?: number;
  icon: ReactNode;
  pulse: Animated.Value;
  /** 0–1: brightened while touched / hovered / selected. */
  reveal: Animated.Value;
  /** 0–1: draws the callout in (and fades the icon); reversed on exit. */
  draw: Animated.Value;
  accessibilityLabel: string;
  onPress: () => void;
  onReveal: (visible: boolean) => void;
  /** Line / label / box colours (per room scene). */
  theme?: RoomLabelTheme;
};

export function BedroomHint({
  id,
  anchor,
  calloutY,
  side,
  label,
  maxLabelWidth,
  icon,
  pulse,
  reveal,
  draw,
  accessibilityLabel,
  onPress,
  onReveal,
  theme = FEMALE_LABEL_THEME,
}: BedroomHintProps) {
  const { width: screenWidth } = useWindowDimensions();
  const goesDown = calloutY > anchor.y;
  // The line spans from the icon's edge to the bend, and grows outward from the icon.
  const lineTop = goesDown ? anchor.y + ICON_BOX / 2 + 2 : calloutY;
  const lineHeight = Math.max(goesDown ? calloutY - lineTop : anchor.y - ICON_BOX / 2 - 2 - calloutY, 0);

  const iconOpacity = draw.interpolate({ inputRange: [0, 0.3], outputRange: [0, 1], extrapolate: 'clamp' });
  const lineGrow = draw.interpolate({ inputRange: [0.15, 0.65], outputRange: [0, 1], extrapolate: 'clamp' });
  const elbowGrow = draw.interpolate({ inputRange: [0.6, 0.8], outputRange: [0, 1], extrapolate: 'clamp' });
  const labelIn = draw.interpolate({ inputRange: [0.75, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const labelShift = draw.interpolate({
    inputRange: [0.75, 1],
    outputRange: [side === 'right' ? -6 : 6, 0],
    extrapolate: 'clamp',
  });
  const lineBoost = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.12] });

  const elbowLeft = side === 'right' ? anchor.x : anchor.x - ELBOW;
  const labelPosition =
    side === 'right' ? { left: anchor.x + ELBOW + LABEL_GAP } : { right: screenWidth - (anchor.x - ELBOW - LABEL_GAP) };

  const pressHandlers = {
    onPress,
    onPressIn: () => onReveal(true),
    onPressOut: () => onReveal(false),
    onHoverIn: () => onReveal(true),
    onHoverOut: () => onReveal(false),
  };

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {/* Hairline from the icon to the bend, drawn outward from the icon. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.line,
          { backgroundColor: theme.line },
          { left: anchor.x - LINE_WIDTH / 2, top: lineTop, height: lineHeight, opacity: lineBoost },
          { transformOrigin: goesDown ? 'top' : 'bottom', transform: [{ scaleY: lineGrow }] },
        ]}
      />
      {/* Short bend at the end of the line, toward the label. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.elbow,
          { backgroundColor: theme.line },
          { left: elbowLeft, top: calloutY - LINE_WIDTH / 2, opacity: lineBoost },
          { transformOrigin: side === 'right' ? 'left' : 'right', transform: [{ scaleX: elbowGrow }] },
        ]}
      />
      <Animated.View pointerEvents="none" style={[styles.dot, { backgroundColor: theme.labelText,  left: anchor.x - 2, top: calloutY - 1.5, opacity: elbowGrow }]} />

      {/* First text line is centred on the bend, so line and label meet cleanly. */}
      <Animated.View
        pointerEvents="box-none"
        style={[styles.labelSlot, labelPosition, { top: calloutY - LABEL_LINE_HEIGHT / 2 - CHIP_PAD_Y, opacity: labelIn, transform: [{ translateX: labelShift }] }]}
      >
        <Pressable {...pressHandlers} hitSlop={10} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={[styles.chip, { backgroundColor: theme.boxBackground, borderColor: theme.boxBorder }]}>
          <Text style={[styles.label, { color: theme.labelText }, maxLabelWidth ? { maxWidth: maxLabelWidth - CHIP_PAD_X * 2 } : null]}>{label}</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.iconSlot, { left: anchor.x - ICON_BOX / 2, top: anchor.y - ICON_BOX / 2, opacity: iconOpacity }]}
      >
        <Pressable {...pressHandlers} hitSlop={14} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={styles.iconBox}>
          <Animated.View pointerEvents="none" style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}>
            <SoftGlow id={`bedroom-hint-${id}`} size={ICON_BOX + 35} stops={GLOW_STOPS} />
          </Animated.View>
          <View pointerEvents="none">{icon}</View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const STROKE = { strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

export function FineHangerIcon({ size = 30, color = INK }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M10 5.5a2 2 0 1 1 2 2v1.6l8.2 6.4c.8.6.4 1.9-.6 1.9H4.4c-1 0-1.4-1.3-.6-1.9L12 9.1" stroke={color} {...STROKE} />
    </Svg>
  );
}

/** Minimal avatar with an orbit ring — reads as "3D you". */
export function FineAvatarIcon({ size = 31, color = INK }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={7.5} r={2.6} stroke={color} {...STROKE} />
      <Path d="M8 17.5c0-2.6 1.8-4.6 4-4.6s4 2 4 4.6" stroke={color} {...STROKE} />
      <Ellipse cx={12} cy={17.2} rx={9} ry={2.6} stroke={color} {...STROKE} opacity={0.7} />
    </Svg>
  );
}

const hairlineGlow = {
  shadowColor: '#FFFFFF',
  shadowOpacity: 0.9,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 0 },
} as const;

const styles = StyleSheet.create({
  line: { position: 'absolute', width: LINE_WIDTH, borderRadius: 1, backgroundColor: LINE_COLOR, ...hairlineGlow },
  elbow: { position: 'absolute', width: ELBOW, height: LINE_WIDTH, borderRadius: 1, backgroundColor: LINE_COLOR, ...hairlineGlow },
  dot: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: LABEL_INK },
  labelSlot: { position: 'absolute' },
  // Barely-there frosted pearl: enough contrast on bright furniture, no solid colour.
  chip: {
    paddingHorizontal: CHIP_PAD_X,
    paddingVertical: CHIP_PAD_Y,
    borderRadius: 8,
    backgroundColor: 'rgba(165, 157, 157, 0.62)',
    borderWidth: 0.5,
    borderColor: 'rgba(104, 96, 121, 0.95)',
  },
  label: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.3,
    lineHeight: LABEL_LINE_HEIGHT,
    color: LABEL_INK,
  },
  iconSlot: { position: 'absolute', width: ICON_BOX, height: ICON_BOX },
  iconBox: { width: ICON_BOX, height: ICON_BOX, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
});
