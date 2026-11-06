/**
 * HaloHeader — clean, minimal top navigation bar for HALO screens.
 * Respects safe area, features a thin-line back navigation arrow, and centered HALO branding.
 */
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { luxuryPastel } from '@/shared/theme/tokens';

interface HaloHeaderProps {
  onBack: () => void;
  title?: string;
  rightAction?: React.ReactNode;
}

export function HaloHeader({
  onBack,
  title,
  rightAction,
}: HaloHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
      {/* Back button */}
      <Pressable
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M19 12H5M12 19l-7-7 7-7"
            stroke={luxuryPastel.dustyMauve}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      {/* Centered HALO Logo / Title */}
      <View style={styles.centerBox}>
        <View style={styles.logoRow}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle
              cx={12}
              cy={12}
              r={9}
              stroke={luxuryPastel.lavenderMist}
              strokeWidth={2}
            />
            <Circle
              cx={12}
              cy={12}
              r={4}
              stroke={luxuryPastel.dustyMauve}
              strokeWidth={1.8}
            />
          </Svg>
          <Text style={styles.brandTitle}>HALO</Text>
        </View>
        {title ? <Text style={styles.subTitle}>{title}</Text> : null}
      </View>

      {/* Right slot for visual balance */}
      <View style={styles.rightSlot}>
        {rightAction ? rightAction : <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: luxuryPastel.shadowMauve,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4.5,
    color: luxuryPastel.dustyMauve,
    marginLeft: 2,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    color: luxuryPastel.textSecondary,
    marginTop: 2,
  },
  rightSlot: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
