import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize } from '@/shared/theme/tokens';

type Props = {
  size?: 'small' | 'medium' | 'large';
  lightMode?: boolean;
};

export function HaloLogo({ size = 'medium', lightMode = false }: Props) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const textColor = lightMode ? colors.textWarm : colors.luminousWhite;
  const haloColor = lightMode ? colors.charcoal : colors.lavender;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.haloRing,
          isLarge && styles.haloRingLarge,
          isSmall && styles.haloRingSmall,
          { borderColor: haloColor },
        ]}
      />
      <Text
        style={[
          styles.text,
          isLarge && styles.textLarge,
          isSmall && styles.textSmall,
          { color: textColor },
        ]}
      >
        HALO
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  haloRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    opacity: 0.85,
  },
  haloRingLarge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  haloRingSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
  },
  text: {
    fontSize: fontSize.body,
    fontWeight: '700',
    letterSpacing: 6,
  },
  textLarge: {
    fontSize: fontSize.heading,
    letterSpacing: 8,
  },
  textSmall: {
    fontSize: fontSize.small,
    letterSpacing: 4,
  },
});
