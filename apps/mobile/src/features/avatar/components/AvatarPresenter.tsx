import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native';
import { styles } from './AvatarPresenterStyles';

type Props = {
  hasAvatar: boolean;
  avatarName?: string | null;
  onPressCreate: () => void;
  onPressCustomize?: () => void;
};

export function AvatarPresenter({
  hasAvatar,
  avatarName,
  onPressCreate,
  onPressCustomize,
}: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const haloGlowAnim = useRef(new Animated.Value(0.4)).current;
  const idleBreatheAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Idle breathing animation for the avatar
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(idleBreatheAnim, {
          toValue: -4,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(idleBreatheAnim, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ]),
    );
    breathe.start();

    // Pulse animation for the plus sign halo
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(haloGlowAnim, {
            toValue: 0.9,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(haloGlowAnim, {
            toValue: 0.4,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();

    return () => {
      breathe.stop();
      pulse.stop();
    };
  }, [pulseAnim, haloGlowAnim, idleBreatheAnim]);

  return (
    <View style={styles.container}>
      {/* Avatar Silhouette Body with Breathing Animation */}
      <Animated.View
        style={[
          styles.avatarBodyContainer,
          { transform: [{ translateY: idleBreatheAnim }] },
        ]}
      >
        {/* Head */}
        <View style={styles.avatarHead} />

        {/* Neck */}
        <View style={styles.avatarNeck} />

        {/* Torso & Shoulders */}
        <View style={styles.avatarTorso}>
          {/* Subtle architectural contour lines */}
          <View style={styles.contourLine} />

          {/* Invitation Plus Button for First-Time Setup */}
          {!hasAvatar ? (
            <Pressable
              onPress={onPressCreate}
              style={styles.plusButtonHitArea}
              accessibilityRole="button"
              accessibilityLabel="Create your digital twin avatar"
            >
              {/* Outer halo breathing ring */}
              <Animated.View
                style={[
                  styles.plusHaloRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: haloGlowAnim,
                  },
                ]}
              />

              {/* Luminous Plus Button */}
              <View style={styles.plusButtonInner}>
                <Text style={styles.plusText}>+</Text>
              </View>
            </Pressable>
          ) : null}
        </View>

        {/* Lower Body & Legs */}
        <View style={styles.avatarLegs}>
          <View style={styles.leg} />
          <View style={styles.leg} />
        </View>

        {/* Subtle ground contact shadow */}
        <View style={styles.contactShadow} />
      </Animated.View>

      {/* Narrative Labeling */}
      {!hasAvatar ? (
        <View style={styles.labelSection}>
          <Text style={styles.promptTitle}>Your space is waiting for you.</Text>
          <Text style={styles.promptSubtitle}>
            Create your avatar to make HALO truly yours.
          </Text>
        </View>
      ) : (
        <View style={styles.labelSection}>
          <Text style={styles.promptTitle}>{avatarName ?? 'Your Avatar'}</Text>
          <Pressable
            onPress={onPressCustomize}
            style={styles.customizeAction}
            accessibilityRole="button"
          >
            <Text style={styles.customizeText}>Customize avatar • Change outfit</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

