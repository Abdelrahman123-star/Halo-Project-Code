import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  AuthButton,
  AuthInput,
  authTheme,
  HairlineDivider,
  HaloMark,
  SocialButtons,
} from '@/features/auth/components/AuthComponents';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { Banner } from '@/shared/ui/Banner';

export default function LoginScreen() {
  const router = useRouter();
  const { values, errors, formError, loading, setField, submit } = useLoginForm();

  return (
    <LinearGradient
      colors={authTheme.bgGradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradientContainer}
    >
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
            {/* Header */}
            <View style={styles.authHeader}>
              <View style={styles.topNavRow}>
                <Pressable
                  onPress={() => router.replace('/(auth)/welcome')}
                  style={styles.backBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M15 18l-6-6 6-6"
                      stroke={authTheme.textMain}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Pressable>
                <HaloMark />
                <View style={styles.backBtnSpacer} />
              </View>
              <Text style={styles.authTitle}>Hello again.</Text>
              <Text style={styles.authSubtitle}>
                Your mirror remembered everything — just confirm it's you.
              </Text>
            </View>

            {formError ? <Banner tone="error" message={formError} /> : null}

            {/* Login Form */}
            <View style={styles.authForm}>
              <AuthInput
                iconType="mail"
                placeholder="Email address"
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

              <AuthButton label="Log in" onPress={submit} loading={loading} />
            </View>

            {/* Hairline Divider */}
            <HairlineDivider />

            {/* Social Auth */}
            <SocialButtons />

            {/* Footer */}
            <View style={styles.authFooter}>
              <Text style={styles.footerPrompt}>Don't have an account? </Text>
              <Link href="/(auth)/register" style={styles.footerLink}>
                Sign up
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
    justifyContent: 'space-between',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  authHeader: {
    alignItems: 'center',
  },
  topNavRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  backBtnSpacer: {
    width: 36,
  },
  authTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: authTheme.textMain,
    marginTop: 16,
    letterSpacing: -0.3,
  },
  authSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: authTheme.textMuted,
    textAlign: 'center',
    maxWidth: 250,
    marginTop: 8,
  },
  authForm: {
    gap: 12,
    marginTop: 8,
  },
  authFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  footerPrompt: {
    fontSize: 12,
    color: authTheme.textMuted,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: authTheme.textMain,
    textDecorationLine: 'underline',
  },
});
