/**
 * WardrobeModalHero — Garment crop preview, AI confidence pill, immutable
 * AI-origin metadata note, and dominant color swatches inside WardrobeDetailModal.
 */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { getCategoryLabel, type WardrobeItem } from '@/features/wardrobe/types/wardrobe';

export function WardrobeModalHero({ item }: { item: WardrobeItem }): React.JSX.Element {
  const confPct = item.confidence != null ? Math.round(item.confidence * 100) : null;
  const aiOrig = item.attributes?.ai_original;
  const addedDate = new Date(item.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.heroCard}>
      <View style={styles.imageStage}>
        {item.crop_base64 ? (
          <Image
            source={{ uri: item.crop_base64 }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={item.name}
          />
        ) : (
          <HangerIcon size={40} color="#8B7BEF" />
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>
            {confPct !== null ? `${confPct}% AI Match` : 'Manual Piece'}
          </Text>
        </View>
        <Text style={styles.dateText}>Saved {addedDate}</Text>
      </View>

      {aiOrig ? (
        <Text style={styles.aiOriginNote}>
          AI Detected: {getCategoryLabel(aiOrig.category)}
          {aiOrig.subtype ? ` · ${aiOrig.subtype}` : ''}
        </Text>
      ) : null}

      {item.colors && item.colors.length > 0 ? (
        <View style={styles.swatchesWrap}>
          {item.colors.map((c, idx) => (
            <View key={`${c.hex}-${idx}`} style={styles.swatchChip}>
              <View style={[styles.swatchDot, { backgroundColor: c.hex }]} />
              <Text style={styles.swatchLabel}>
                {c.color_name} ({Math.round(c.percentage)}%)
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.96)',
    gap: 9,
  },
  imageStage: {
    width: '100%',
    height: 165,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(217, 207, 241, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaPill: {
    backgroundColor: 'rgba(139, 123, 239, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  metaPillText: { fontSize: 11, fontWeight: '700', color: '#6B5299' },
  dateText: { fontSize: 11.5, color: '#76648E', fontWeight: '500' },
  aiOriginNote: { fontSize: 11, color: '#6D5B85', fontStyle: 'italic' },
  swatchesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  swatchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(217, 207, 241, 0.5)',
  },
  swatchDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  swatchLabel: { fontSize: 11, color: '#3D3055', fontWeight: '500' },
});

