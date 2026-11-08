/**
 * Frosted-glass 5-button bottom navigation anchored across the HALO app:
 * Wellness, Reminders, Home (center elevated halo button), Weather, Calendar.
 * Uses real blur (expo-blur) with liquid-glass pearl sheen matching auth glass.
 */
import type { ComponentRef, ReactNode, RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BellIcon, CalendarIcon, CloudSunIcon, HomeIcon, SparkleIcon } from '../dashboard/DashboardIcons';
import { dashboardTheme, type Tone } from '../dashboard/dashboardTheme';

type NavItem = {
  key: string;
  label: string;
  href: Href;
  tone: Tone;
  isCenter?: boolean;
  icon: (color: string) => ReactNode;
};

const NAV_ITEMS: readonly NavItem[] = [
  { key: 'wellness', label: 'Wellness', href: '/(app)/wellness', tone: 'lilac', icon: (c) => <SparkleIcon size={19} color={c} /> },
  { key: 'reminders', label: 'Reminders', href: '/(app)/reminders', tone: 'blush', icon: (c) => <BellIcon size={19} color={c} /> },
  { key: 'home', label: 'Home', href: '/(app)', tone: 'lilac', isCenter: true, icon: (c) => <HomeIcon size={21} color={c} /> },
  { key: 'weather', label: 'Weather', href: '/(app)/weather', tone: 'blue', icon: (c) => <CloudSunIcon size={19} color={c} /> },
  { key: 'calendar', label: 'Calendar', href: '/(app)/calendar', tone: 'champagne', icon: (c) => <CalendarIcon size={19} color={c} /> },
];

/**
 * Routes that hide the bar:
 * - house-entrance / hallway: full-screen scenes (video, door hotspots laid over a cover image)
 *   that need the whole screen and have their own controls;
 * - create-avatar: a guarded flow — the bar would skip its "discard photos?" confirmation
 *   and could leave mid-upload.
 */
const HIDDEN_ON_ROUTES = ['house-entrance', 'hallway', 'create-avatar'] as const;

export function shouldShowBottomNav(pathname: string | null | undefined): boolean {
  return !HIDDEN_ON_ROUTES.some((route) => pathname?.includes(route));
}

type HomeBottomNavProps = {
  /** Optional backwards-compatibility ref. */
  blurTarget?: RefObject<ComponentRef<typeof View> | null>;
};

/**
 * Rendered by app/(app)/_layout.tsx *below* the screen stack (in normal layout flow, not
 * floating over it), so it can never cover a screen's content or buttons. It owns the
 * bottom safe-area inset; screens should not add their own bottom inset.
 */
export function HomeBottomNav({ blurTarget: _blurTarget }: HomeBottomNavProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (!shouldShowBottomNav(pathname)) {
    return null;
  }

  function isItemActive(item: NavItem): boolean {
    if (item.isCenter) {
      return pathname === '/' || pathname === '/(app)' || pathname === '/(app)/index' || pathname === '';
    }
    return Boolean(pathname?.includes(item.key));
  }

  function handlePress(item: NavItem) {
    if (isItemActive(item)) return;
    router.navigate(item.href);
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.shadow}>
        <View style={styles.glass} accessibilityRole="tablist">
          {/* Frosted liquid-glass surface: hardware-accelerated, zero GPU blur stall */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.94)', 'rgba(248, 245, 255, 0.90)', 'rgba(240, 246, 255, 0.88)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.sheen} pointerEvents="none" />

          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);

            if (item.isCenter) {
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handlePress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${item.label}`}
                  style={({ pressed }) => [styles.item, styles.centerItem, pressed && styles.itemPressed]}
                >
                  <LinearGradient
                    colors={active ? ['#8E7BEF', '#7864E8'] : ['#FFFFFF', '#EFEAFD']}
                    style={[styles.centerChip, active && styles.centerChipActive]}
                  >
                    {item.icon(active ? '#FFFFFF' : '#7864E8')}
                  </LinearGradient>
                  <Text style={[styles.label, active ? styles.activeLabel : styles.centerLabel]}>{item.label}</Text>
                </Pressable>
              );
            }

            const iconColor = active ? dashboardTheme.toneInk[item.tone] : '#76648E';
            const chipBg = active ? dashboardTheme.toneChip[item.tone] : 'rgba(245, 240, 255, 0.55)';

            return (
              <Pressable
                key={item.key}
                onPress={() => handlePress(item)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.label}`}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              >
                <View style={[styles.iconChip, { backgroundColor: chipBg }, active && styles.iconChipActive]}>
                  {item.icon(iconColor)}
                </View>
                <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export const AppBottomNav = HomeBottomNav;

const RADIUS = 28;

const styles = StyleSheet.create({
  // Same pastel as the app screens, so the strip reads as part of the page.
  wrapper: { paddingHorizontal: 14, paddingTop: 8, backgroundColor: '#EEF2FB' },
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
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: RADIUS,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.78)',
    overflow: 'hidden',
  },
  sheen: { position: 'absolute', top: 0, left: 20, right: 20, height: 1.2, backgroundColor: 'rgba(255, 255, 255, 0.95)' },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  centerItem: { marginTop: -2 },
  itemPressed: { transform: [{ scale: 0.93 }], opacity: 0.8 },
  iconChip: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.65)' },
  iconChipActive: { borderColor: 'rgba(139, 123, 239, 0.45)', shadowColor: '#8E7BEF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 2 },
  centerChip: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.95)', shadowColor: '#8E7BEF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 4 },
  centerChipActive: { shadowOpacity: 0.38, shadowRadius: 10, elevation: 6 },
  label: { fontSize: 10.5, fontWeight: '600', color: '#76648E', letterSpacing: 0.1 },
  activeLabel: { fontWeight: '700', color: '#34264C' },
  centerLabel: { color: '#6B5299', fontWeight: '700' },
});
