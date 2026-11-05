import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';

export type NavTab = 'home' | 'profile';

type Props = {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
};

export function FloatingNavBar({ currentTab, onSelectTab }: Props) {
  return (
    <View style={styles.dockWrapper}>
      <View style={styles.dockContainer}>
        {/* Tab 1: Home */}
        <Pressable
          onPress={() => onSelectTab('home')}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === 'home' }}
          accessibilityLabel="Home"
        >
          <View style={[styles.tabIconCircle, currentTab === 'home' && styles.tabActiveRing]}>
            <View style={[styles.homeIcon, currentTab === 'home' && styles.iconActive]} />
          </View>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.labelActive]}>Home</Text>
        </Pressable>

        {/* Tab 2: Profile */}
        <Pressable
          onPress={() => onSelectTab('profile')}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === 'profile' }}
          accessibilityLabel="Profile"
        >
          <View style={[styles.tabIconCircle, currentTab === 'profile' && styles.tabActiveRing]}>
            <View style={[styles.profileIcon, currentTab === 'profile' && styles.iconActive]} />
          </View>
          <Text style={[styles.tabLabel, currentTab === 'profile' && styles.labelActive]}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  dockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 280,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(23, 27, 39, 0.92)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(201, 205, 212, 0.22)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 20,
    gap: 4,
  },
  tabIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActiveRing: {
    backgroundColor: 'rgba(184, 174, 216, 0.18)',
    borderWidth: 1,
    borderColor: colors.lavender,
  },
  tabLabel: {
    fontSize: fontSize.micro,
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.luminousWhite,
    fontWeight: '600',
  },
  homeIcon: {
    width: 12,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  profileIcon: {
    width: 13,
    height: 13,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  iconActive: {
    borderColor: colors.lavender,
  },
});
