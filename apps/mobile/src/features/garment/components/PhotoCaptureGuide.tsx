/**
 * PhotoCaptureGuide — Compact frosted photo tip banner (`ui-ux-pro-max`).
 * Streamlined 1-tier helper (~42px) with optional tap-to-expand micro-tips,
 * high-contrast plum typography, and an SVG sparkle icon.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const TIPS = ['Even Lighting', 'Full Frame', 'Minimal Folds'] as const;

export function PhotoCaptureGuide(): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => setIsExpanded((prev) => !prev)}
      accessibilityRole="button"
      accessibilityLabel="Garment photography tip"
      accessibilityHint="Tap to toggle detailed photography recommendations"
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
              <Text style={styles.tipLead}>Photo Tip: </Text>
              Lay flat in bright, even light for clean 3D garment edges.
            </Text>
          </View>

          <View style={styles.togglePill}>
            <Text style={styles.toggleText}>{isExpanded ? 'Hide' : 'Tips'}</Text>
          </View>
        </View>

        {isExpanded ? (
          <View style={styles.expandedRow}>
            {TIPS.map((tip) => (
              <View key={tip} style={styles.pill}>
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>{tip}</Text>
              </View>
            ))}
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
  expandedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 35,
    paddingTop: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(217, 207, 241, 0.60)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  pillDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#8B7BEF',
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6B5299',
  },
});
