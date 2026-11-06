/**
 * WardrobeHangerDecor — minimal clothing hanger with subtle pearlescent glow
 * and delicate flanking hairlines. Placed below the heading.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { luxuryPastel } from '@/shared/theme/tokens';

export function WardrobeHangerDecor(): React.JSX.Element {
  return (
    <View style={styles.container}>
      {/* Left delicate fade line */}
      <LinearGradient
        colors={['rgba(217, 207, 241, 0)', 'rgba(217, 207, 241, 0.6)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.hairline}
      />

      {/* Center Hanger with pearlescent glow */}
      <View style={styles.hangerBadge}>
        <View style={styles.badgeGlow} />
        <Svg width={22} height={20} viewBox="0 0 24 24" fill="none">
          {/* Hook */}
          <Path
            d="M12 9V7a2.5 2.5 0 1 1 5 0c0 1.2-.8 2-2.5 2"
            stroke={luxuryPastel.dustyMauve}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {/* Triangular Hanger Frame */}
          <Path
            d="M3 18l9-9 9 9H3z"
            stroke={luxuryPastel.dustyMauve}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bottom crossbar notch */}
          <Circle cx={12} cy={18} r={1} fill={luxuryPastel.lavenderMist} />
        </Svg>
      </View>

      {/* Right delicate fade line */}
      <LinearGradient
        colors={['rgba(217, 207, 241, 0.6)', 'rgba(217, 207, 241, 0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.hairline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    gap: 12,
  },
  hairline: {
    flex: 1,
    height: 1,
    maxWidth: 60,
  },
  hangerBadge: {
    width: 38,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: luxuryPastel.shadowMauve,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeGlow: {
    position: 'absolute',
    width: 32,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(217, 207, 241, 0.5)',
  },
});
