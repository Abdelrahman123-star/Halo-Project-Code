/**
 * AuthGenderSelector — High-polish binary gender selector for HALO registration.
 * Offers strictly Female and Male options with custom SVG icons and dreamy pastel styling.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { authTheme } from './AuthComponents';
import type { Gender } from '../schemas';

type AuthGenderSelectorProps = {
  value: Gender | '' | undefined;
  onChange: (gender: Gender) => void;
  error?: string;
};

function FemaleIcon({ color }: { color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={9} r={5.5} stroke={color} strokeWidth={2} />
      <Path d="M12 14.5V22M8.5 18.5h7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function MaleIcon({ color }: { color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Circle cx={9.5} cy={14.5} r={5.5} stroke={color} strokeWidth={2} />
      <Path d="M14 4h6v6M20 4l-6.5 6.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function AuthGenderSelector({ value, onChange, error }: AuthGenderSelectorProps) {
  const isFemale = value === 'female';
  const isMale = value === 'male';
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <View
        style={styles.buttonRow}
        accessibilityRole="radiogroup"
        accessibilityLabel="Gender Selection"
      >
        {/* Female Option */}
        <Pressable
          onPress={() => onChange('female')}
          style={[styles.pillTouch, hasError && !value && styles.pillErrorOutline]}
          accessibilityRole="radio"
          accessibilityLabel="Female"
          accessibilityState={{ selected: isFemale }}
          accessibilityHint="Select female gender"
        >
          {isFemale ? (
            <LinearGradient
              colors={authTheme.pearlBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.pill, styles.pillActive]}
            >
              <FemaleIcon color={authTheme.textMain} />
              <Text style={styles.pillLabelActive}>Female</Text>
            </LinearGradient>
          ) : (
            <View style={styles.pill}>
              <FemaleIcon color={authTheme.placeholder} />
              <Text style={styles.pillLabelInactive}>Female</Text>
            </View>
          )}
        </Pressable>

        {/* Male Option */}
        <Pressable
          onPress={() => onChange('male')}
          style={[styles.pillTouch, hasError && !value && styles.pillErrorOutline]}
          accessibilityRole="radio"
          accessibilityLabel="Male"
          accessibilityState={{ selected: isMale }}
          accessibilityHint="Select male gender"
        >
          {isMale ? (
            <LinearGradient
              colors={authTheme.pearlBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.pill, styles.pillActive]}
            >
              <MaleIcon color={authTheme.textMain} />
              <Text style={styles.pillLabelActive}>Male</Text>
            </LinearGradient>
          ) : (
            <View style={styles.pill}>
              <MaleIcon color={authTheme.placeholder} />
              <Text style={styles.pillLabelInactive}>Male</Text>
            </View>
          )}
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pillTouch: {
    flex: 1,
    borderRadius: 24,
  },
  pill: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: authTheme.inputBg,
    borderWidth: 1.5,
    borderColor: authTheme.inputBorder,
  },
  pillActive: {
    borderColor: authTheme.inputFocusBorder,
    shadowColor: '#8B7BEF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 2,
  },
  pillErrorOutline: {
    borderRadius: 24,
    borderColor: '#E57373',
    borderWidth: 1.5,
  },
  pillLabelActive: {
    fontSize: 14,
    fontWeight: '700',
    color: authTheme.textMain,
    letterSpacing: -0.2,
  },
  pillLabelInactive: {
    fontSize: 14,
    fontWeight: '600',
    color: authTheme.textMuted,
    letterSpacing: -0.2,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginLeft: 14,
    marginTop: 2,
    fontWeight: '500',
  },
});

