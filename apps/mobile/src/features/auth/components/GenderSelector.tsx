/**
 * GenderSelector — checklist-style Female / Male choice on the register form,
 * inside the same frosted pill as the other inputs. Each option has a circle:
 * tapping it fills the circle with the Create Account button's baby pink (Female) or
 * baby blue (Male), with a plum check like the button's text.
 * Nothing is selected until the user picks.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GENDER_OPTIONS, type Gender } from '../schemas';
import { authTheme } from './AuthComponents';

// Same baby pink / baby blue as the ends of the Create Account button's pearl gradient.
const [BABY_PINK, , BABY_BLUE] = authTheme.pearlBtnGradient;

const OPTION_STYLE: Record<Gender, { label: string; color: string }> = {
  female: { label: 'Female', color: BABY_PINK },
  male: { label: 'Male', color: BABY_BLUE },
};

type GenderSelectorProps = {
  value: Gender | '';
  onChange: (gender: Gender) => void;
  error?: string;
};

export function GenderSelector({ value, onChange, error }: GenderSelectorProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.pill, error ? styles.pillError : null]} accessibilityRole="radiogroup" accessibilityLabel="Gender">
        <Text style={styles.label}>Gender</Text>

        <View style={styles.options}>
          {GENDER_OPTIONS.map((option) => {
            const selected = value === option;
            const { label, color } = OPTION_STYLE[option];
            return (
              <Pressable
                key={option}
                onPress={() => onChange(option)}
                hitSlop={8}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={label}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              >
                <View style={[styles.circle, selected && { backgroundColor: color, borderColor: color }]}>
                  {selected ? (
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17l-5-5" stroke={authTheme.pearlBtnText} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : null}
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// Pill mirrors AuthComponents' inputPill so it lines up with the fields above.
const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: 4 },
  pill: {
    height: 52,
    borderRadius: 18,
    backgroundColor: authTheme.inputBg,
    borderWidth: 1.2,
    borderColor: authTheme.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#8C7CAE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  pillError: { borderColor: '#E06D6D' },
  label: { fontSize: 15, color: authTheme.placeholder },
  options: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 18 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  pressed: { opacity: 0.75 },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(100, 85, 130, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { fontSize: 14, fontWeight: '500', color: authTheme.textMuted },
  optionTextSelected: { color: authTheme.textMain, fontWeight: '700' },
  errorText: { fontSize: 12, color: '#E06D6D', paddingLeft: 16 },
});
