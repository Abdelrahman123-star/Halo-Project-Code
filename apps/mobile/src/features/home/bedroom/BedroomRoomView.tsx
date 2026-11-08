/**
 * Immersive bedroom: the room image fills the screen; the wardrobe and the
 * mirror are interactive but nearly invisible until needed — a faint
 * breathing light on their edges and a tiny line-icon hint each. Touching
 * (or hovering) reveals the label; tapping adds a light shimmer, then zooms
 * toward the object and navigates. State resets when the screen regains focus.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from '@/features/home/components/HomeIcons';
import { BedroomHint, FineAvatarIcon, FineHangerIcon } from './BedroomHint';
import { BedroomHotspot } from './BedroomHotspot';
import {
  coverLayout,
  imagePoint,
  MIRROR_HINT_POINT,
  MIRROR_REGION,
  POUF_TOP_Y,
  regionRect,
  visibleCenterX,
  WARDROBE_HINT_POINT,
  WARDROBE_REGION,
  type Rect,
} from './bedroomLayout';

const BEDROOM_IMAGE = require('../../../../assets/girl-bedroom.png');
const INK = '#5E4A78';

type Target = 'wardrobe' | 'mirror';

// How far the camera zooms toward each object (the mirror is narrow, so closer).
const ZOOM_SCALE: Record<Target, number> = { wardrobe: 1.35, mirror: 2.1 };

type BedroomRoomViewProps = {
  onOpenWardrobe: () => void;
  onOpenTryOn: () => void;
  onBack: () => void;
};

export function BedroomRoomView({ onOpenWardrobe, onOpenTryOn, onBack }: BedroomRoomViewProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const layout = coverLayout(width, height);
  const wardrobe = regionRect(layout, WARDROBE_REGION);
  const mirror = regionRect(layout, MIRROR_REGION);

  const [target, setTarget] = useState<Target | null>(null);
  const isNavigating = useRef(false);
  const reduceMotion = useRef(false);
  const zoom = useRef(new Animated.Value(0)).current;
  const veil = useRef(new Animated.Value(0)).current;
  const hud = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const reveal = useRef({ wardrobe: new Animated.Value(0), mirror: new Animated.Value(0) }).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.current = enabled;
      if (enabled) {
        pulse.setValue(0.6);
        return;
      }
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();
    });
    return () => pulse.stopAnimation();
  }, [pulse]);

  // Coming back from the wardrobe / try-on: un-zoom, hide labels, fade hints in.
  useFocusEffect(
    useCallback(() => {
      isNavigating.current = false;
      setTarget(null);
      [zoom, veil, hud, shimmer, reveal.wardrobe, reveal.mirror].forEach((value) => value.setValue(0));
      const fadeIn = Animated.timing(hud, { toValue: 1, duration: 1100, delay: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true });
      fadeIn.start();
      return () => fadeIn.stop();
    }, [hud, reveal, shimmer, veil, zoom]),
  );

  function setRevealed(which: Target, visible: boolean) {
    if (isNavigating.current) return;
    Animated.timing(reveal[which], { toValue: visible ? 1 : 0, duration: visible ? 200 : 320, useNativeDriver: true }).start();
  }

  function open(which: Target) {
    if (isNavigating.current) return;
    isNavigating.current = true;
    setTarget(which);
    const navigate = which === 'wardrobe' ? onOpenWardrobe : onOpenTryOn;

    if (reduceMotion.current) {
      navigate();
      return;
    }
    // Label + shimmer first, so the tap feels acknowledged, then the camera moves in.
    Animated.parallel([
      Animated.timing(reveal[which], { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(380),
        Animated.parallel([
          Animated.timing(hud, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(zoom, { toValue: 1, duration: 700, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(360),
            Animated.timing(veil, { toValue: 1, duration: 340, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]),
        ]),
      ]),
    ]).start(() => navigate());
  }

  // Bring the chosen object's centre to the screen centre while scaling up
  // (RN applies transforms about the view centre: p' = c + t + s·(p − c)).
  const focusRect: Rect = target === 'mirror' ? mirror : wardrobe;
  const scaleTo = ZOOM_SCALE[target ?? 'wardrobe'];
  const dx = -scaleTo * (focusRect.x + focusRect.width / 2 - width / 2);
  const dy = -scaleTo * (focusRect.y + focusRect.height / 2 - height / 2);
  const transform = [
    { translateX: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
    { translateY: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
    { scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, scaleTo] }) },
  ];

  // Both hints sit on the furniture itself: the hanger on the wardrobe's
  // central divider (label just above), the avatar on the upper mirror glass
  // (label just below).
  // Centred on the part of the wardrobe actually on screen (phones crop its left edge).
  const wardrobeAnchor = { x: visibleCenterX(wardrobe, width)-20, y: imagePoint(layout, WARDROBE_HINT_POINT).y };
  const mirrorAnchor = imagePoint(layout, MIRROR_HINT_POINT);
  // Callout lines rise into the ceiling band, where the text reads clearly.
  // Labels sit right of the back button, so they only need to clear the safe area.
  // The mirror's line rises to the ceiling band. The wardrobe's line drops from
  // its icon to a label resting just above the pouf, wrapped so it stops short
  // of the mirror.
  const mirrorCalloutY = Math.max(wardrobe.y - 52, insets.top + 18);
  // −28: the two-line label (≈32 pt tall) ends just above the pouf, on the white drawer fronts.
  const wardrobeCalloutY = layout.y + POUF_TOP_Y * layout.height - 28;
  const wardrobeLabelMaxWidth = Math.max(mirror.x - (wardrobeAnchor.x + 24) - 12, 90);

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform }]}>
        <Image
          source={BEDROOM_IMAGE}
          style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.width, height: layout.height }}
          accessible={false}
        />
        <BedroomHotspot
          rect={wardrobe}
          radius={6}
          pulse={pulse}
          shimmer={shimmer}
          isSelected={target === 'wardrobe'}
          accessibilityLabel="Open My Wardrobe"
          onPress={() => open('wardrobe')}
          onReveal={(visible) => setRevealed('wardrobe', visible)}
        />
        <BedroomHotspot
          rect={mirror}
          radius={mirror.width * 0.48}
          pulse={pulse}
          shimmer={shimmer}
          isSelected={target === 'mirror'}
          accessibilityLabel="Open 3D Try-On"
          onPress={() => open('mirror')}
          onReveal={(visible) => setRevealed('mirror', visible)}
        />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.veil, { opacity: veil }]} />

      <BedroomHint
        id="wardrobe"
        anchor={wardrobeAnchor}
        calloutY={wardrobeCalloutY}
        side="right"
        label="PRESS TO OPEN WARDROBE"
        maxLabelWidth={wardrobeLabelMaxWidth}
        icon={<FineHangerIcon />}
        pulse={pulse}
        reveal={reveal.wardrobe}
        draw={hud}
        accessibilityLabel="Open My Wardrobe"
        onPress={() => open('wardrobe')}
        onReveal={(visible) => setRevealed('wardrobe', visible)}
      />
      <BedroomHint
        id="mirror"
        anchor={mirrorAnchor}
        calloutY={mirrorCalloutY}
        side="left"
        label="PRESS TO OPEN 3D TRY-ON"
        icon={<FineAvatarIcon />}
        pulse={pulse}
        reveal={reveal.mirror}
        draw={hud}
        accessibilityLabel="Open 3D Try-On"
        onPress={() => open('mirror')}
        onReveal={(visible) => setRevealed('mirror', visible)}
      />

      <Animated.View style={[styles.backSlot, { top: insets.top + 8, opacity: hud }]} pointerEvents="box-none">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to hallway"
          hitSlop={8}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backPressed]}
        >
          <ChevronLeftIcon size={18} color={INK} />
          <Text style={styles.backText}>Hallway</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#EDE4F6' },
  veil: { ...StyleSheet.absoluteFill, backgroundColor: '#F6F0FC' },
  backSlot: { position: 'absolute', left: 16 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(248, 243, 255, 0.78)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  backPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  backText: { fontSize: 13, fontWeight: '700', color: INK, letterSpacing: 0.3 },
});
