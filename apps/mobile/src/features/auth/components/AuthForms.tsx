/**
 * AuthForms — Modular form content views for Login and Register.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AuthButton,
  AuthInput,
  authTheme,
  HairlineDivider,
  SocialButtons,
} from './AuthComponents';
import { Banner } from '@/shared/ui/Banner';

interface LoginFormViewProps {
  form: {
    values: { email: string; password: string };
    errors: { email?: string; password?: string };
    formError: string | null;
    loading: boolean;
    setField: (field: 'email' | 'password') => (text: string) => void;
    submit: () => void;
  };
  onSwitchToRegister: () => void;
}

export function LoginFormView({ form, onSwitchToRegister }: LoginFormViewProps) {
  return (
    <View style={styles.formContainer}>
      {form.formError ? <Banner tone="error" message={form.formError} /> : null}

      <View style={styles.form}>
        <AuthInput
          iconType="mail"
          placeholder="Email Address"
          value={form.values.email}
          onChangeText={form.setField('email')}
          error={form.errors.email}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          blurOnSubmit={false}
        />

        <AuthInput
          iconType="lock"
          placeholder="Password"
          value={form.values.password}
          onChangeText={form.setField('password')}
          error={form.errors.password}
          isPassword
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={form.submit}
        />

        <Pressable style={styles.forgotRow} hitSlop={{ top: 8, bottom: 8 }}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        <AuthButton label="Log In" onPress={form.submit} loading={form.loading} />
      </View>

      <HairlineDivider />
      <SocialButtons />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Pressable onPress={onSwitchToRegister} hitSlop={{ top: 8, bottom: 8 }}>
          <Text style={styles.footerLink}>Register</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface RegisterFormViewProps {
  form: {
    values: { displayName: string; email: string; password: string };
    errors: { displayName?: string; email?: string; password?: string };
    formError: string | null;
    loading: boolean;
    setField: (field: 'displayName' | 'email' | 'password') => (text: string) => void;
  };
  confirmPassword: string;
  confirmError: string;
  onConfirmPasswordChange: (text: string) => void;
  onSubmit: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterFormView({
  form,
  confirmPassword,
  confirmError,
  onConfirmPasswordChange,
  onSubmit,
  onSwitchToLogin,
}: RegisterFormViewProps) {
  return (
    <View style={styles.formContainer}>
      {form.formError ? <Banner tone="error" message={form.formError} /> : null}

      <View style={styles.form}>
        <AuthInput
          iconType="user"
          placeholder="Full Name"
          value={form.values.displayName}
          onChangeText={form.setField('displayName')}
          error={form.errors.displayName}
          autoComplete="name"
          returnKeyType="next"
          blurOnSubmit={false}
        />

        <AuthInput
          iconType="mail"
          placeholder="Email Address"
          value={form.values.email}
          onChangeText={form.setField('email')}
          error={form.errors.email}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          blurOnSubmit={false}
        />

        <AuthInput
          iconType="lock"
          placeholder="Password"
          value={form.values.password}
          onChangeText={form.setField('password')}
          error={form.errors.password}
          isPassword
          autoComplete="new-password"
          returnKeyType="next"
          blurOnSubmit={false}
        />

        <AuthInput
          iconType="lock"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          error={confirmError}
          isPassword
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />

        <AuthButton label="Create Account" onPress={onSubmit} loading={form.loading} />
      </View>

      <HairlineDivider />
      <SocialButtons />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Pressable onPress={onSwitchToLogin} hitSlop={{ top: 8, bottom: 8 }}>
          <Text style={styles.footerLink}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: { gap: 16 },
  form: { gap: 12 },
  forgotRow: { alignItems: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: 13, color: authTheme.textMain, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 4 },
  footerText: { fontSize: 13, color: authTheme.textMuted },
  footerLink: { fontSize: 13, fontWeight: '700', color: authTheme.textMain },
});
