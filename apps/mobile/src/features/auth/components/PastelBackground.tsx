/**
 * PastelBackground — full-screen SVG blob background used on all auth screens.
 * Five soft radial-gradient ellipses positioned at screen edges create the
 * overlapping organic pastel effect matching the HALO auth design spec.
 */
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

export function PastelBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="gLavender" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#C8B4E8" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#C8B4E8" stopOpacity="0"    />
          </RadialGradient>
          <RadialGradient id="gMint" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#A8D8C4" stopOpacity="0.65" />
            <Stop offset="100%" stopColor="#A8D8C4" stopOpacity="0"    />
          </RadialGradient>
          <RadialGradient id="gBlush" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#F0B8D0" stopOpacity="0.65" />
            <Stop offset="100%" stopColor="#F0B8D0" stopOpacity="0"    />
          </RadialGradient>
          <RadialGradient id="gBlue" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#B0CCF0" stopOpacity="0.6"  />
            <Stop offset="100%" stopColor="#B0CCF0" stopOpacity="0"    />
          </RadialGradient>
          <RadialGradient id="gPeach" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#F0D4B8" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#F0D4B8" stopOpacity="0"    />
          </RadialGradient>
        </Defs>
        {/* Lavender — top-left, large */}
        <Ellipse cx={W * 0.05} cy={H * 0.12} rx={W * 0.6} ry={H * 0.26} fill="url(#gLavender)" />
        {/* Mint — top-right */}
        <Ellipse cx={W * 0.92} cy={H * 0.08} rx={W * 0.48} ry={H * 0.22} fill="url(#gMint)" />
        {/* Blush — center-right */}
        <Ellipse cx={W * 0.9}  cy={H * 0.52} rx={W * 0.52} ry={H * 0.24} fill="url(#gBlush)" />
        {/* Baby blue — bottom-left */}
        <Ellipse cx={W * 0.08} cy={H * 0.76} rx={W * 0.46} ry={H * 0.22} fill="url(#gBlue)" />
        {/* Peach — bottom-right */}
        <Ellipse cx={W * 0.82} cy={H * 0.9}  rx={W * 0.5}  ry={H * 0.2}  fill="url(#gPeach)" />
      </Svg>
    </View>
  );
}
