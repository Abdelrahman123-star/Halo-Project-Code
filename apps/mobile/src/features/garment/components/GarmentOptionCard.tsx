/**
 * GarmentOptionCard — Compact luxury capture action card (`ui-ux-pro-max`).
 * Dual-column bento tile (default 'vertical') or wide banner ('horizontal')
 * with royal lilac / periwinkle accents, rounded SVGs, and tactile scale.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface GarmentOptionCardProps {
  type: 'camera' | 'gallery';
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export function GarmentOptionCard({
  type,
  title,
  subtitle,
  onPress,
  disabled = false,
  layout = 'vertical',
}: GarmentOptionCardProps): React.JSX.Element {
  const isCamera = type === 'camera';
  const isVertical = layout === 'vertical';

  const surfaceColors = isCamera
    ? (['rgba(255, 255, 255, 0.96)', 'rgba(247, 243, 255, 0.88)'] as const)
    : (['rgba(255, 255, 255, 0.96)', 'rgba(242, 247, 255, 0.88)'] as const);

  const iconGradColors = isCamera
    ? (['#EFE9FD', '#E2D7FC'] as const)
    : (['#E9F0FE', '#D7E5FC'] as const);

  const accentColor = isCamera ? '#644498' : '#4865B8';
  const badgeLabel = isCamera ? 'CAMERA' : 'GALLERY';

  const icon = isCamera ? (
    <Svg width={isVertical ? 20 : 22} height={isVertical ? 20 : 22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke={accentColor}
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={13} r={3.6} stroke={accentColor} strokeWidth={1.85} />
    </Svg>
  ) : (
    <Svg width={isVertical ? 20 : 22} height={isVertical ? 20 : 22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3.5} stroke={accentColor} strokeWidth={1.85} />
      <Circle cx={8.5} cy={8.5} r={1.6} fill={accentColor} />
      <Path d="m21 15-5-5L5 21" stroke={accentColor} strokeWidth={1.85} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      style={({ pressed }) => [
        isVertical ? styles.wrapVert : styles.wrapHoriz,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <LinearGradient colors={surfaceColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={isVertical ? styles.gradVert : styles.gradHoriz}>
        {isVertical ? (
          <>
            <View style={styles.topRow}>
              <LinearGradient colors={iconGradColors} style={styles.iconCircleVert}>{icon}</LinearGradient>
              <View style={[styles.badge, isCamera ? styles.badgeLilac : styles.badgePeriwinkle]}>
                <Text style={[styles.badgeText, { color: accentColor }]}>{badgeLabel}</Text>
              </View>
            </View>
            <View style={styles.bodyVert}>
              <Text style={styles.titleVert} numberOfLines={1}>{title}</Text>
              <Text style={styles.subVert} numberOfLines={2}>{subtitle}</Text>
            </View>
          </>
        ) : (
          <View style={styles.rowHoriz}>
            <LinearGradient colors={iconGradColors} style={styles.iconCircleHoriz}>{icon}</LinearGradient>
            <View style={styles.textColHoriz}>
              <View style={styles.titleRowHoriz}>
                <Text style={styles.titleHoriz}>{title}</Text>
                <View style={[styles.badge, isCamera ? styles.badgeLilac : styles.badgePeriwinkle]}>
                  <Text style={[styles.badgeText, { color: accentColor }]}>{badgeLabel}</Text>
                </View>
              </View>
              <Text style={styles.subHoriz}>{subtitle}</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapVert: { flex: 1, borderRadius: 18, borderWidth: 1.2, borderColor: 'rgba(255, 255, 255, 0.96)', shadowColor: '#8C78B3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, overflow: 'hidden' },
  wrapHoriz: { width: '100%', borderRadius: 20, borderWidth: 1.2, borderColor: 'rgba(255, 255, 255, 0.96)', shadowColor: '#8C78B3', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.09, shadowRadius: 12, elevation: 3, overflow: 'hidden' },
  pressed: { transform: [{ scale: 0.975 }], opacity: 0.92 },
  disabled: { opacity: 0.55 },
  gradVert: { paddingVertical: 12, paddingHorizontal: 12, minHeight: 108, justifyContent: 'space-between' },
  gradHoriz: { paddingVertical: 14, paddingHorizontal: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconCircleVert: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.92)', shadowColor: '#9B8AC2', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 5, elevation: 2 },
  bodyVert: { marginTop: 8, gap: 2 },
  titleVert: { fontSize: 14.5, fontWeight: '700', color: '#2E2242', letterSpacing: -0.2 },
  subVert: { fontSize: 11, lineHeight: 15, color: '#6D5B85' },
  badge: { paddingHorizontal: 6.5, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  badgeLilac: { backgroundColor: 'rgba(139, 123, 239, 0.12)', borderColor: 'rgba(139, 123, 239, 0.22)' },
  badgePeriwinkle: { backgroundColor: 'rgba(79, 103, 184, 0.10)', borderColor: 'rgba(79, 103, 184, 0.20)' },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  rowHoriz: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircleHoriz: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.92)' },
  textColHoriz: { flex: 1, gap: 3 },
  titleRowHoriz: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleHoriz: { fontSize: 15, fontWeight: '700', color: '#2E2242' },
  subHoriz: { fontSize: 12, lineHeight: 16, color: '#6D5B85' },
});
