import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';

type Props = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export function TextField({
  label,
  error,
  isPassword = false,
  secureTextEntry,
  style,
  ...inputProps
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, Boolean(error) && styles.inputError]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          selectionColor={colors.lavender}
          cursorColor={colors.lavender}
          style={[styles.input, style]}
          secureTextEntry={isSecure}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.toggleBtn}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
    width: '100%',
  },
  label: {
    fontSize: fontSize.small,
    color: colors.silver,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  inputRow: {
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(201, 205, 212, 0.22)',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: fontSize.body,
    color: colors.luminousWhite,
    paddingVertical: 0,
  },
  toggleBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.xs,
  },
  toggleText: {
    fontSize: fontSize.small,
    color: colors.lavender,
    fontWeight: '600',
  },
  error: {
    fontSize: fontSize.small,
    color: colors.danger,
    marginTop: 2,
  },
});


