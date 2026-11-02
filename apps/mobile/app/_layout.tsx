import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '@/features/auth/hooks/useSession';
import { isSupabaseConfigured } from '@/shared/lib/supabase';
import { Screen } from '@/shared/ui/Screen';
import { colors, fontSize, spacing } from '@/shared/theme/tokens';
import { LaunchScreen } from '@/features/launch/components/LaunchScreen';

function RootStack() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.lavender} />
      </View>
    );
  }

  // Stack.Protected removes the guarded routes entirely while the guard is false,
  // and automatically redirects using redirectTo when accessing an excluded route.
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.midnight } }}
    >
      <Stack.Protected guard={!session} redirectTo="/(app)">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session)} redirectTo="/(auth)/login">
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

function MissingConfig() {
  return (
    <Screen variant="midnight">
      <Text style={styles.title}>Setup needed</Text>
      <Text style={styles.body}>
        Supabase is not configured. Copy apps/mobile/.env.example to apps/mobile/.env, fill in
        EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart with
        `npx expo start -c`.
      </Text>
    </Screen>
  );
}

export default function RootLayout() {
  // Render ONLY the launch screen until the animation finishes, then
  // swap to the real navigator. This avoids all z-index / stacking-context
  // fights between the absolute-positioned launch screen and the navigator.
  const [showLaunch, setShowLaunch] = useState(true);

  if (showLaunch) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <LaunchScreen onFinished={() => setShowLaunch(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {isSupabaseConfigured ? (
        <SessionProvider>
          <RootStack />
        </SessionProvider>
      ) : (
        <MissingConfig />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  body: { fontSize: fontSize.body, color: colors.textMuted, lineHeight: 24, marginTop: spacing.sm },
});
