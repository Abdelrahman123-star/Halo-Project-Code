import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '@/features/auth/hooks/useSession';
import { AvatarPresenter } from '@/features/avatar/components/AvatarPresenter';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';
import { FloatingNavBar, type NavTab } from '@/shared/ui/FloatingNavBar';
import { HaloDoorScene } from '@/shared/ui/HaloDoorScene';
import { HaloLogo } from '@/shared/ui/HaloLogo';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user.id ?? '';
  const profileState = useMyProfile(userId);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  const displayName =
    profileState.status === 'ready' && profileState.profile?.display_name
      ? profileState.profile.display_name
      : null;

  // Time-based architectural greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  function handleSelectTab(tab: NavTab) {
    setCurrentTab(tab);
    if (tab === 'wardrobe') router.push('/(app)/wardrobe');
    else if (tab === 'avatar') router.push('/(app)/avatar');
    else if (tab === 'profile') router.push('/(app)/profile');
  }

  function handleOpenCreateAvatar() {
    router.push('/(app)/create-avatar');
  }

  return (
    <View style={styles.container}>
      {/* Signature 3D-feel Architectural Apartment Scene */}
      <HaloDoorScene activeLight>
        <View style={styles.screenOverlay}>
          {/* Top Minimal Architectural Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>
                {displayName ? `${greeting}, ${displayName}` : 'Welcome home.'}
              </Text>
              <Text style={styles.environmentStatus}>Apartment 2040 • Private space</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(app)/profile')}
              style={styles.profileOrb}
              accessibilityRole="button"
              accessibilityLabel="View profile and account"
            >
              <HaloLogo size="small" />
            </Pressable>
          </View>

          {/* Environmental Shortcuts — Architectural Inset Panels */}
          <View style={styles.environmentalWidgets}>
            <Pressable
              onPress={() => router.push('/(app)/wardrobe')}
              style={styles.widgetChip}
              accessibilityRole="button"
              accessibilityLabel="My Wardrobe"
            >
              <View style={styles.chipHaloDot} />
              <Text style={styles.widgetText}>My Wardrobe</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(app)/wardrobe')}
              style={styles.widgetChip}
              accessibilityRole="button"
              accessibilityLabel="Add clothing item"
            >
              <Text style={styles.widgetText}>+ Add clothing</Text>
            </Pressable>
          </View>

          {/* Central Apartment Door & Avatar with Pulsing '+' Invitation */}
          <View style={styles.centerStage}>
            <AvatarPresenter
              hasAvatar={false}
              avatarName={displayName}
              onPressCreate={handleOpenCreateAvatar}
              onPressCustomize={() => router.push('/(app)/avatar')}
            />
          </View>

          {/* Bottom Floating Navigation Dock */}
          <FloatingNavBar currentTab={currentTab} onSelectTab={handleSelectTab} />
        </View>
      </HaloDoorScene>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  screenOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl + 20,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    zIndex: 10,
  },
  greetingText: {
    color: colors.luminousWhite,
    fontSize: fontSize.heading,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  environmentStatus: {
    color: colors.silver,
    fontSize: fontSize.micro + 1,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  profileOrb: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  environmentalWidgets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 10,
    marginTop: spacing.sm,
  },
  widgetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(31, 36, 51, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 205, 212, 0.16)',
  },
  chipHaloDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lavender,
  },
  widgetText: {
    color: colors.luminousWhite,
    fontSize: fontSize.small,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

