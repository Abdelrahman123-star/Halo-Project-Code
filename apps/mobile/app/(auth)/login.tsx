/**
 * LoginScreen — Redesigned HALO Sign In Screen with Smooth Sliding Indicator.
 */
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthCard, AuthTabBar } from '@/features/auth/components/AuthComponents';
import { AuthSlideContainer } from '@/features/auth/components/AuthSlideContainer';
import { LoginFormView, RegisterFormView } from '@/features/auth/components/AuthForms';
import { AuthSuccessView } from '@/features/auth/components/AuthSuccessView';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const loginForm = useLoginForm();
  const registerForm = useRegisterForm();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError]       = useState('');

  const logoFade = useRef(new Animated.Value(0)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoFade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(cardFade, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [cardFade, logoFade]);

  function handleRegisterSubmit() {
    if (registerForm.values.password && confirmPassword !== registerForm.values.password) {
      setConfirmError('Passwords do not match');
      return;
    }
    setConfirmError('');
    registerForm.submit();
  }

  if (registerForm.confirmationSent) {
    return <AuthSuccessView onContinue={() => setMode('login')} />;
  }

  return (
    <View style={styles.root}>
      {/* Dynamic pearlescent liquid blob background */}
      <PastelBlobBackground />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={false}
          >
            {/* Shimmering script HALO brand logo */}
            <Animated.View
              style={[
                styles.logoArea,
                {
                  opacity: logoFade,
                  transform: [
                    { scale: logoFade.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                  ],
                },
              ]}
            >
              <Image
                source={require('../../assets/halo-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
                accessibilityLabel="HALO Logo"
              />
            </Animated.View>

            {/* Frosted Glass Card with Shared Toggle Container */}
            <Animated.View
              style={{
                opacity: cardFade,
                transform: [
                  { translateY: cardFade.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
                ],
              }}
            >
              <AuthCard>
                {/* ── Shared Toggle with Smooth Animated Sliding Indicator ── */}
                <AuthTabBar activeTab={mode} onTabChange={(tab) => setMode(tab)} />

                {/* ── Smooth Form Sliding Transition ── */}
                <AuthSlideContainer
                  mode={mode}
                  renderLogin={() => (
                    <LoginFormView form={loginForm} onSwitchToRegister={() => setMode('register')} />
                  )}
                  renderRegister={() => (
                    <RegisterFormView
                      form={registerForm}
                      confirmPassword={confirmPassword}
                      confirmError={confirmError}
                      onConfirmPasswordChange={(text) => {
                        setConfirmPassword(text);
                        if (confirmError) setConfirmError('');
                      }}
                      onSubmit={handleRegisterSubmit}
                      onSwitchToLogin={() => setMode('login')}
                    />
                  )}
                />
              </AuthCard>
            </Animated.View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
  logoArea: { alignItems: 'center', marginBottom: 20 },
  logoImage: { width: 175, height: 95 },
  bottomSpacer: { height: 24 },
});
