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
import { FloatingNavBar, type NavTab } from '@/shared/ui/FloatingNavBar';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user.id ?? '';
  const profileState = useMyProfile(userId);

  const [signingOut, setSigningOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const meta = session?.user?.user_metadata;
  const username =
    profileState.status === 'ready' && profileState.profile?.display_name
      ? profileState.profile.display_name
      : (meta?.full_name as string) || (meta?.display_name as string) || session?.user?.email?.split('@')[0] || 'User';

  const userEmail = session?.user?.email ?? '';

  async function handleSignOut() {
    setSigningOut(true);
    setErrorMsg(null);
    try {
      await signOut();
    } catch {
      setErrorMsg('Failed to log out. Please check your network and try again.');
      setSigningOut(false);
    }
  }

  function handleSelectTab(tab: NavTab) {
    if (tab === 'profile') router.push('/(app)/profile');
  }

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
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <HaloMark />
              <Text style={styles.brandTitle}>HALO</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(app)/profile')}
              style={styles.profileBtn}
              accessibilityRole="button"
              accessibilityLabel="Go to Profile"
            >
              <Text style={styles.profileInitial}>{username.charAt(0).toUpperCase()}</Text>
            </Pressable>
          </View>

          {errorMsg ? <Banner tone="error" message={errorMsg} /> : null}

          {/* Welcome Hero Card */}
          <View style={styles.welcomeCard}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Demo Session Active</Text>
            </View>

            <Text style={styles.welcomeTitle}>Welcome, {username}!</Text>
            <Text style={styles.welcomeSubtitle}>
              You have successfully logged into the HALO mobile application.
            </Text>

            {/* User Info Capsule */}
            <View style={styles.infoCapsule}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{userEmail}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Display Name</Text>
                <Text style={styles.infoValue}>{username}</Text>
              </View>
            </View>
          </View>

          {/* Test Garment AI Page Shortcut */}
          <Pressable
            onPress={() => router.push('/(app)/test-garment')}
            style={styles.actionCard}
            accessibilityRole="button"
            accessibilityLabel="Go to Garment Recognition Test"
          >
            <View style={styles.actionCardLeft}>
              <View style={styles.iconCircle}>
                <Text style={styles.actionIconText}>🧥</Text>
              </View>
              <View>
                <Text style={styles.actionCardTitle}>Garment Recognition Test</Text>
                <Text style={styles.actionCardDesc}>Test camera & gallery AI garment analysis</Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>

          {/* Profile Shortcut Card */}
          <Pressable
            onPress={() => router.push('/(app)/profile')}
            style={styles.actionCard}
            accessibilityRole="button"
          >
            <View style={styles.actionCardLeft}>
              <View style={styles.iconCircle}>
                <Text style={styles.actionIconText}>👤</Text>
              </View>
              <View>
                <Text style={styles.actionCardTitle}>My Profile</Text>
                <Text style={styles.actionCardDesc}>Account details, privacy & security settings</Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>

          {/* Logout Action */}
          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            style={styles.logoutBtn}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <LinearGradient
              colors={authTheme.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutGradient}
            >
              {signingOut ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.logoutBtnText}>Log out</Text>
              )}
            </LinearGradient>
          </Pressable>
        </ScrollView>

        <FloatingNavBar currentTab="home" onSelectTab={handleSelectTab} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110, gap: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 2, color: authTheme.textMain },
  profileBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: authTheme.inputBg, borderWidth: 1.5, borderColor: authTheme.inputBorder, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 15, fontWeight: '700', color: authTheme.textMain },
  welcomeCard: {
    backgroundColor: authTheme.inputBg,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: authTheme.inputBorder,
    alignItems: 'center',
    marginTop: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 168, 83, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 14,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34A853' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#1e7b34', letterSpacing: 0.3 },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: authTheme.textMain,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: authTheme.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 280,
  },
  infoCapsule: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 12, fontWeight: '600', color: authTheme.textMuted },
  infoValue: { fontSize: 12, fontWeight: '700', color: authTheme.textMain, maxWidth: '65%' },
  divider: { height: 1, backgroundColor: 'rgba(42, 11, 63, 0.08)', marginVertical: 4 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: authTheme.inputBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: authTheme.inputBorder,
  },
  actionCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: { fontSize: 18 },
  actionCardTitle: { fontSize: 15, fontWeight: '700', color: authTheme.textMain },
  actionCardDesc: { fontSize: 11, color: authTheme.textMuted, marginTop: 2 },
  actionArrow: { fontSize: 22, color: authTheme.textMain, opacity: 0.5, paddingHorizontal: 8 },
  logoutBtn: { width: '100%', marginTop: 8 },
  logoutGradient: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  logoutBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
});
