/** Secondary frosted pill button (pairs with the pearl AuthButton). */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';

type SoftButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  compact?: boolean;
};

export function SoftButton({ label, onPress, icon, compact = false }: SoftButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, compact && styles.compact, pressed && styles.pressed]}
    >
      {icon}
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  compact: { height: 32, borderRadius: 12, paddingHorizontal: 10 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  label: { fontSize: 15, fontWeight: '700', color: dashboardTheme.text, letterSpacing: 0.3 },
  labelCompact: { fontSize: 12 },
});
