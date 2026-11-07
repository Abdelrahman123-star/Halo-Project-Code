import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from '@/features/auth/api/authApi';
import { authTheme, HaloMark } from '@/features/auth/components/AuthComponents';
import { useSession } from '@/features/auth/hooks/useSession';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { Banner } from '@/shared/ui/Banner';

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

  const name =
    profileState.status === 'ready' && profileState.profile?.display_name
      ? profileState.profile.display_name
      : (session?.user?.user_metadata?.full_name as string | undefined) ||
        (session?.user?.user_metadata?.display_name as string | undefined) ||
        session?.user?.email?.split('@')[0] ||
        'HALO User';

  return (
    <LinearGradient
      colors={authTheme.bgGradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.push('/(app)')}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to Home"
            >
              <Text style={styles.backArrow}>←</Text>
            </Pressable>
            <Text style={styles.headerTitle}>My Profile</Text>
            <HaloMark />
          </View>

          {signOutError ? <Banner tone="error" message={signOutError} /> : null}
          {privacyNotice ? <Banner tone="success" message={privacyNotice} /> : null}

          {/* User Profile Card */}
          <View style={styles.userCard}>
            <View style={styles.avatarOrb}>
              <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
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
                setPrivacyNotice('Row Level Security is active: Your data is isolated to your user ID.')
              }
              style={styles.settingRow}
              accessibilityRole="button"
            >
              <Text style={styles.settingLabel}>Data ownership & RLS</Text>
              <Text style={styles.settingValue}>Protected ›</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setPrivacyNotice('User storage is isolated in private Supabase buckets.')
              }
              style={styles.settingRow}
              accessibilityRole="button"
            >
              <Text style={styles.settingLabel}>Private Storage</Text>
              <Text style={styles.settingValue}>Encrypted ›</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setPrivacyNotice('Cloud third-party inference is disabled by default.')
              }
              style={[styles.settingRow, styles.noBorder]}
              accessibilityRole="button"
            >
              <Text style={styles.settingLabel}>AI Model Processing</Text>
              <Text style={styles.settingValue}>Private ›</Text>
            </Pressable>
          </View>

          {/* Sign Out Button */}
          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            style={styles.signOutBtn}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={authTheme.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signOutGradient}
            >
              {signingOut ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.signOutBtnText}>Sign out of HALO</Text>
              )}
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: authTheme.inputBg, borderWidth: 1, borderColor: authTheme.inputBorder, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: '700', color: authTheme.textMain },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5, color: authTheme.textMain },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: authTheme.inputBg, borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: authTheme.inputBorder },
  avatarOrb: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(147, 51, 234, 0.15)', borderWidth: 2, borderColor: '#9333ea', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 22, fontWeight: '700', color: authTheme.textMain },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 17, fontWeight: '700', color: authTheme.textMain },
  userEmail: { fontSize: 12, color: authTheme.textMuted },
  sectionCard: { backgroundColor: authTheme.inputBg, borderRadius: 20, borderWidth: 1, borderColor: authTheme.inputBorder, padding: 18, gap: 6 },
  sectionHeader: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: authTheme.textMuted, marginBottom: 4, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(42, 11, 63, 0.08)' },
  noBorder: { borderBottomWidth: 0 },
  settingLabel: { fontSize: 13, fontWeight: '600', color: authTheme.textMain },
  settingValue: { fontSize: 13, fontWeight: '600', color: '#9333ea' },
  signOutBtn: { marginTop: 8 },
  signOutGradient: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  signOutBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
});
