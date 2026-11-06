/**
 * Mini month calendar for the real current date. Today gets the pearl
 * gradient; days with (sample) events get a soft lilac dot. The next two
 * upcoming events are listed underneath.
 */
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DashboardCard } from './DashboardCard';
import {
  addDays,
  buildMonthGrid,
  isSameMonth,
  MONTH_NAMES,
  relativeDayLabel,
  WEEKDAY_INITIALS,
} from './calendarMath';
import { dashboardTheme } from './dashboardTheme';
import type { CalendarEvent } from './sampleData';

type CalendarCardProps = {
  today: Date;
  events: readonly CalendarEvent[];
  /** How many upcoming events to list under the grid. */
  upcomingLimit?: number;
  style?: StyleProp<ViewStyle>;
};

export function CalendarCard({ today, events, upcomingLimit = 2, style }: CalendarCardProps) {
  const weeks = buildMonthGrid(today.getFullYear(), today.getMonth());
  const datedEvents = events.map((event) => ({ ...event, date: addDays(today, event.dayOffset) }));
  const eventDays = new Set(
    datedEvents.filter((event) => isSameMonth(event.date, today)).map((event) => event.date.getDate()),
  );
  const upcoming = datedEvents.slice(0, upcomingLimit);

  return (
    <DashboardCard compact style={style}>
      <View style={styles.header}>
        <Text style={styles.month}>{MONTH_NAMES[today.getMonth()]}</Text>
        <Text style={styles.year}>{today.getFullYear()}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.week}>
          {WEEKDAY_INITIALS.map((initial, index) => (
            <Text key={`${initial}-${index}`} style={styles.weekday}>
              {initial}
            </Text>
          ))}
        </View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => (
              <DayCell
                key={dayIndex}
                day={day}
                isToday={day === today.getDate()}
                hasEvent={day !== null && eventDays.has(day)}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.events}>
        {upcoming.map((event) => (
          <View key={event.id} style={styles.event}>
            <View style={styles.eventBar} />
            <View style={styles.eventText}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={styles.eventWhen} numberOfLines={1}>
                {relativeDayLabel(today, event.date)} · {event.time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </DashboardCard>
  );
}

function DayCell({ day, isToday, hasEvent }: { day: number | null; isToday: boolean; hasEvent: boolean }) {
  if (day === null) return <View style={styles.cell} />;

  return (
    <View style={styles.cell}>
      {isToday ? (
        <LinearGradient
          colors={dashboardTheme.pearlGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.todayBubble}
        >
          <Text style={[styles.day, styles.todayText]}>{day}</Text>
        </LinearGradient>
      ) : (
        <Text style={[styles.day, hasEvent && styles.eventDayText]}>{day}</Text>
      )}
      <View style={[styles.eventDot, !hasEvent && styles.hidden]} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  month: { fontSize: 15, fontWeight: '700', color: dashboardTheme.text },
  year: { fontSize: 12, color: dashboardTheme.muted },
  grid: { gap: 1 },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: dashboardTheme.muted },
  cell: { flex: 1, alignItems: 'center', height: 24, justifyContent: 'center' },
  day: { fontSize: 11, color: dashboardTheme.text },
  todayBubble: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  todayText: { fontWeight: '700', color: dashboardTheme.plum },
  eventDayText: { fontWeight: '700', color: dashboardTheme.accent },
  eventDot: { position: 'absolute', bottom: 0, width: 4, height: 4, borderRadius: 2, backgroundColor: '#B9A8F3' },
  hidden: { opacity: 0 },
  events: { gap: 8 },
  event: { flexDirection: 'row', gap: 8 },
  eventBar: { width: 3, borderRadius: 2, backgroundColor: '#D5C6F6' },
  eventText: { flex: 1 },
  eventTitle: { fontSize: 12, fontWeight: '600', color: dashboardTheme.text },
  eventWhen: { fontSize: 11, color: dashboardTheme.muted },
});
