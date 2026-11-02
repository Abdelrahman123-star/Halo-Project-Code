import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  AuthButton,
  AuthCard,
  AuthInput,
  AuthTabBar,
  authTheme,
  HairlineDivider,
  SocialButtons,
} from '@/features/auth/components/AuthComponents';
import { PastelBackground } from '@/features/auth/components/PastelBackground';
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import { Banner } from '@/shared/ui/Banner';

export default function RegisterScreen() {
  const router = useRouter();
  const { values, errors, formError, confirmationSent, loading, setField, submit } =
    useRegisterForm();

  // Confirm-password is managed locally — the hook validates the rest.
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError]       = useState('');

  function handleSubmit() {
    if (values.password && confirmPassword !== values.password) {
      setConfirmError('Passwords do not match');
      return;
    }
    setConfirmError('');
    submit();
  }

  // ─── "You're all set!" success screen ────────────────────────────────────────
  if (confirmationSent) {
    return (
      <View style={styles.root}>
        <PastelBackground />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContent}>
            {/* Logo */}
            <Image
              source={require('../../assets/halo-logo.png')}
              style={styles.successLogo}
              resizeMode="contain"
            />

            {/* Teal check circle */}
            <View style={styles.checkCircle}>
              <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 6L9 17l-5-5"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            <Text style={styles.successTitle}>You're all set!</Text>
            <Text style={styles.successSubtitle}>
              Welcome to your personalized{'\n'}HALO experience.
            </Text>

            <View style={styles.successBtnWrapper}>
              <AuthButton
                label="Continue"
                onPress={() => router.replace('/(auth)/login')}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Registration form ────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <PastelBackground />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={false}
          >
            {/* HALO logo */}
            <View style={styles.logoArea}>
              <Image
                source={require('../../assets/halo-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <AuthCard>
              {/* Tab switcher — Register is active */}
              <AuthTabBar
                activeTab="register"
                onTabChange={(tab) => {
                  if (tab === 'login') router.replace('/(auth)/login');
                }}
              />

              {formError ? <Banner tone="error" message={formError} /> : null}

              {/* Registration inputs */}
              <View style={styles.form}>
                <AuthInput
                  iconType="user"
                  placeholder="Full Name"
                  value={values.displayName}
                  onChangeText={setField('displayName')}
                  error={errors.displayName}
                  autoComplete="name"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                <AuthInput
                  iconType="mail"
                  placeholder="Email Address"
                  value={values.email}
                  onChangeText={setField('email')}
                  error={errors.email}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                <AuthInput
                  iconType="lock"
                  placeholder="Password"
                  value={values.password}
                  onChangeText={setField('password')}
                  error={errors.password}
                  isPassword
                  autoComplete="new-password"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                <AuthInput
                  iconType="lock"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmError) setConfirmError('');
                  }}
                  error={confirmError}
                  isPassword
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                <AuthButton label="Create Account" onPress={handleSubmit} loading={loading} />
              </View>

              <HairlineDivider />
              <SocialButtons />

              {/* Switch to Login */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/(auth)/login" style={styles.footerLink}>Log In</Link>
              </View>
            </AuthCard>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F0FC',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 160,
    height: 80,
  },
  form: {
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: authTheme.textMuted,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: authTheme.textMain,
  },
  bottomSpacer: {
    height: 24,
  },

  // ── Success screen ──
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  successLogo: {
    width: 160,
    height: 80,
    marginBottom: 8,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6DCAAA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6DCAAA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: authTheme.textMain,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: 15,
    color: authTheme.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  successBtnWrapper: {
    width: '100%',
    marginTop: 8,
  },
});
