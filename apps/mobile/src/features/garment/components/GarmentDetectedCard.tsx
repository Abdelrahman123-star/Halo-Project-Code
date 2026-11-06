/**
 * GarmentDetectedCard — displays an individual detected garment's details
 * with HALO luxury frosted-glass styling: category, confidence, un-distorted
 * isolated crop on white background, dominant color swatches, and attributes.
 */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FrostedGlassCard } from '@/features/garment/components/FrostedGlassCard';
import type { DetectedGarment } from '@/features/garment/types/garment';
import { luxuryPastel } from '@/shared/theme/tokens';

interface GarmentDetectedCardProps {
  garment: DetectedGarment;
}

export function GarmentDetectedCard({
  garment,
}: GarmentDetectedCardProps): React.JSX.Element {
  return (
    <FrostedGlassCard variant="panel" style={styles.garmentCard}>
      <View style={styles.garmentHeader}>
        <View>
          <Text style={styles.garmentCategory}>
            {garment.category.replace(/_/g, ' ').toUpperCase()}
          </Text>
          <Text style={styles.garmentConfidence}>
            Confidence: {(garment.confidence * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.itemBadge}>
          <Text style={styles.itemBadgeText}>#{garment.item_number}</Text>
        </View>
      </View>

      {/* Clean un-distorted crop on white background */}
      {garment.crop_base64 ? (
        <View style={styles.cropHolder}>
          <Image
            source={{ uri: garment.crop_base64 }}
            style={styles.cropImage}
            resizeMode="contain"
          />
        </View>
      ) : null}

      {/* Palette Swatches */}
      <Text style={styles.sectionHeading}>Dominant Colors</Text>
      <View style={styles.swatchWrap}>
        {garment.colors.map((c, i) => (
          <View key={i} style={styles.swatchPill}>
            <View style={[styles.swatchColor, { backgroundColor: c.hex }]} />
            <Text style={styles.swatchText}>
              {c.color_name} ({c.percentage.toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>

      {/* Garment Attributes */}
      <Text style={styles.sectionHeading}>Garment Attributes</Text>
      <View style={styles.attrGrid}>
        <View style={styles.attrItem}>
          <Text style={styles.attrLabel}>Subtype</Text>
          <Text style={styles.attrValue}>
            {garment.attributes.subtype.predicted ?? 'Standard'}
          </Text>
        </View>
        <View style={styles.attrItem}>
          <Text style={styles.attrLabel}>Fabric</Text>
          <Text style={styles.attrValue}>
            {garment.attributes.fabric.predicted ?? 'Unknown'}
          </Text>
        </View>
        <View style={styles.attrItem}>
          <Text style={styles.attrLabel}>Pattern</Text>
          <Text style={styles.attrValue}>
            {garment.attributes.pattern.predicted ?? 'Solid'}
          </Text>
        </View>
      </View>
    </FrostedGlassCard>
  );
}

const styles = StyleSheet.create({
  garmentCard: {
    width: '100%',
    padding: 18,
    gap: 12,
  },
  garmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  garmentCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: luxuryPastel.textMauve,
    letterSpacing: 0.5,
  },
  garmentConfidence: {
    fontSize: 12,
    color: luxuryPastel.textSecondary,
  },
  itemBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 207, 241, 0.45)',
  },
  itemBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: luxuryPastel.textMauve,
  },
  cropHolder: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(217, 207, 241, 0.4)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropImage: {
    width: '100%',
    height: '100%',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: luxuryPastel.dustyMauve,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  swatchWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(217, 207, 241, 0.5)',
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
  },
  swatchColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  swatchText: {
    fontSize: 11,
    color: luxuryPastel.textMauve,
    fontWeight: '500',
  },
  attrGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  attrItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 207, 241, 0.35)',
  },
  attrLabel: {
    fontSize: 10,
    color: luxuryPastel.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  attrValue: {
    fontSize: 12,
    fontWeight: '600',
    color: luxuryPastel.textMauve,
    marginTop: 2,
  },
});
