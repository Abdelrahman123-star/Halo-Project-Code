import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from '@/features/auth/api/authApi';
import { useSession } from '@/features/auth/hooks/useSession';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { FloatingNavBar, type NavTab } from '@/shared/ui/FloatingNavBar';
import { HaloLogo } from '@/shared/ui/HaloLogo';
import { Screen } from '@/shared/ui/Screen';

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user.id ?? '';
  const profileState = useMyProfile(userId);

  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [privacyNotice, setPrivacyNotice] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
    } catch {
      setSignOutError('Could not sign out. Check your connection and try again.');
      setSigningOut(false);
    }
  }

  function handleSelectTab(tab: NavTab) {
    if (tab === 'home') router.push('/(app)');
    else if (tab === 'wardrobe') router.push('/(app)/wardrobe');
    else if (tab === 'avatar') router.push('/(app)/avatar');
  }

  const name =
    profileState.status === 'ready' && profileState.profile?.display_name
      ? profileState.profile.display_name
      : 'HALO Resident';

  return (
    <View style={styles.outer}>
      <Screen variant="midnight" contentStyle={styles.screenContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Account & Space</Text>
            <Text style={styles.subtitle}>Privacy, scan data, and preferences</Text>
          </View>
          <HaloLogo size="small" />
        </View>

        {signOutError ? <Banner tone="error" message={signOutError} /> : null}
        {privacyNotice ? <Banner tone="success" message={privacyNotice} /> : null}

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{session?.user.email}</Text>
          </View>
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Security & Privacy</Text>

          <Pressable
            onPress={() =>
              setPrivacyNotice(
                'Row Level Security is active: Your scans and wardrobe are isolated to your user ID.',
              )
            }
            style={styles.settingRow}
            accessibilityRole="button"
          >
            <Text style={styles.settingLabel}>Data ownership & RLS</Text>
            <Text style={styles.settingValue}>Protected ›</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setPrivacyNotice(
                'Scan images are stored in a private bucket with signed URL access only.',
              )
            }
            style={styles.settingRow}
            accessibilityRole="button"
          >
            <Text style={styles.settingLabel}>Scan image storage</Text>
            <Text style={styles.settingValue}>Private ›</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setPrivacyNotice(
                'Third-party cloud inference is disabled by default per HALO Privacy Rules.',
              )
            }
            style={styles.settingRow}
            accessibilityRole="button"
          >
            <Text style={styles.settingLabel}>AI model processing</Text>
            <Text style={styles.settingValue}>Local / Private ›</Text>
          </Pressable>
        </View>

        {/* Sign Out Button */}
        <Button
          label="Sign out of HALO"
          variant="ghost"
          onPress={handleSignOut}
          loading={signingOut}
          style={styles.signOutBtn}
        />
      </Screen>

      <FloatingNavBar currentTab="profile" onSelectTab={handleSelectTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  screenContent: {
    paddingBottom: 110,
    justifyContent: 'flex-start',
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '300',
    color: colors.luminousWhite,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: colors.silver,
    marginTop: 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.luminousWhite,
    fontSize: fontSize.heading,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: colors.luminousWhite,
    fontSize: fontSize.body + 1,
    fontWeight: '600',
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: fontSize.small,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    color: colors.silver,
    fontSize: fontSize.small,
    fontWeight: '600',
    marginBottom: spacing.xs,
    letterSpacing: 0.4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 205, 212, 0.08)',
  },
  settingLabel: {
    color: colors.luminousWhite,
    fontSize: fontSize.body,
  },
  settingValue: {
    color: colors.lavender,
    fontSize: fontSize.small,
  },
  signOutBtn: {
    marginTop: spacing.md,
  },
});
