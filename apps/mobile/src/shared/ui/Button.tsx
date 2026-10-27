import { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'luminous';
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: Props) {
  const inactive = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }

  const isLuminous = variant === 'luminous';
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={inactive}
        style={[
          styles.base,
          isPrimary && styles.primary,
          isLuminous && styles.luminous,
          isSecondary && styles.secondary,
          isGhost && styles.ghost,
          inactive && styles.inactive,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={
              isLuminous
                ? colors.textWarm
                : isPrimary
                  ? colors.luminousWhite
                  : colors.lavender
            }
          />
        ) : (
          <Text
            style={[
              styles.label,
              isLuminous && styles.labelLuminous,
              isSecondary && styles.labelSecondary,
              isGhost && styles.labelGhost,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.border,
  },
  luminous: {
    backgroundColor: colors.luminousWhite,
    borderWidth: 1.5,
    borderColor: colors.haloRing,
    shadowColor: colors.luminousWhite,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  inactive: {
    opacity: 0.45,
  },
  label: {
    color: colors.luminousWhite,
    fontSize: fontSize.body,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelLuminous: {
    color: colors.charcoal,
    fontWeight: '700',
  },
  labelSecondary: {
    color: colors.luminousWhite,
  },
  labelGhost: {
    color: colors.lavender,
  },
});

