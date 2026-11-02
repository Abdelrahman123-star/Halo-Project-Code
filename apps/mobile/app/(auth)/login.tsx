import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
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
              <HaloMark />
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
                secureTextEntry
                isPassword
                returnKeyType="done"
                onSubmitEditing={submit}
              />

              <AuthButton label="Log in" onPress={submit} loading={loading} />
            </View>

            {/* Hairline Divider */}
            <HairlineDivider />

            {/* Social Authentication */}
            <SocialButtons />

            {/* Footer */}
            <View style={styles.authFooter}>
              <Text style={styles.footerPrompt}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text style={styles.footerLink}>Sign up</Text>
                </Pressable>
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
    textAlign: 'center',
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
