/**
 * Today's reminders — a personal-assistant style timeline: tinted icon,
 * gentle copy, time, and a soft dot for anything still ahead today.
 */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CardHeader, DashboardCard } from './DashboardCard';
import { BellIcon, CalendarIcon, DropletIcon, HeartPulseIcon, SkincareIcon } from './DashboardIcons';
import { dashboardTheme, type Tone } from './dashboardTheme';
import type { Reminder, ReminderKind } from './sampleData';

const KIND_STYLE: Record<ReminderKind, { tone: Tone; icon: (color: string) => ReactNode }> = {
  skincare: { tone: 'blush', icon: (color) => <SkincareIcon color={color} /> },
  hydration: { tone: 'blue', icon: (color) => <DropletIcon color={color} /> },
  event: { tone: 'champagne', icon: (color) => <CalendarIcon color={color} /> },
  checkin: { tone: 'mint', icon: (color) => <HeartPulseIcon color={color} /> },
};

function ReminderRow({ reminder, isLast }: { reminder: Reminder; isLast: boolean }) {
  const { tone, icon } = KIND_STYLE[reminder.kind];

  return (
    <View style={styles.row}>
      {/* Icon on a thin vertical thread, so the list reads like a day timeline. */}
      <View style={styles.rail}>
        <View style={[styles.iconChip, { backgroundColor: dashboardTheme.toneChip[tone] }]}>
          {icon(dashboardTheme.toneInk[tone])}
        </View>
        {isLast ? null : <View style={styles.thread} />}
      </View>

      <View style={[styles.body, !reminder.isPending && styles.bodyDone]}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {reminder.title}
          </Text>
          <Text style={styles.time}>{reminder.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detail} numberOfLines={1}>
            {reminder.isPending ? reminder.detail : `Done · ${reminder.detail}`}
          </Text>
          {reminder.isPending ? <View style={styles.pendingDot} accessibilityLabel="Upcoming" /> : null}
        </View>
      </View>
    </View>
  );
}

export function RemindersCard({ reminders }: { reminders: readonly Reminder[] }) {
  const pendingCount = reminders.filter((reminder) => reminder.isPending).length;

  return (
    <DashboardCard>
      <CardHeader
        icon={<BellIcon />}
        tone="lilac"
        title="Today's reminders"
        badge={pendingCount > 0 ? String(pendingCount) : undefined}
      />
      <View>
        {reminders.map((reminder, index) => (
          <ReminderRow key={reminder.id} reminder={reminder} isLast={index === reminders.length - 1} />
        ))}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 34 },
  iconChip: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  thread: { flex: 1, width: 1.5, marginVertical: 3, borderRadius: 1, backgroundColor: dashboardTheme.hairline },
  body: { flex: 1, paddingTop: 1, paddingBottom: 14, gap: 3 },
  bodyDone: { opacity: 0.55 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  title: { flex: 1, fontSize: 14, fontWeight: '600', color: dashboardTheme.text },
  time: { fontSize: 11, fontWeight: '600', color: dashboardTheme.muted },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detail: { flex: 1, fontSize: 12, color: dashboardTheme.muted },
  pendingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#B9A8F3' },
});
