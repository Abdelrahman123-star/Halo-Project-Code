import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const authTheme = {
  textMain: '#2a0b3f',
  textMuted: 'rgba(42, 11, 63, 0.65)',
  inputBg: 'rgba(255, 255, 255, 0.85)',
  inputBorder: 'rgba(255, 255, 255, 0.95)',
  inputFocusBorder: '#c084fc',
  placeholder: 'rgba(42, 11, 63, 0.45)',
  btnGradient: ['#9333ea', '#c026d3', '#db2777'] as const,
  logoGradient: ['#c084fc', '#f472b6', '#fef08a'] as const,
  bgGradient: ['#52a2c7', '#a2e9f3', '#ee92c2', '#fff7b9'] as const,
};

/** Logo with concentric circles on pastel gradient */
export function HaloMark() {
  return (
    <LinearGradient
      colors={authTheme.logoGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.logoMark}
    >
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke="#ffffff" strokeWidth={2.5} />
        <Circle cx={12} cy={12} r={4} stroke="#ffffff" strokeWidth={2.5} />
      </Svg>
    </LinearGradient>
  );
}

type AuthInputProps = TextInputProps & {
  iconType: 'user' | 'mail' | 'lock';
  error?: string;
  isPassword?: boolean;
};

export function AuthInput({
  iconType,
  error,
  isPassword = false,
  secureTextEntry,
  style,
  ...rest
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View style={styles.inputWrapper}>
      <View style={[styles.inputPill, Boolean(error) && styles.inputError]}>
        <View style={styles.inputIcon}>
          {iconType === 'user' ? (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                stroke={authTheme.textMain}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle
                cx={12}
                cy={7}
                r={4}
                stroke={authTheme.textMain}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : iconType === 'mail' ? (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect
                x={2}
                y={4}
                width={20}
                height={16}
                rx={3}
                stroke={authTheme.textMain}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                stroke={authTheme.textMain}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect
                x={3}
                y={11}
                width={18}
                height={11}
                rx={2}
                ry={2}
                stroke={authTheme.textMain}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M7 11V7a5 5 0 0 1 10 0v4"
                stroke={authTheme.textMain}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </View>

        <TextInput
          placeholderTextColor={authTheme.placeholder}
          selectionColor="#c084fc"
          cursorColor="#c084fc"
          secureTextEntry={isSecure}
          style={[styles.inputField, style]}
          {...rest}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.toggleBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export function AuthButton({ label, onPress, loading = false }: AuthButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.98,
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

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
      >
        <LinearGradient
          colors={authTheme.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryBtn}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnLabel}>{label}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function HairlineDivider() {
  return (
    <View style={styles.hairline}>
      <View style={styles.hairlineRule} />
      <Text style={styles.hairlineLabel}>or</Text>
      <View style={styles.hairlineRule} />
    </View>
  );
}

export function SocialButtons() {
  return (
    <View style={styles.socialGroup}>
      {/* Google */}
      <Pressable style={styles.socialBtn} accessibilityRole="button">
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <Path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <Path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <Path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </Svg>
      </Pressable>

      {/* Apple */}
      <Pressable style={styles.socialBtn} accessibilityRole="button">
        <Svg width={18} height={18} viewBox="0 0 170 170">
          <Path
            d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.71-7.92-12.04-14.52-5.74-8.8-10.15-18.49-13.23-29.07-3.08-10.58-4.62-20.91-4.62-30.98 0-14.68 3.73-26.79 11.19-36.31 7.45-9.52 16.65-14.38 27.59-14.59 4.7 0 9.87 1.25 15.52 3.74 5.66 2.5 9.4 3.78 11.23 3.86 1.48 0 5.46-1.39 11.95-4.16 6.49-2.77 12.08-3.99 16.78-3.66 12.83.65 23.01 5.38 30.54 14.19-11.45 6.94-17.07 16.48-16.85 28.61.22 9.53 3.91 17.51 11.07 23.94 7.16 6.43 15.63 10.17 25.4 11.22-2.17 6.74-4.88 13.62-8.14 20.64zM119.22 33.72c0-7.38 2.65-14.34 7.96-20.87 5.3-6.53 11.83-10.74 19.59-12.63.87 6.95-.78 13.84-4.96 20.66-4.18 6.82-10.3 11.48-18.37 13.98-.73-.39-1.84-.77-3.34-1.14-.58-.33-.88-.66-.88-1z"
            fill={authTheme.textMain}
          />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 6,
  },
  inputWrapper: {
    width: '100%',
    gap: 4,
  },
  inputPill: {
    height: 50,
    borderRadius: 999,
    backgroundColor: authTheme.inputBg,
    borderWidth: 1,
    borderColor: authTheme.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#e06d63',
  },
  inputIcon: {
    marginRight: 10,
    opacity: 0.5,
  },
  inputField: {
    flex: 1,
    height: 50,
    fontSize: 14,
    fontWeight: '500',
    color: authTheme.textMain,
    paddingVertical: 0,
  },
  toggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9333ea',
  },
  errorText: {
    fontSize: 12,
    color: '#e06d63',
    paddingLeft: 16,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  btnLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  hairline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  hairlineRule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(42, 11, 63, 0.18)',
  },
  hairlineLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: authTheme.textMain,
    opacity: 0.6,
  },
  socialGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: authTheme.inputBg,
    borderWidth: 1,
    borderColor: authTheme.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
});
