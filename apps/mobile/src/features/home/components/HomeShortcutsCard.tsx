/**
 * Frosted card under the house: wardrobe shortcut for capturing clothes.
 * The circular avatar placeholder has been removed in favor of the full-body
 * avatar standing in front of the HALO house.
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthCard, authTheme } from '@/features/auth/components/AuthComponents';
import { ChevronRightIcon, HangerIcon } from './HomeIcons';

type ShortcutRowProps = {
  leading: ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  accessibilityLabel: string;
};

function ShortcutRow({ leading, title, subtitle, onPress, accessibilityLabel }: ShortcutRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {leading}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

type HomeShortcutsCardProps = {
  onOpenWardrobe: () => void;
  onCreateAvatar?: () => void;
};

export function HomeShortcutsCard({ onOpenWardrobe }: HomeShortcutsCardProps) {
  return (
    <AuthCard style={styles.card}>
      <ShortcutRow
        leading={
          <View style={styles.iconCircle}>
            <HangerIcon />
          </View>
        }
        title="Add to your wardrobe"
        subtitle="Capture clothes for your digital closet"
        onPress={onOpenWardrobe}
        accessibilityLabel="Add to your wardrobe"
      />
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  // AuthCard carries its own horizontal margin for the auth screens; the home
  // scroll view already pads its content.
  card: { marginHorizontal: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowPressed: { opacity: 0.7 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: authTheme.textMain },
  rowSubtitle: { marginTop: 3, fontSize: 13, lineHeight: 18, color: authTheme.textMuted },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.socialBtnBg,
    borderWidth: 1.2,
    borderColor: authTheme.socialBtnBorder,
  },
});
