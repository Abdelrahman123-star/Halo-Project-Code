/**
 * GarmentRoadmapCard — explains that the saved garment is converted to 3D automatically,
 * while avatar fitting / try-on is still in development (AGENTS.md §3).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { FrostedGlassCard } from '@/features/garment/components/FrostedGlassCard';
import { luxuryPastel } from '@/shared/theme/tokens';

export function GarmentRoadmapCard(): React.JSX.Element {
  return (
    <FrostedGlassCard variant="subtle" style={styles.roadmapCard}>
      <View style={styles.roadmapHeader}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Circle
            cx={12}
            cy={12}
            r={10}
            stroke={luxuryPastel.dustyMauve}
            strokeWidth={1.5}
          />
          <Path
            d="M12 8v4M12 16h.01"
            stroke={luxuryPastel.dustyMauve}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.roadmapTitle}>Saved · Converting to 3D Automatically</Text>
      </View>
      <Text style={styles.roadmapBody}>
        Your 3D model is being built in the background (usually 2–5 minutes). It appears
        on the piece in your wardrobe automatically, ready to rotate and zoom.
      </Text>
    </FrostedGlassCard>
  );
}

const styles = StyleSheet.create({
  roadmapCard: {
    width: '100%',
    padding: 14,
    gap: 6,
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roadmapTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: luxuryPastel.textMauve,
  },
  roadmapBody: {
    fontSize: 11,
    color: luxuryPastel.textSecondary,
    lineHeight: 16,
  },
});
