/**
 * AuthSlideContainer — Smooth sliding transition between Login and Register forms.
 *
 * When switching from Login to Register:
 *   - Login slides out to the left while smoothly fading
 *   - Register slides in from the right
 * When switching from Register to Login:
 *   - Register slides out to the right while smoothly fading
 *   - Login slides in from the left
 *
 * Respects reduced-motion preferences with an elegant cross-fade fallback.
 */
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const SLIDE_OFFSET = Math.min(SCREEN_W * 0.75, 320);

interface AuthSlideContainerProps {
  mode: 'login' | 'register';
  renderLogin: () => React.ReactNode;
  renderRegister: () => React.ReactNode;
}

export function AuthSlideContainer({
  mode,
  renderLogin,
  renderRegister,
}: AuthSlideContainerProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const isRegister = mode === 'register';

  // 0 = Login active, 1 = Register active
  const anim = useRef(new Animated.Value(isRegister ? 1 : 0)).current;
  const prevModeRef = useRef(mode);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduceMotion(enabled);
    });

    return () => {
      isMounted = false;
      sub?.remove();
    };
  }, []);

  useEffect(() => {
    const targetValue = isRegister ? 1 : 0;
    prevModeRef.current = mode;

    if (reduceMotion) {
      Animated.timing(anim, {
        toValue: targetValue,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    // Smooth cubic deceleration slide curve
    Animated.timing(anim, {
      toValue: targetValue,
      duration: 360,
      easing: Easing.bezier(0.25, 1, 0.4, 1),
      useNativeDriver: true,
    }).start();
  }, [isRegister, mode, anim, reduceMotion]);

  // Login slide: when active (0) -> translateX: 0; when inactive (1) -> translateX: -SLIDE_OFFSET
  const loginTranslateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SLIDE_OFFSET],
  });

  const loginOpacity = anim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.2, 0],
  });

  // Register slide: when inactive (0) -> translateX: +SLIDE_OFFSET; when active (1) -> translateX: 0
  const registerTranslateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SLIDE_OFFSET, 0],
  });

  const registerOpacity = anim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.2, 1],
  });

  return (
    <View style={styles.container}>
      {/* Login Form Panel */}
      <Animated.View
        pointerEvents={isRegister ? 'none' : 'auto'}
        style={[
          styles.panel,
          isRegister && styles.panelAbsolute,
          {
            opacity: loginOpacity,
            transform: [{ translateX: reduceMotion ? 0 : loginTranslateX }],
          },
        ]}
      >
        {renderLogin()}
      </Animated.View>

      {/* Register Form Panel */}
      <Animated.View
        pointerEvents={isRegister ? 'auto' : 'none'}
        style={[
          styles.panel,
          !isRegister && styles.panelAbsolute,
          {
            opacity: registerOpacity,
            transform: [{ translateX: reduceMotion ? 0 : registerTranslateX }],
          },
        ]}
      >
        {renderRegister()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  panel: {
    width: '100%',
  },
  panelAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
