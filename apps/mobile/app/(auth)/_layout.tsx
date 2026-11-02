/**
 * (auth) layout — wraps all auth routes (welcome, login, register).
 *
 * Adds the AuthTransitionContext provider so the welcome screen can trigger
 * the hero logo transition, and mounts the AuthTransitionOverlay on top of
 * the Stack navigator so it renders above every auth route.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import {
  AuthTransitionContext,
  type AuthDest,
} from '@/features/auth/hooks/useAuthTransition';
import { AuthTransitionOverlay } from '@/features/auth/components/AuthTransitionOverlay';

export default function AuthLayout() {
  const [active, setActive]           = useState(false);
  const [destination, setDestination] = useState<AuthDest | null>(null);

  function triggerTransition(dest: AuthDest) {
    setDestination(dest);
    setActive(true);
  }

  function clear() {
    setActive(false);
    setDestination(null);
  }

  return (
    <AuthTransitionContext.Provider
      value={{ triggerTransition, active, destination, clear }}
    >
      <View style={styles.root}>
        {/* Auth route stack — welcome / login / register */}
        <Stack screenOptions={{ headerShown: false }} />

        {/* Hero transition overlay — renders above the Stack when active */}
        <AuthTransitionOverlay />
      </View>
    </AuthTransitionContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
