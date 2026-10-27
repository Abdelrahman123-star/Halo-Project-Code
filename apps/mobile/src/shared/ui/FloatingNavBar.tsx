import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';

export type NavTab = 'home' | 'wardrobe' | 'avatar' | 'profile';

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
          accessibilityLabel="Home — Apartment entrance"
        >
          <View style={[styles.tabIconCircle, currentTab === 'home' && styles.tabActiveRing]}>
            <View style={[styles.doorIconTop, currentTab === 'home' && styles.iconActive]} />
          </View>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.labelActive]}>Home</Text>
        </Pressable>

        {/* Tab 2: Wardrobe */}
        <Pressable
          onPress={() => onSelectTab('wardrobe')}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === 'wardrobe' }}
          accessibilityLabel="Wardrobe — Digital closet"
        >
          <View style={[styles.tabIconCircle, currentTab === 'wardrobe' && styles.tabActiveRing]}>
            <View style={[styles.wardrobeIcon, currentTab === 'wardrobe' && styles.iconActive]} />
          </View>
          <Text style={[styles.tabLabel, currentTab === 'wardrobe' && styles.labelActive]}>Wardrobe</Text>
        </Pressable>

        {/* Tab 3: Avatar */}
        <Pressable
          onPress={() => onSelectTab('avatar')}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === 'avatar' }}
          accessibilityLabel="Avatar — Customize digital twin"
        >
          <View style={[styles.tabIconCircle, currentTab === 'avatar' && styles.tabActiveRing]}>
            <View style={[styles.avatarIcon, currentTab === 'avatar' && styles.iconActive]} />
          </View>
          <Text style={[styles.tabLabel, currentTab === 'avatar' && styles.labelActive]}>Avatar</Text>
        </Pressable>

        {/* Tab 4: Profile */}
        <Pressable
          onPress={() => onSelectTab('profile')}
          style={styles.tabButton}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === 'profile' }}
          accessibilityLabel="Profile — Account and settings"
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
    maxWidth: 440,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(23, 27, 39, 0.88)',
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
    paddingHorizontal: 12,
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
  doorIconTop: {
    width: 12,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  wardrobeIcon: {
    width: 14,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  avatarIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
