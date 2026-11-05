/**
 * PearlescentBackground — soft, luminous, pearlescent pastel canvas for HALO.
 * Uses organic multi-radial pastel gradients (Lavender mist, Blush pink, Pearl blue,
 * Soft mint, and Warm ivory) with subtle light reflections and delicate sparkles.
 */
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

export function PearlescentBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base warm ivory surface */}
      <View style={[StyleSheet.absoluteFill, styles.baseIvory]} />

      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Lavender mist #D9CFF1 */}
          <RadialGradient id="gLavenderMist" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#D9CFF1" stopOpacity="0.85" />
            <Stop offset="65%" stopColor="#D9CFF1" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#D9CFF1" stopOpacity="0" />
          </RadialGradient>

          {/* Blush pink #F1D9E5 */}
          <RadialGradient id="gBlushPink" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#F1D9E5" stopOpacity="0.75" />
            <Stop offset="60%" stopColor="#F1D9E5" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#F1D9E5" stopOpacity="0" />
          </RadialGradient>

          {/* Pearl blue #D4E9EC */}
          <RadialGradient id="gPearlBlue" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#D4E9EC" stopOpacity="0.8" />
            <Stop offset="60%" stopColor="#D4E9EC" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#D4E9EC" stopOpacity="0" />
          </RadialGradient>

          {/* Soft mint #D7EAE3 */}
          <RadialGradient id="gSoftMint" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#D7EAE3" stopOpacity="0.75" />
            <Stop offset="60%" stopColor="#D7EAE3" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#D7EAE3" stopOpacity="0" />
          </RadialGradient>

          {/* Luminous reflection center */}
          <RadialGradient id="gPearlGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Top-left: Lavender Mist organic aura */}
        <Ellipse
          cx={W * 0.15}
          cy={H * 0.14}
          rx={W * 0.72}
          ry={H * 0.28}
          fill="url(#gLavenderMist)"
        />

        {/* Top-right: Soft Mint aura */}
        <Ellipse
          cx={W * 0.95}
          cy={H * 0.18}
          rx={W * 0.6}
          ry={H * 0.26}
          fill="url(#gSoftMint)"
        />

        {/* Center: Delicate Luminous reflection */}
        <Ellipse
          cx={W * 0.5}
          cy={H * 0.42}
          rx={W * 0.8}
          ry={H * 0.32}
          fill="url(#gPearlGlow)"
        />

        {/* Mid-right: Blush Pink gentle aura */}
        <Ellipse
          cx={W * 0.88}
          cy={H * 0.62}
          rx={W * 0.65}
          ry={H * 0.26}
          fill="url(#gBlushPink)"
        />

        {/* Bottom-left: Pearl Blue aura */}
        <Ellipse
          cx={W * 0.12}
          cy={H * 0.82}
          rx={W * 0.68}
          ry={H * 0.28}
          fill="url(#gPearlBlue)"
        />

        {/* Bottom-right: Lavender mist echo */}
        <Ellipse
          cx={W * 0.85}
          cy={H * 0.94}
          rx={W * 0.55}
          ry={H * 0.22}
          fill="url(#gLavenderMist)"
        />

        {/* Minimal subtle sparkle 1 (top right) */}
        <Path
          d={`M ${W * 0.82} ${H * 0.12} Q ${W * 0.82} ${H * 0.127} ${W * 0.828} ${H * 0.127} Q ${W * 0.82} ${H * 0.127} ${W * 0.82} ${H * 0.134} Q ${W * 0.82} ${H * 0.127} ${W * 0.812} ${H * 0.127} Q ${W * 0.82} ${H * 0.127} ${W * 0.82} ${H * 0.12} Z`}
          fill="#FFFFFF"
          opacity={0.65}
        />
        <Circle cx={W * 0.82} cy={H * 0.127} r={1.2} fill="#D9CFF1" opacity={0.8} />

        {/* Minimal subtle sparkle 2 (mid left) */}
        <Path
          d={`M ${W * 0.14} ${H * 0.48} Q ${W * 0.14} ${H * 0.485} ${W * 0.146} ${H * 0.485} Q ${W * 0.14} ${H * 0.485} ${W * 0.14} ${H * 0.49} Q ${W * 0.14} ${H * 0.485} ${W * 0.134} ${H * 0.485} Q ${W * 0.14} ${H * 0.485} ${W * 0.14} ${H * 0.48} Z`}
          fill="#FFFFFF"
          opacity={0.55}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  baseIvory: {
    backgroundColor: '#F9F6F0',
  },
});
