/**
 * The garment photo with static callout lines drawn (react-native-svg) to
 * frosted labels: "STYLE", "PATTERN", "FABRIC", "COLOUR", each with its
 * "AI guess · %" and a "Fix it" pencil. The dots mark the garment area in
 * general — the analysis gives no per-attribute positions, so none are implied.
 */
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { HangerIcon } from '@/features/home/components/HomeIcons';
import { StageSheen } from './cardParts';
import { useClosetPalette, usePaletteStyles } from './ClosetPaletteContext';
import type { ClosetPalette } from './closetTheme';
import type { AttributeCallout } from './garmentLogic';

const PANEL_HEIGHT = 300;
const PHOTO_SHARE = 0.54;
const LABEL_HEIGHT = 62;
const LABEL_GAP = 10;
// Where each line starts on the photo, as fractions of the photo area.
const DOT_ANCHORS = [
  { x: 0.5, y: 0.28 },
  { x: 0.62, y: 0.46 },
  { x: 0.45, y: 0.62 },
  { x: 0.6, y: 0.78 },
];

function PencilIcon() {
  const palette = useClosetPalette();
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Polyline points="16.5,3.5 20.5,7.5 7,21 3,21 3,17 16.5,3.5" stroke={palette.accent} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

type AttributeCalloutsProps = {
  photoUri: string | null;
  tint: string;
  callouts: readonly AttributeCallout[];
  onFix: () => void;
};

export function AttributeCallouts({ photoUri, tint, callouts, onFix }: AttributeCalloutsProps) {
  const [width, setWidth] = useState(0);
  const palette = useClosetPalette();
  const styles = usePaletteStyles(makeStyles);
  const photoWidth = width * PHOTO_SHARE;
  const labelX = photoWidth + 14;
  const stackHeight = callouts.length * LABEL_HEIGHT + (callouts.length - 1) * LABEL_GAP;
  const firstTop = (PANEL_HEIGHT - stackHeight) / 2;
  const labelTop = (index: number) => firstTop + index * (LABEL_HEIGHT + LABEL_GAP);

  return (
    <View style={styles.panel} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={[styles.photoStage, { width: photoWidth, backgroundColor: tint }]}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" accessibilityLabel="Garment photo" />
        ) : (
          <HangerIcon size={40} color={palette.outline} />
        )}
        <StageSheen />
      </View>

      {width > 0 ? (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {callouts.map((callout, index) => {
            const anchor = DOT_ANCHORS[index % DOT_ANCHORS.length];
            const dotX = photoWidth * anchor.x;
            const dotY = PANEL_HEIGHT * anchor.y;
            const labelY = labelTop(index) + LABEL_HEIGHT / 2;
            const elbowX = photoWidth + 4;
            return (
              <React.Fragment key={callout.field}>
                <Polyline
                  points={`${dotX},${dotY} ${elbowX},${labelY} ${labelX},${labelY}`}
                  stroke="#FFFFFF"
                  strokeWidth={1.4}
                  fill="none"
                  opacity={0.95}
                />
                <Circle cx={dotX} cy={dotY} r={6} fill="rgba(255,255,255,0.45)" />
                <Circle cx={dotX} cy={dotY} r={3} fill="#FFFFFF" stroke={palette.accent} strokeWidth={1} />
              </React.Fragment>
            );
          })}
        </Svg>
      ) : null}

      {width > 0
        ? callouts.map((callout, index) => (
            <View key={callout.field} style={[styles.label, { left: labelX, top: labelTop(index) }]}>
              <Text style={styles.labelCaps}>{callout.label.toUpperCase()}</Text>
              <Text style={styles.labelValue} numberOfLines={1}>
                {callout.value}
              </Text>
              <View style={styles.labelFooter}>
                <Text style={styles.labelAi}>{callout.confidence == null ? 'AI guess' : `AI guess · ${callout.confidence}%`}</Text>
                {/* Colour isn't editable in the existing editor, so only the other fields get "Fix it". */}
                {callout.field !== 'colour' ? (
                  <Pressable
                    onPress={onFix}
                    accessibilityRole="button"
                    accessibilityLabel={`Fix ${callout.label.toLowerCase()}`}
                    hitSlop={8}
                    style={({ pressed }) => [styles.fix, pressed && styles.pressed]}
                  >
                    <PencilIcon />
                    <Text style={styles.fixText}>Fix it</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))
        : null}
    </View>
  );
}

const makeStyles = (p: ClosetPalette) =>
  StyleSheet.create({
    panel: { height: PANEL_HEIGHT },
    photoStage: {
      height: PANEL_HEIGHT,
      borderRadius: 22,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: p.glassBorder,
    },
    photo: { width: '90%', height: '90%' },
    label: {
      position: 'absolute',
      right: 0,
      height: LABEL_HEIGHT,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: p.glassStrong,
      borderWidth: 1,
      borderColor: p.glassBorder,
      justifyContent: 'center',
    },
    labelCaps: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.6,
      color: p.heading,
    },
    labelValue: {
      fontSize: 13,
      fontWeight: '700',
      color: p.text,
      textTransform: 'capitalize',
    },
    labelFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
    },
    labelAi: { fontSize: 9.5, color: p.muted },
    fix: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    fixText: { fontSize: 9.5, fontWeight: '700', color: p.accent },
    pressed: { opacity: 0.6 },
  });
