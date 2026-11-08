/**
 * PhotoCaptureGuide — how to photograph a garment so the automatic 3D
 * conversion (single-image image-to-3D) gets a clean silhouette.
 * Expanded by default; tap to collapse.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const TIPS = [
  { title: 'One garment only', detail: 'No other clothes, hangers, hands or people in the shot.' },
  { title: 'Plain, contrasting background', detail: 'Lay it on a bed sheet, floor or wall that differs from its colour.' },
  { title: 'Flat & front-facing', detail: 'Spread it out, sleeves to the sides, folds and wrinkles smoothed.' },
  { title: 'Whole piece in frame', detail: 'Shoot straight from above with a little space around every edge.' },
  { title: 'Bright, even light', detail: 'Daylight works best. No flash, harsh shadows or reflections.' },
  { title: 'Sharp photo', detail: 'Hold steady; a blurry photo gives a blurry 3D model.' },
] as const;

export function PhotoCaptureGuide(): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Pressable
      onPress={() => setIsExpanded((prev) => !prev)}
      accessibilityRole="button"
      accessibilityLabel="How to photograph a garment for 3D"
      accessibilityHint="Tap to show or hide the photo checklist"
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.92)', 'rgba(244, 239, 254, 0.82)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.mainRow}>
          <View style={styles.iconBadge}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"
                stroke="#6B5299"
                strokeWidth={1.85}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <View style={styles.textBox}>
            <Text style={styles.tipText} numberOfLines={isExpanded ? undefined : 1}>
              <Text style={styles.tipLead}>For a great 3D model: </Text>
              one garment, laid flat, fully in frame.
            </Text>
          </View>

          <View style={styles.togglePill}>
            <Text style={styles.toggleText}>{isExpanded ? 'Hide' : 'Tips'}</Text>
          </View>
        </View>

        {isExpanded ? (
          <View style={styles.expandedList}>
            {TIPS.map((tip, index) => (
              <View key={tip.title} style={styles.tipRow}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.tipRowText}>
                  <Text style={styles.tipRowTitle}>{tip.title}. </Text>
                  {tip.detail}
                </Text>
              </View>
            ))}
            <Text style={styles.privacyNote}>
              Saved photos are sent to our 3D provider (Meshy) to build the model.
            </Text>
          </View>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    borderWidth: 1.1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#8C78B3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.88,
  },
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 7,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(139, 123, 239, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
  },
  tipText: {
    fontSize: 11.5,
    lineHeight: 15.5,
    color: '#554271',
  },
  tipLead: {
    fontWeight: '700',
    color: '#2E2242',
  },
  togglePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 123, 239, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 123, 239, 0.22)',
  },
  toggleText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6B5299',
    letterSpacing: 0.3,
  },
  expandedList: {
    gap: 6,
    paddingLeft: 35,
    paddingTop: 2,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  tipNumber: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    marginTop: 0.5,
    backgroundColor: 'rgba(139, 123, 239, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumberText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6B5299',
  },
  tipRowText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#554271',
  },
  tipRowTitle: {
    fontWeight: '700',
    color: '#2E2242',
  },
  privacyNote: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 14,
    color: '#8A7AA5',
    fontStyle: 'italic',
  },
});
