import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme/tokens';

type Props = {
  activeLight?: boolean;
  children?: React.ReactNode;
};

/**
 * Architectural Futuristic Apartment Entrance:
 * Depicts the tall apartment door, warm rim lighting, handle access panel,
 * delicate floor reflection, and breathing ambient glow.
 */
export function HaloDoorScene({ activeLight = true, children }: Props) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!activeLight) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 3800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 4200,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [activeLight, pulseAnim]);

  return (
    <View style={styles.sceneContainer}>
      {/* Background ambient lighting */}
      <Animated.View style={[styles.ambientBackdrop, { opacity: pulseAnim }]} />

      {/* Layered Architectural Walls */}
      <View style={styles.leftPillar} />
      <View style={styles.rightPillar} />

      {/* Futuristic Door Portal Frame */}
      <View style={styles.doorPortal}>
        {/* Soft rim light around door */}
        <Animated.View style={[styles.doorRimGlow, { opacity: pulseAnim }]} />

        {/* The Apartment Door */}
        <View style={styles.doorBody}>
          {/* Subtle architectural vertical seam */}
          <View style={styles.doorSeam} />

          {/* Minimal halo touch-access panel / handle */}
          <View style={styles.accessPanel}>
            <View style={styles.accessHaloRing} />
            <View style={styles.accessIndicator} />
          </View>

          {/* Subtle engraved emblem at top of door */}
          <View style={styles.doorEmblem}>
            <View style={styles.doorEmblemCircle} />
          </View>
        </View>

        {/* Under-door light spill */}
        <Animated.View style={[styles.floorLightSpill, { opacity: pulseAnim }]} />
      </View>

      {/* Floor with subtle reflective perspective */}
      <View style={styles.floorPlane}>
        <View style={styles.floorReflectionLine} />
      </View>

      {/* Foreground Content */}
      {children ? <View style={styles.foregroundLayer}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sceneContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.midnight,
    overflow: 'hidden',
  },
  ambientBackdrop: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '70%',
    height: '60%',
    borderRadius: 200,
    backgroundColor: 'rgba(184, 174, 216, 0.08)',
  },
  leftPillar: {
    position: 'absolute',
    top: 0,
    bottom: '22%',
    left: 0,
    width: '14%',
    backgroundColor: 'rgba(23, 27, 39, 0.95)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(201, 205, 212, 0.08)',
  },
  rightPillar: {
    position: 'absolute',
    top: 0,
    bottom: '22%',
    right: 0,
    width: '14%',
    backgroundColor: 'rgba(23, 27, 39, 0.95)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(201, 205, 212, 0.08)',
  },
  doorPortal: {
    position: 'absolute',
    top: '12%',
    bottom: '22%',
    left: '20%',
    right: '20%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  doorRimGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 224, 212, 0.45)',
    shadowColor: colors.softCream,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  doorBody: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E2331',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(201, 205, 212, 0.12)',
    overflow: 'hidden',
  },
  doorSeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '84%',
    width: 1,
    backgroundColor: 'rgba(201, 205, 212, 0.08)',
  },
  accessPanel: {
    position: 'absolute',
    right: '10%',
    top: '52%',
    width: 18,
    height: 54,
    borderRadius: 9,
    backgroundColor: 'rgba(23, 27, 39, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(184, 174, 216, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  accessHaloRing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.lavender,
  },
  accessIndicator: {
    width: 2,
    height: 12,
    borderRadius: 1,
    backgroundColor: 'rgba(184, 174, 216, 0.5)',
  },
  doorEmblem: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    opacity: 0.4,
  },
  doorEmblemCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.silver,
  },
  floorLightSpill: {
    position: 'absolute',
    bottom: -16,
    width: '110%',
    height: 24,
    backgroundColor: 'rgba(244, 240, 232, 0.22)',
    borderRadius: 12,
    transform: [{ scaleY: 0.35 }],
  },
  floorPlane: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '22%',
    backgroundColor: '#131620',
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 205, 212, 0.12)',
    alignItems: 'center',
  },
  floorReflectionLine: {
    width: '45%',
    height: 2,
    backgroundColor: 'rgba(184, 174, 216, 0.18)',
    marginTop: 8,
    borderRadius: 1,
  },
  foregroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
