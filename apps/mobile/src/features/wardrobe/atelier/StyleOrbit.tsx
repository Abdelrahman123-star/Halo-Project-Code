/**
 * "Your Style Orbit": the wardrobe as a small fashion constellation. A glowing
 * centre ("Your Style", piece count) with up to 8 garments floating on an
 * elliptical orbit, and four category pearls on a wider orbit. Selecting a
 * category brings its pieces forward (others recede), shows its name and count
 * in the centre, and the centre then returns to All. Slow float + breathing
 * glow; Reduce Motion keeps everything still.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutAnimation, StyleSheet, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import type { WardrobeFilterGroup, WardrobeItem } from '../types/wardrobe';
import { CategoryPearl, OrbitCentre, OrbitGarment } from './OrbitParts';
import {
  categoryPoints,
  CENTRE_DIAMETER,
  countByGroup,
  ORBIT_ASPECT,
  orbitEllipses,
  orbitPieces,
  orbitSlots,
} from './orbitLayout';

const CATEGORY_TITLES: Record<Exclude<WardrobeFilterGroup, 'all'>, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  outerwear: 'Outerwear',
};

type StyleOrbitProps = {
  items: readonly WardrobeItem[];
  group: WardrobeFilterGroup;
  onGroupChange: (group: WardrobeFilterGroup) => void;
  reduceMotion: boolean;
  onOpen: (item: WardrobeItem) => void;
};

function useLoop(value: Animated.Value, duration: number, enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      value.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, enabled, value]);
}

export function StyleOrbit({ items, group, onGroupChange, reduceMotion, onOpen }: StyleOrbitProps) {
  const [width, setWidth] = useState(0);
  const float = useRef(new Animated.Value(0.5)).current;
  const breath = useRef(new Animated.Value(0.5)).current;
  useLoop(float, 3400, !reduceMotion);
  useLoop(breath, 2600, !reduceMotion);

  const pieces = useMemo(() => orbitPieces(items, group), [items, group]);
  const counts = useMemo(() => countByGroup(items), [items]);
  const height = width * ORBIT_ASPECT;
  const slots = orbitSlots(pieces.length, width);
  const ellipses = orbitEllipses(width);
  const hasSelection = group !== 'all';

  function select(next: WardrobeFilterGroup) {
    // Spring the pieces into their new orbit positions.
    if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.create(420, 'easeInEaseOut', 'opacity'));
    onGroupChange(next === group ? 'all' : next);
  }

  const centreTitle = hasSelection ? CATEGORY_TITLES[group] : 'Your Style';
  const centreCount = hasSelection ? counts[group] : items.length;

  return (
    <View style={[styles.orbit, { height: height || 1 }]} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Ellipse cx={width / 2} cy={height / 2} rx={ellipses.categories.rx} ry={ellipses.categories.ry} stroke="rgba(185, 168, 243, 0.28)" strokeWidth={1} fill="none" />
            <Ellipse
              cx={width / 2}
              cy={height / 2}
              rx={ellipses.pieces.rx}
              ry={ellipses.pieces.ry}
              stroke="rgba(185, 168, 243, 0.4)"
              strokeWidth={1}
              strokeDasharray="2 6"
              fill="none"
            />
          </Svg>

          {categoryPoints(width).map((point) => (
            <CategoryPearl
              key={point.group}
              point={point}
              count={counts[point.group]}
              selected={group === point.group}
              breath={breath}
              onPress={() => select(point.group)}
            />
          ))}

          <OrbitCentre
            x={width / 2}
            y={height / 2}
            diameter={CENTRE_DIAMETER * width}
            breath={breath}
            title={centreTitle}
            subtitle={hasSelection ? 'In your orbit' : 'Your collection'}
            count={centreCount}
            onShowAll={hasSelection ? () => select('all') : undefined}
          />

          {pieces.map(({ item, emphasized }, index) => (
            <OrbitGarment
              key={item.id}
              item={item}
              slot={slots[index]}
              emphasized={emphasized}
              hasSelection={hasSelection}
              float={float}
              phase={index}
              reduceMotion={reduceMotion}
              onOpen={onOpen}
            />
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Overflow visible: the wide category orbit line may run softly past the edges.
  orbit: { width: '100%', overflow: 'visible' },
});
