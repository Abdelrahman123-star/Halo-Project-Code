/**
 * Frosted-glass bottom navigation on Home: Wellness, Reminders, Weather,
 * Calendar. Each item opens its own page. A real blur (expo-blur) of the page
 * behind it, with a faint pearl tint and white rim, matches the auth glass.
 */
import type { ComponentRef, ReactNode, RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BellIcon, CalendarIcon, CloudSunIcon, SparkleIcon } from '../dashboard/DashboardIcons';
import { dashboardTheme, type Tone } from '../dashboard/dashboardTheme';

type NavItem = {
  label: string;
  href: Href;
  tone: Tone;
  icon: (color: string) => ReactNode;
};

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Wellness', href: '/(app)/wellness', tone: 'lilac', icon: (c) => <SparkleIcon size={20} color={c} /> },
  { label: 'Reminders', href: '/(app)/reminders', tone: 'blush', icon: (c) => <BellIcon size={20} color={c} /> },
  { label: 'Weather', href: '/(app)/weather', tone: 'blue', icon: (c) => <CloudSunIcon size={20} color={c} /> },
  { label: 'Calendar', href: '/(app)/calendar', tone: 'champagne', icon: (c) => <CalendarIcon size={20} color={c} /> },
];

/** Height the home scroll view must leave free above the safe-area inset. */
export const HOME_BOTTOM_NAV_HEIGHT = 84;

type HomeBottomNavProps = {
  /** Content to blur on Android (must be wrapped in a BlurTargetView). iOS blurs automatically. */
  blurTarget?: RefObject<ComponentRef<typeof View> | null>;
};

export function HomeBottomNav({ blurTarget }: HomeBottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      {/* Shadow lives on this outer layer; the inner one clips the blur to the rounded shape. */}
      <View style={styles.shadow}>
        <View style={styles.glass} accessibilityRole="tablist">
          <BlurView
            intensity={20}
            tint="systemUltraThinMaterialLight"
            blurTarget={blurTarget}
            blurMethod="dimezisBlurViewSdk31Plus"
            style={StyleSheet.absoluteFill}
          />
          {/* Faint pearl tint so the glass picks up HALO's lilac rather than reading grey. */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.16)', 'rgba(233, 224, 250, 0.10)', 'rgba(220, 234, 250, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.sheen} pointerEvents="none" />

          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.label}`}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            >
              <View style={[styles.iconChip, { backgroundColor: dashboardTheme.toneChip[item.tone] }]}>
                {item.icon(dashboardTheme.toneInk[item.tone])}
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const RADIUS = 28;

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 16, right: 16 },
  shadow: {
    borderRadius: RADIUS,
    shadowColor: '#78689E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
  glass: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: RADIUS,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  item: { flex: 1, alignItems: 'center', gap: 5 },
  itemPressed: { transform: [{ scale: 0.94 }], opacity: 0.8 },
  iconChip: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '600', color: dashboardTheme.text, letterSpacing: 0.1 },
});
