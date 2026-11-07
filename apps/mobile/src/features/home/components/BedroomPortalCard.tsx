/**
 * BedroomPortalCard — Frosted luxury action card for room suites.
 * Designed with ui-ux-pro-max guidelines: tactile press feedback,
 * accessible contrast, clear action affordance, and dreamy pastel palette.
 */
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRightIcon } from './HomeIcons';

type BedroomPortalCardProps = {
  title: string;
  description: string;
  badgeText: string;
  badgeVariant?: 'lilac' | 'periwinkle' | 'rose';
  tags: string[];
  icon: ReactNode;
  gradientColors: readonly [string, string];
  iconGradientColors: readonly [string, string];
  arrowColor?: string;
  onPress: () => void;
  accessibilityLabel: string;
};

export type RoomPortalCardProps = BedroomPortalCardProps;

export function BedroomPortalCard({
  title,
  description,
  badgeText,
  badgeVariant = 'lilac',
  tags,
  icon,
  gradientColors,
  iconGradientColors,
  arrowColor = '#6B5299',
  onPress,
  accessibilityLabel,
}: BedroomPortalCardProps) {
  const badgeStyle =
    badgeVariant === 'rose'
      ? styles.badgeRose
      : badgeVariant === 'periwinkle'
      ? styles.badgePeriwinkle
      : styles.badgeLilac;

  const badgeTextStyle =
    badgeVariant === 'rose'
      ? styles.badgeTextRose
      : badgeVariant === 'periwinkle'
      ? styles.badgeTextPeriwinkle
      : styles.badgeTextLilac;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
    >
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.topRow}>
          <LinearGradient colors={iconGradientColors} style={styles.iconCircle}>
            {icon}
          </LinearGradient>
          <View style={[styles.badge, badgeStyle]}>
            <Text style={[styles.badgeText, badgeTextStyle]}>
              {badgeText}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.actionCircle}>
            <ChevronRightIcon size={16} color={arrowColor} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export const RoomPortalCard = BedroomPortalCard;

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#8C78B3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  gradient: {
    padding: 20,
    borderRadius: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#9B8AC2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeLilac: {
    backgroundColor: 'rgba(139, 123, 239, 0.14)',
    borderColor: 'rgba(139, 123, 239, 0.22)',
  },
  badgePeriwinkle: {
    backgroundColor: 'rgba(79, 103, 184, 0.12)',
    borderColor: 'rgba(79, 103, 184, 0.22)',
  },
  badgeRose: {
    backgroundColor: 'rgba(224, 94, 154, 0.13)',
    borderColor: 'rgba(224, 94, 154, 0.24)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  badgeTextLilac: { color: '#6B5299' },
  badgeTextPeriwinkle: { color: '#4865B8' },
  badgeTextRose: { color: '#B04278' },
  body: {
    marginTop: 14,
  },
  title: {
    fontSize: 18.5,
    fontWeight: '700',
    color: '#2E2242',
    letterSpacing: -0.2,
  },
  description: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18.5,
    color: '#6D5B85',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(165, 148, 195, 0.18)',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#76648E',
  },
  actionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C78B3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
});

