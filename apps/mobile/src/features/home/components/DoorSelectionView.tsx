/**
 * DoorSelectionView — Interactive hallway displaying the two doors (Bedroom and Bathroom).
 * Handles smooth camera approach zoom, subtle glowing door highlights, and
 * a warm interior light-bloom opening effect using React Native animations.
 */
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from './HomeIcons';

const HALLWAY_IMAGE = require('../../../../assets/hallway-doors.png');

type DoorSelectionViewProps = {
  onSelectBedroom: () => void;
  onSelectBathroom: () => void;
  onBackOutside: () => void;
};

type ActiveDoor = 'bedroom' | 'bathroom' | null;

export function DoorSelectionView({
  onSelectBedroom,
  onSelectBathroom,
  onBackOutside,
}: DoorSelectionViewProps) {
  const { width, height } = useWindowDimensions();
  const [activeDoor, setActiveDoor] = useState<ActiveDoor>(null);
  const isNavigating = useRef(false);

  const zoomAnim = useRef(new Animated.Value(0)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;
  const doorLightAnim = useRef(new Animated.Value(0)).current;
  const uiOpacity = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      isNavigating.current = false;
      setActiveDoor(null);
      zoomAnim.setValue(0);
      highlightAnim.setValue(0);
      doorLightAnim.setValue(0);
      uiOpacity.setValue(1);
    }, [doorLightAnim, highlightAnim, uiOpacity, zoomAnim])
  );

  const handleDoorPress = (door: 'bedroom' | 'bathroom') => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    setActiveDoor(door);

    Animated.timing(uiOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    Animated.timing(highlightAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    Animated.timing(zoomAnim, {
      toValue: 1,
      duration: 850,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(420),
      Animated.timing(doorLightAnim, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (door === 'bedroom') onSelectBedroom();
      else onSelectBathroom();
    });
  };

  const targetTranslateX = activeDoor === 'bedroom' ? width * 0.42 : -width * 0.48;
  const scale = zoomAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.7] });
  const translateX = zoomAnim.interpolate({ inputRange: [0, 1], outputRange: [0, targetTranslateX] });
  const translateY = zoomAnim.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.08] });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateX }, { translateY }, { scale }] }]}
      >
        <Image source={HALLWAY_IMAGE} style={styles.image} resizeMode="cover" accessible={false} />

        <Pressable
          onPress={() => handleDoorPress('bedroom')}
          accessibilityRole="button"
          accessibilityLabel="Enter Bedroom"
          style={styles.bedroomTarget}
        >
          {activeDoor === 'bedroom' && <Animated.View style={[styles.glow, { opacity: highlightAnim }]} />}
        </Pressable>

        <Pressable
          onPress={() => handleDoorPress('bathroom')}
          accessibilityRole="button"
          accessibilityLabel="Enter Bathroom"
          style={styles.bathroomTarget}
        >
          {activeDoor === 'bathroom' && <Animated.View style={[styles.glow, { opacity: highlightAnim }]} />}
        </Pressable>

        {activeDoor != null && (
          <Animated.View
            pointerEvents="none"
            style={[
              activeDoor === 'bedroom' ? styles.bedroomPortal : styles.bathroomPortal,
              {
                opacity: doorLightAnim,
                transform: [
                  { scaleX: doorLightAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 2.8] }) },
                  { scaleY: doorLightAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.4] }) },
                ],
              },
            ]}
          />
        )}
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.bloom,
          { opacity: doorLightAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.2, 0.95] }) },
        ]}
      />

      <SafeAreaView style={styles.hud} pointerEvents="box-none" edges={['top', 'left', 'right', 'bottom']}>
        <Animated.View style={[styles.topBar, { opacity: uiOpacity }]}>
          <Pressable
            onPress={onBackOutside}
            accessibilityRole="button"
            accessibilityLabel="Step outside"
            style={({ pressed }) => [styles.pillBtn, pressed && styles.pillPressed]}
          >
            <ChevronLeftIcon size={18} color="#FFFFFF" />
            <Text style={styles.pillText}>Outside</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.hintWrap, { opacity: uiOpacity }]} pointerEvents="none">
          <View style={styles.hintPill}>
            <Text style={styles.hintText}>Tap a door to enter</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16100D', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  bedroomTarget: { position: 'absolute', left: '18%', top: '20%', width: '31%', height: '54%', borderRadius: 4 },
  bathroomTarget: { position: 'absolute', left: '54%', top: '20%', width: '31%', height: '54%', borderRadius: 4 },
  glow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 235, 180, 0.22)',
    borderColor: 'rgba(255, 225, 150, 0.85)',
    borderWidth: 2,
    borderRadius: 4,
    shadowColor: '#FFD27D',
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 8,
  },
  bedroomPortal: {
    position: 'absolute',
    left: '28%',
    top: '24%',
    width: '11%',
    height: '46%',
    backgroundColor: '#FFF6E0',
    borderRadius: 8,
    shadowColor: '#FFE0A3',
    shadowOpacity: 1,
    shadowRadius: 28,
  },
  bathroomPortal: {
    position: 'absolute',
    left: '64%',
    top: '24%',
    width: '11%',
    height: '46%',
    backgroundColor: '#FFF6E0',
    borderRadius: 8,
    shadowColor: '#FFE0A3',
    shadowOpacity: 1,
    shadowRadius: 28,
  },
  bloom: { ...StyleSheet.absoluteFill, backgroundColor: '#FFF8F2' },
  hud: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 15, 12, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  pillPressed: { opacity: 0.7 },
  pillText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', letterSpacing: 0.2 },
  hintWrap: { alignItems: 'center' },
  hintPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 15, 12, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  hintText: { fontSize: 13, fontWeight: '600', color: '#FFEEDD', letterSpacing: 0.3 },
});
