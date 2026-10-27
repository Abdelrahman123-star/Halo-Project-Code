import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { signOut } from '@/features/auth/api/authApi';
import { useSession } from '@/features/auth/hooks/useSession';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';
import { colors, fontSize, spacing } from '@/shared/theme/tokens';

/** Temporary smoke-test home: proves auth + an RLS-protected read of the user's own row. */
export default function HomeScreen() {
  const { session } = useSession();
  const userId = session?.user.id ?? '';
  const profile = useMyProfile(userId);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
    } catch {
      setSignOutError('Could not log out. Check your connection and try again.');
      setSigningOut(false);
    }
  }

  const name =
    profile.status === 'ready' && profile.profile?.display_name
      ? profile.profile.display_name
      : null;

  return (
    <Screen>
      <Text style={styles.brand}>HALO</Text>
      <Text style={styles.title}>{name ? `Welcome, ${name}` : 'Welcome'}</Text>
      <Text style={styles.subtitle}>{session?.user.email}</Text>

      {profile.status === 'loading' ? <Text style={styles.muted}>Loading profile…</Text> : null}
      {profile.status === 'error' ? (
        <Banner tone="error" message={`Could not load profile: ${profile.message}`} />
      ) : null}
      {profile.status === 'ready' && !profile.profile ? (
        <Banner
          tone="error"
          message="You are logged in, but no profile row was found. Run supabase/migrations/0001_profiles.sql in the Supabase SQL Editor (accounts created before the migration need a manual profile row)."
        />
      ) : null}
      {profile.status === 'ready' && profile.profile ? (
        <Banner tone="success" message="Connected: your profile was read from Supabase through RLS." />
      ) : null}
      {signOutError ? <Banner tone="error" message={signOutError} /> : null}

      <Button label="Log out" variant="ghost" onPress={handleSignOut} loading={signingOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { fontSize: fontSize.small, letterSpacing: 6, color: colors.accent, fontWeight: '700' },
  title: { fontSize: fontSize.display, fontWeight: '300', color: colors.text },
  subtitle: { fontSize: fontSize.body, color: colors.textMuted, marginBottom: spacing.sm },
  muted: { color: colors.textMuted },
});
