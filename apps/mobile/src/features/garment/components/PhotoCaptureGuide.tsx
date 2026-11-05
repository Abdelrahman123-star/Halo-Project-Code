/**
 * PhotoCaptureGuide — subtle frosted advice card offering helpful garment capture tips.
 * Features a delicate thin-line sparkle icon and understated muted typography.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { luxuryPastel } from '@/shared/theme/tokens';

export function PhotoCaptureGuide(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"
            stroke={luxuryPastel.dustyMauve}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={styles.textBox}>
        <Text style={styles.title}>A little tip for better results</Text>
        <Text style={styles.description}>
          For the best 3D results, photograph your garment fully visible, with good lighting and minimal folds.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 12,
    shadowColor: luxuryPastel.shadowMauve,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 207, 241, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  textBox: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: luxuryPastel.textMauve,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    color: luxuryPastel.textSecondary,
    fontWeight: '400',
  },
});
