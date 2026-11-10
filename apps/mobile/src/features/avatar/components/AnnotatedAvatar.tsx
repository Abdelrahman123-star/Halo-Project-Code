/**
 * The preview avatar with the user's measurements pinned to the matching body parts:
 * a dot (and measured segment) on the body, a callout line, and a label column on each side.
 * Anchor positions come from MediaPipe run on the avatar image (see avatarAnchors.ts).
 */
import { useState } from 'react';
import { Image, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { buildAnnotations, layoutLabelCenters, type Point } from '../avatarAnchors';
import type { AvatarMeasurements } from '../avatarProfileStore';
import { PREVIEW_AVATAR_ASPECT_RATIO, PREVIEW_AVATAR_IMAGE } from '../previewAvatar';

const LABEL_HEIGHT = 34;
const LABEL_GAP = 4;
const COLUMN_GAP = 10;
const ACCENT = '#8B7BEF';
const SEGMENT = '#E06BA8';

type AnnotatedAvatarProps = {
  measurements: AvatarMeasurements;
  /** Height of the avatar figure in px. */
  height: number;
};

export function AnnotatedAvatar({ measurements, height }: AnnotatedAvatarProps) {
  const [width, setWidth] = useState(0);
  const annotations = buildAnnotations(measurements);

  const imageWidth = height * PREVIEW_AVATAR_ASPECT_RATIO;
  const imageLeft = (width - imageWidth) / 2;
  const toScreen = (p: Point) => ({ x: imageLeft + p.x * imageWidth, y: p.y * height });

  const columnWidth = Math.max(0, imageLeft - COLUMN_GAP);
  const minGap = LABEL_HEIGHT + LABEL_GAP;
  const placeColumn = (side: 'left' | 'right') => {
    const items = annotations.filter((a) => a.side === side);
    const centers = layoutLabelCenters(
      items.map((a) => toScreen(a.anchor).y),
      minGap,
      LABEL_HEIGHT / 2,
      height - LABEL_HEIGHT / 2,
    );
    return items.map((annotation, index) => ({ annotation, centerY: centers[index] }));
  };
  const placed = width > 0 ? [...placeColumn('left'), ...placeColumn('right')] : [];

  function onLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={[styles.container, { height }]} onLayout={onLayout} accessibilityRole="summary">
      {width > 0 ? (
        <>
          <Image
            source={PREVIEW_AVATAR_IMAGE}
            style={[styles.image, { left: imageLeft, width: imageWidth, height }]}
            resizeMode="contain"
            accessibilityLabel="Preview avatar with your measurements"
          />
          <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
            {placed.map(({ annotation, centerY }) => {
              const dot = toScreen(annotation.anchor);
              const labelEdgeX = annotation.side === 'left' ? columnWidth : width - columnWidth;
              const segment = annotation.segment?.map(toScreen);
              return (
                <G key={annotation.id}>
                  {segment ? (
                    <Line
                      x1={segment[0].x}
                      y1={segment[0].y}
                      x2={segment[1].x}
                      y2={segment[1].y}
                      stroke={SEGMENT}
                      strokeWidth={2}
                      strokeLinecap="round"
                      opacity={0.9}
                    />
                  ) : null}
                  <Line x1={labelEdgeX} y1={centerY} x2={dot.x} y2={dot.y} stroke={ACCENT} strokeWidth={1} opacity={0.75} />
                  <Circle cx={dot.x} cy={dot.y} r={4} fill={ACCENT} stroke="#FFFFFF" strokeWidth={1.5} />
                </G>
              );
            })}
          </Svg>
          {placed.map(({ annotation, centerY }) => (
            <View
              key={annotation.id}
              style={[
                styles.label,
                {
                  top: centerY - LABEL_HEIGHT / 2,
                  width: columnWidth,
                  ...(annotation.side === 'left' ? { left: 0 } : { right: 0 }),
                },
                annotation.side === 'left' ? styles.labelLeft : styles.labelRight,
              ]}
              accessible
              accessibilityLabel={`${annotation.title}: ${annotation.value}`}
            >
              <Text style={styles.labelTitle} numberOfLines={1}>
                {annotation.title}
              </Text>
              <Text style={styles.labelValue} numberOfLines={1} adjustsFontSizeToFit>
                {annotation.value}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  image: { position: 'absolute', top: 0 },
  label: {
    position: 'absolute',
    height: LABEL_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  labelLeft: { alignItems: 'flex-end' },
  labelRight: { alignItems: 'flex-start' },
  labelTitle: { fontSize: 10, fontWeight: '600', color: dashboardTheme.muted },
  labelValue: { fontSize: 12, fontWeight: '700', color: dashboardTheme.plum },
});
