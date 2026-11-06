/**
 * Frosted dashboard card + header row. Same glass recipe as AuthCard
 * (translucent white, white hairline border, top sheen) with tighter padding
 * and a smaller radius so it suits compact tiles.
 */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRightIcon } from '@/features/home/components/HomeIcons';
import { dashboardTheme, type Tone } from './dashboardTheme';

type DashboardCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function DashboardCard({ children, style, compact = false }: DashboardCardProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      <View style={styles.sheen} pointerEvents="none" />
      {children}
    </View>
  );
}

type CardHeaderProps = {
  icon: ReactNode;
  tone: Tone;
  title: string;
  /** Right-side text link, e.g. "View details". Visual only until a destination exists. */
  actionLabel?: string;
  /** Small pill after the title, e.g. a count. */
  badge?: string;
};

export function CardHeader({ icon, tone, title, actionLabel, badge }: CardHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={[styles.iconChip, { backgroundColor: dashboardTheme.toneChip[tone] }]}>{icon}</View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <View style={styles.spacer} />
      {actionLabel ? (
        <View style={styles.action} accessibilityRole="link">
          <Text style={styles.actionText}>{actionLabel}</Text>
          <ChevronRightIcon size={14} color={dashboardTheme.accent} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: 18,
    gap: 14,
    backgroundColor: dashboardTheme.cardBg,
    borderWidth: 1.5,
    borderColor: dashboardTheme.cardBorder,
    overflow: 'hidden',
    shadowColor: '#78689E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 4,
  },
  cardCompact: { padding: 14, gap: 10, borderRadius: 22 },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 22,
    right: 22,
    height: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconChip: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: { flexShrink: 1, fontSize: 15, fontWeight: '700', color: dashboardTheme.text, letterSpacing: -0.1 },
  badge: {
    minWidth: 20,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dashboardTheme.toneChip.lilac,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: dashboardTheme.accent },
  spacer: { flex: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: { fontSize: 12, fontWeight: '600', color: dashboardTheme.accent },
});
