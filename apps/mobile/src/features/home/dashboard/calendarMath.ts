/** Pure date helpers for the mini calendar (weeks start on Monday). */

/** Weeks of the month; each week has 7 slots, null for days outside the month. */
export function buildMonthGrid(year: number, monthIndex: number): (number | null)[][] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // getDay(): Sunday = 0. Shift so Monday = 0.
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

  const slots: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (slots.length % 7 !== 0) slots.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < slots.length; i += 7) weeks.push(slots.slice(i, i + 7));
  return weeks;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** "Today", "Tomorrow", or e.g. "Fri 13". */
export function relativeDayLabel(today: Date, date: Date): string {
  const dayMs = 24 * 60 * 60 * 1000;
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(date) - startOf(today)) / dayMs);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${SHORT_WEEKDAYS[date.getDay()]} ${date.getDate()}`;
}
