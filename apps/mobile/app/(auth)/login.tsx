import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';
import { TextField } from '@/shared/ui/TextField';
import { colors, fontSize, spacing } from '@/shared/theme/tokens';

export default function LoginScreen() {
  const { values, errors, formError, loading, setField, submit } = useLoginForm();

  return (
    <Screen>
      <Text style={styles.brand}>HALO</Text>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to your wardrobe and avatar.</Text>

      {formError ? <Banner tone="error" message={formError} /> : null}

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
        autoComplete="password"
        placeholder="Your password"
      />

      <Button label="Log in" onPress={submit} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to HALO? </Text>
        <Link href="/register" style={styles.link}>
          Create an account
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { fontSize: fontSize.small, letterSpacing: 6, color: colors.accent, fontWeight: '700' },
  title: { fontSize: fontSize.display, fontWeight: '300', color: colors.text },
  subtitle: { fontSize: fontSize.body, color: colors.textMuted, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  footerText: { color: colors.textMuted },
  link: { color: colors.accent, fontWeight: '600' },
});
