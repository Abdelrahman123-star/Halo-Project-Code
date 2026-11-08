/**
 * Immersive bathroom: the room image fills the screen; three objects are
 * interactive — the skincare shelf (left), the round vanity mirror and the
 * makeup shelf (right). Same language as the bedroom: faint breathing edge
 * light, a small icon on each object with a hairline callout label, and a
 * shimmer + zoom into the chosen object before navigating.
 */
import { Animated, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from '@/features/home/components/HomeIcons';
import { BedroomHint } from '../bedroom/BedroomHint';
import { BedroomHotspot } from '../bedroom/BedroomHotspot';
import { coverLayout, imagePoint, regionRect, type Rect } from '../bedroom/bedroomLayout';
import { useRoomInteraction } from '../rooms/useRoomInteraction';
import { FineBottleIcon, FineFaceScanIcon, FineLipstickIcon } from './BathroomIcons';
import {
  BATHROOM_CROP_CENTER_X,
  BATHROOM_IMAGE_SIZE,
  MAKEUP_HINT_POINT,
  MAKEUP_REGION,
  SKINCARE_HINT_POINT,
  SKINCARE_REGION,
  VANITY_FRONT_Y,
  VANITY_MIRROR_HINT_POINT,
  VANITY_MIRROR_REGION,
  WALL_PANEL_TOP_Y,
} from './bathroomLayout';

const BATHROOM_IMAGE = require('../../../../assets/girl-bathroom.png');
const INK = '#5E4A78';

type Target = 'skincare' | 'mirror' | 'makeup';
const TARGETS: readonly Target[] = ['skincare', 'mirror', 'makeup'];

// How far the camera zooms toward each object (shelves are narrow, so closer).
const ZOOM_SCALE: Record<Target, number> = { skincare: 2.2, mirror: 1.7, makeup: 2.2 };

type BathroomRoomViewProps = {
  onOpenSkincare: () => void;
  onOpenSkinAnalysis: () => void;
  onOpenMakeup: () => void;
  onBack: () => void;
};

export function BathroomRoomView({ onOpenSkincare, onOpenSkinAnalysis, onOpenMakeup, onBack }: BathroomRoomViewProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const room = useRoomInteraction(TARGETS);

  const layout = coverLayout(width, height, BATHROOM_IMAGE_SIZE, BATHROOM_CROP_CENTER_X);
  const rects: Record<Target, Rect> = {
    skincare: regionRect(layout, SKINCARE_REGION),
    mirror: regionRect(layout, VANITY_MIRROR_REGION),
    makeup: regionRect(layout, MAKEUP_REGION),
  };
  const navigateTo: Record<Target, () => void> = {
    skincare: onOpenSkincare,
    mirror: onOpenSkinAnalysis,
    makeup: onOpenMakeup,
  };
  const open = (which: Target) => room.open(which, navigateTo[which]);

  const skincareAnchor = imagePoint(layout, SKINCARE_HINT_POINT);
  const mirrorAnchor = imagePoint(layout, VANITY_MIRROR_HINT_POINT);
  const makeupAnchor = imagePoint(layout, MAKEUP_HINT_POINT);

  // Mirror label: top row, just above the marble wall panel. Makeup label: the
  // row below it, wrapped so it stays right of the mirror's line. Skincare label:
  // drops onto the vanity front, clear of both.
  const mirrorCalloutY = Math.max(layout.y + WALL_PANEL_TOP_Y * layout.height - 40, insets.top + 18);
  const makeupCalloutY = mirrorCalloutY + 48;
  const skincareCalloutY = layout.y + VANITY_FRONT_Y * layout.height;
  const mirrorLabelMaxWidth = width - (mirrorAnchor.x + 18) - 12;
  const makeupLabelMaxWidth = makeupAnchor.x - 18 - (mirrorAnchor.x + 10);
  const skincareLabelMaxWidth = width - (skincareAnchor.x + 18) - 12;

  const focus = room.target ?? 'mirror';
  const transform = room.zoomTransform(rects[focus], ZOOM_SCALE[focus], { width, height });

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform }]}>
        <Image
          source={BATHROOM_IMAGE}
          style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.width, height: layout.height }}
          accessible={false}
        />
        <BedroomHotspot
          rect={rects.skincare}
          radius={8}
          pulse={room.pulse}
          shimmer={room.shimmer}
          isSelected={room.target === 'skincare'}
          accessibilityLabel="Open skin recommendations"
          onPress={() => open('skincare')}
          onReveal={(visible) => room.setRevealed('skincare', visible)}
        />
        <BedroomHotspot
          rect={rects.mirror}
          radius={rects.mirror.width / 2}
          pulse={room.pulse}
          shimmer={room.shimmer}
          isSelected={room.target === 'mirror'}
          accessibilityLabel="Open skin analysis"
          onPress={() => open('mirror')}
          onReveal={(visible) => room.setRevealed('mirror', visible)}
        />
        <BedroomHotspot
          rect={rects.makeup}
          radius={8}
          pulse={room.pulse}
          shimmer={room.shimmer}
          isSelected={room.target === 'makeup'}
          accessibilityLabel="Open makeup"
          onPress={() => open('makeup')}
          onReveal={(visible) => room.setRevealed('makeup', visible)}
        />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.veil, { opacity: room.veil }]} />

      <BedroomHint
        id="skincare"
        anchor={skincareAnchor}
        calloutY={skincareCalloutY}
        side="right"
        label="PRESS FOR SKIN RECOMMENDATIONS"
        maxLabelWidth={skincareLabelMaxWidth}
        icon={<FineBottleIcon />}
        pulse={room.pulse}
        reveal={room.reveal.skincare}
        draw={room.hud}
        accessibilityLabel="Open skin recommendations"
        onPress={() => open('skincare')}
        onReveal={(visible) => room.setRevealed('skincare', visible)}
      />
      <BedroomHint
        id="mirror"
        anchor={mirrorAnchor}
        calloutY={mirrorCalloutY}
        side="right"
        label="PRESS FOR SKIN ANALYSIS"
        maxLabelWidth={mirrorLabelMaxWidth}
        icon={<FineFaceScanIcon />}
        pulse={room.pulse}
        reveal={room.reveal.mirror}
        draw={room.hud}
        accessibilityLabel="Open skin analysis"
        onPress={() => open('mirror')}
        onReveal={(visible) => room.setRevealed('mirror', visible)}
      />
      <BedroomHint
        id="makeup"
        anchor={makeupAnchor}
        calloutY={makeupCalloutY}
        side="left"
        label="PRESS FOR MAKEUP"
        maxLabelWidth={makeupLabelMaxWidth}
        icon={<FineLipstickIcon />}
        pulse={room.pulse}
        reveal={room.reveal.makeup}
        draw={room.hud}
        accessibilityLabel="Open makeup"
        onPress={() => open('makeup')}
        onReveal={(visible) => room.setRevealed('makeup', visible)}
      />

      <Animated.View style={[styles.backSlot, { top: insets.top + 8, opacity: room.hud }]} pointerEvents="box-none">
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
