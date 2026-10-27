import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';
import { TextField } from '@/shared/ui/TextField';
import { colors, fontSize, spacing } from '@/shared/theme/tokens';

export default function RegisterScreen() {
  const { values, errors, formError, confirmationSent, loading, setField, submit } =
    useRegisterForm();

  if (confirmationSent) {
    return (
      <Screen>
        <Text style={styles.title}>Check your email</Text>
        <Banner
          tone="success"
          message={`We sent a confirmation link to ${values.email.trim()}. Open it, then come back and log in.`}
        />
        <Link href="/login" style={styles.link}>
          Back to log in
        </Link>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.brand}>HALO</Text>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Your avatar and wardrobe stay private to you.</Text>

      {formError ? <Banner tone="error" message={formError} /> : null}

      <TextField
        label="Name"
        value={values.displayName}
        onChangeText={setField('displayName')}
        error={errors.displayName}
        autoComplete="name"
        placeholder="Your name"
      />
      <TextField
        label="Email"
        value={values.email}
        onChangeText={setField('email')}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <TextField
        label="Password"
        value={values.password}
        onChangeText={setField('password')}
        error={errors.password}
        secureTextEntry
        autoComplete="new-password"
        placeholder="At least 8 characters, letters and numbers"
      />
      <TextField
        label="Confirm password"
        value={values.confirmPassword}
        onChangeText={setField('confirmPassword')}
        error={errors.confirmPassword}
        secureTextEntry
        autoComplete="new-password"
        placeholder="Repeat password"
      />

      <Button label="Create account" onPress={submit} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/login" style={styles.link}>
          Log in
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { fontSize: fontSize.small, letterSpacing: 6, color: colors.accent, fontWeight: '700' },
  title: { fontSize: fontSize.title + 4, fontWeight: '300', color: colors.text },
  subtitle: { fontSize: fontSize.body, color: colors.textMuted, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  footerText: { color: colors.textMuted },
  link: { color: colors.accent, fontWeight: '600' },
});
