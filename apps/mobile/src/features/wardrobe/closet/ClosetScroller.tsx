/**
 * The horizontally scrolling closet: left panel, N middle tiles, right panel,
 * each scaled to the available height at the images' exact aspect ratio and
 * laid edge to edge (no margins). A FlatList with a fixed item layout keeps
 * only nearby panels mounted, so large wardrobes stay light.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import type { WardrobeItem } from '../types/wardrobe';
import { ClosetDots, ClosetMessage, DOTS_HEIGHT, SwipeHint } from './ClosetChrome';
import { packCloset, type ClosetSegmentLayout } from './closetPacking';
import { CLOSET_IMAGE_ASPECT, type ClosetScene } from './closetSlots';
import { ClosetSegment } from './ClosetSegment';

const SWIPE_HINT_KEY = 'halo.wardrobe.closet-swipe-hint-seen.v1';

type ClosetScrollerProps = {
  items: readonly WardrobeItem[];
  scene: ClosetScene;
  washIds: ReadonlySet<string>;
  /** Centred card over the shelves (empty wardrobe / empty filter); null hides it. */
  message: { title: string; subtitle: string; onPress?: () => void } | null;
  showSlotOutlines: boolean;
  onOpen: (item: WardrobeItem) => void;
  onAddPiece: () => void;
};

export function ClosetScroller({ items, scene, washIds, message, showSlotOutlines, onOpen, onAddPiece }: ClosetScrollerProps) {
  const [areaHeight, setAreaHeight] = useState(0);
  const [activeSegment, setActiveSegment] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const layout = useMemo(() => packCloset(items, scene.slots), [items, scene.slots]);
  const height = Math.max(0, areaHeight - DOTS_HEIGHT);
  // Rounded so neighbouring images meet on whole points (no hairline gaps).
  const width = Math.round(height * CLOSET_IMAGE_ASPECT);

  useEffect(() => {
    // Only this user's set: the other gender's images are never shown to them.
    Asset.loadAsync(Object.values(scene.images) as number[]).catch((error: unknown) => console.warn('Closet images did not preload', error));
    let active = true;
    AsyncStorage.getItem(SWIPE_HINT_KEY)
      .then((seen) => active && setShowHint(seen === null))
      .catch(() => active && setShowHint(false));
    return () => {
      active = false;
    };
  }, [scene.images]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      if (width > 0) setActiveSegment(Math.min(layout.length - 1, Math.max(0, Math.round(x / width))));
      if (showHint && x > 8) {
        setShowHint(false);
        AsyncStorage.setItem(SWIPE_HINT_KEY, '1').catch(() => undefined);
      }
    },
    [layout.length, showHint, width],
  );

  const renderSegment = useCallback(
    ({ item: segment }: { item: ClosetSegmentLayout<WardrobeItem> }) => (
      <ClosetSegment
        image={scene.images[segment.kind]}
        slotMap={scene.slots}
        rodY={scene.rodY}
        width={width}
        height={height}
        layout={segment}
        washIds={washIds}
        showSlotOutlines={showSlotOutlines}
        onOpen={onOpen}
        onAddPiece={onAddPiece}
      />
    ),
    [height, scene, onAddPiece, onOpen, showSlotOutlines, washIds, width],
  );

  return (
    <View style={styles.area} onLayout={(event: LayoutChangeEvent) => setAreaHeight(event.nativeEvent.layout.height)}>
      {height > 0 ? (
        <>
          <View style={{ height }}>
            <FlatList
              horizontal
              data={layout}
              keyExtractor={(segment) => String(segment.index)}
              renderItem={renderSegment}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={32}
              initialNumToRender={3}
              windowSize={5}
              decelerationRate="fast"
            />
            {message ? (
              <View style={styles.messageWrap} pointerEvents="box-none">
                <ClosetMessage {...message} />
              </View>
            ) : null}
            <SwipeHint visible={showHint} />
          </View>
          <ClosetDots count={layout.length} active={activeSegment} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
  // Centred over the shelves (lower half of the closet).
  messageWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '58%',
    alignItems: 'center',
  },
});
