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
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { Banner } from '@/shared/ui/Banner';

export default function LoginScreen() {
  const router = useRouter();
  const { values, errors, formError, loading, setField, submit } = useLoginForm();

  return (
    <View style={styles.root}>
      {/* Full-screen pastel blob background */}
      <PastelBackground />

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
            {/* HALO logo above the card */}
            <View style={styles.logoArea}>
              <Image
                source={require('../../assets/halo-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Floating white authentication card */}
            <AuthCard>
              {/* Tab switcher — Log In is active */}
              <AuthTabBar
                activeTab="login"
                onTabChange={(tab) => {
                  if (tab === 'register') router.replace('/(auth)/register');
                }}
              />

              {/* Form-level error */}
              {formError ? <Banner tone="error" message={formError} /> : null}

              {/* Login inputs */}
              <View style={styles.form}>
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
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={submit}
                />

                {/* Forgot password — right-aligned, no extra navigation yet */}
                <Pressable style={styles.forgotRow} hitSlop={{ top: 8, bottom: 8 }}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>

                <AuthButton label="Log In" onPress={submit} loading={loading} />
              </View>

              <HairlineDivider />
              <SocialButtons />

              {/* Switch to Register */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Link href="/(auth)/register" style={styles.footerLink}>Register</Link>
              </View>
            </AuthCard>

            {/* Bottom breathing room */}
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
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: authTheme.textMain,
    fontWeight: '600',
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
});
