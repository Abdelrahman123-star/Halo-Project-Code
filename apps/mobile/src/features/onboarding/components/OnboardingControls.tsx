import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { authTheme } from '@/features/auth/components/AuthComponents';

type PaginationDotsProps = {
  activeIndex: number;
  total: number;
};

export function PaginationDots({ activeIndex, total }: PaginationDotsProps) {
  return (
    <View style={styles.paginationRow}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        if (isActive) {
          return (
            <LinearGradient
              key={index}
              colors={['#9333ea', '#c026d3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeDot}
            />
          );
        }
        return <View key={index} style={styles.inactiveDot} />;
      })}
    </View>
  );
}

type OnboardingSecondaryButtonProps = {
  label: string;
  onPress: () => void;
};

export function OnboardingSecondaryButton({ label, onPress }: OnboardingSecondaryButtonProps) {
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
        style={styles.secondaryBtn}
      >
        <Text style={styles.secondaryBtnLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

type OnboardingPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  showArrow?: boolean;
};

export function OnboardingPrimaryButton({
  label,
  onPress,
  showArrow = false,
}: OnboardingPrimaryButtonProps) {
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
      >
        <LinearGradient
          colors={authTheme.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnLabel}>{label}</Text>
          {showArrow ? (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
              <Path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="#ffffff"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : null}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 14,
  },
  activeDot: {
    width: 26,
    height: 8,
    borderRadius: 4,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(42, 11, 63, 0.22)',
  },
  primaryBtn: {
    height: 50,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  arrowIcon: {
    marginTop: 1,
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: authTheme.inputBg,
    borderWidth: 1.2,
    borderColor: authTheme.inputBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryBtnLabel: {
    color: authTheme.textMain,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
