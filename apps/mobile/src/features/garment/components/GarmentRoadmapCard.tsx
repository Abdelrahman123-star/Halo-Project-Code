/**
 * GarmentRoadmapCard — displays an honest explanation of the 3D pipeline roadmap,
 * indicating that 3D template fitting and avatar try-on are in development (AGENTS.md §3).
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
        <Text style={styles.roadmapTitle}>Stage 1 Complete · 3D Fitting Next</Text>
      </View>
      <Text style={styles.roadmapBody}>
        Clothing analysis & feature extraction finished. 3D template adaptation
        and avatar cloth fitting are upcoming in Phase 3 pipeline.
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
