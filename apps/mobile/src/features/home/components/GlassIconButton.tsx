/** Small round frosted button, styled like the auth social buttons. */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { authTheme } from '@/features/auth/components/AuthComponents';

type GlassIconButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassIconButton({ onPress, accessibilityLabel, children, style }: GlassIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.socialBtnBg,
    borderWidth: 1.2,
    borderColor: authTheme.socialBtnBorder,
    shadowColor: '#8C7CAE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 2,
  },
  pressed: { transform: [{ scale: 0.95 }] },
});
