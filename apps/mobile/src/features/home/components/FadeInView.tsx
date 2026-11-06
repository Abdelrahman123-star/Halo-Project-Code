/**
 * One-shot entrance animation (fade + gentle rise / scale), using the same
 * spring feel as the auth card entrance.
 */
import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

type FadeInViewProps = {
  children: ReactNode;
  delayMs?: number;
  fromTranslateY?: number;
  fromScale?: number;
  style?: StyleProp<ViewStyle>;
};

export function FadeInView({ children, delayMs = 0, fromTranslateY = 16, fromScale = 1, style }: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 520, delay: delayMs, useNativeDriver: true }),
      Animated.spring(progress, { toValue: 1, friction: 8, tension: 40, delay: delayMs, useNativeDriver: true }),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [delayMs, opacity, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [fromTranslateY, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [fromScale, 1] });

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }, { scale }] }]}>{children}</Animated.View>
  );
}
