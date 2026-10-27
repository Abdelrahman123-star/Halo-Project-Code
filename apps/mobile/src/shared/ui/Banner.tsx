import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';

type Props = { tone: 'error' | 'success'; message: string };

export function Banner({ tone, message }: Props) {
  const isError = tone === 'error';
  return (
    <View
      accessibilityRole="alert"
      style={[styles.box, { borderColor: isError ? colors.danger : colors.success }]}
    >
      <Text style={[styles.text, { color: isError ? colors.danger : colors.success }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  text: { fontSize: fontSize.small, lineHeight: 19 },
});
