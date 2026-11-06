/**
 * STATIC SAMPLE DATA for the Home dashboard UI prototype.
 *
 * Nothing here is real user data, real analysis, real weather or real
 * notifications. The UI labels the dashboard "Preview · sample data".
 * When real sources exist, replace these constants with hooks returning the
 * same shapes (the types below are the contract the cards render).
 */
import type { Tone } from './dashboardTheme';

export type WellnessMetric = {
  id: string;
  label: string;
  /** 0–1, drives the bar fill. */
  value: number;
  /** Short trend note, e.g. "+6% this week". */
  note: string;
  tone: Tone;
};

export type WellnessSummary = {
  score: number;
  scoreLabel: string;
  /** Weekly skin-progress values, oldest first. */
  skinTrend: readonly number[];
  trendDelta: string;
  trendPeriod: string;
  metrics: readonly WellnessMetric[];
};

export type ReminderKind = 'skincare' | 'checkin' | 'event' | 'hydration';

export type Reminder = {
  id: string;
  kind: ReminderKind;
  title: string;
  detail: string;
  time: string;
  /** Not yet done / still ahead today — shows the soft indicator dot. */
  isPending: boolean;
};

export type WeatherSnapshot = {
  temperatureC: number;
  condition: string;
  highC: number;
  lowC: number;
  outfitTip: string;
};

export type HourlyForecast = {
  label: string;
  temperatureC: number;
};

export type CalendarEvent = {
  id: string;
  /** Days from today, so sample events always land near the real date. */
  dayOffset: number;
  title: string;
  time: string;
};

export const SAMPLE_WELLNESS: WellnessSummary = {
  score: 82,
  scoreLabel: 'Glowing',
  skinTrend: [61, 64, 63, 69, 74, 78, 82],
  trendDelta: '+21%',
  trendPeriod: 'last 7 weeks',
  metrics: [
    { id: 'clarity', label: 'Skin clarity', value: 0.78, note: '+6% this week', tone: 'lilac' },
    { id: 'hydration', label: 'Hydration', value: 0.64, note: '+3% this week', tone: 'blue' },
    { id: 'concerns', label: 'Skin concerns', value: 0.22, note: '2 mild · easing', tone: 'blush' },
  ],
};

export const SAMPLE_REMINDERS: readonly Reminder[] = [
  {
    id: 'am-routine',
    kind: 'skincare',
    title: 'Morning skincare routine',
    detail: 'Cleanser, vitamin C, then SPF',
    time: '8:00 AM',
    isPending: false,
  },
  {
    id: 'hydrate',
    kind: 'hydration',
    title: 'A little water break',
    detail: '3 of 8 glasses so far',
    time: '11:00 AM',
    isPending: true,
  },
  {
    id: 'brunch',
    kind: 'event',
    title: 'Brunch with Sara',
    detail: 'Your soft-glam look is ready',
    time: '12:30 PM',
    isPending: true,
  },
  {
    id: 'check-in',
    kind: 'checkin',
    title: 'Wellness check-in',
    detail: 'How is your skin feeling today?',
    time: '9:00 PM',
    isPending: true,
  },
];

export const SAMPLE_WEATHER: WeatherSnapshot = {
  temperatureC: 22,
  condition: 'Partly cloudy',
  highC: 25,
  lowC: 16,
  outfitTip: 'A light jacket might be a good choice today.',
};

export const SAMPLE_HOURLY: readonly HourlyForecast[] = [
  { label: 'Now', temperatureC: 22 },
  { label: '1 PM', temperatureC: 24 },
  { label: '3 PM', temperatureC: 25 },
  { label: '6 PM', temperatureC: 21 },
  { label: '9 PM', temperatureC: 18 },
];

export const SAMPLE_EVENTS: readonly CalendarEvent[] = [
  { id: 'brunch', dayOffset: 0, title: 'Brunch with Sara', time: '12:30 PM' },
  { id: 'facial', dayOffset: 2, title: 'Facial appointment', time: '4:00 PM' },
  { id: 'yoga', dayOffset: 5, title: 'Sunrise yoga', time: '7:30 AM' },
  { id: 'dinner', dayOffset: 9, title: 'Dinner party', time: '8:00 PM' },
];
