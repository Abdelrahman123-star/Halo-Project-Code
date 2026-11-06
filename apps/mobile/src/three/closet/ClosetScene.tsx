/**
 * Main 3D Closet Scene Container.
 * Embeds R3F native Canvas, pan gestures for rail sliding, and lighting setup.
 */

import "@/shared/lib/polyfills";
import React, { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { Canvas } from "@react-three/fiber/native";
import type { WardrobeItem } from "@/features/wardrobe/types/wardrobe";
import { CameraRig } from "@/three/closet/CameraRig";
import { QUALITY_PRESETS } from "@/three/closet/quality";
import { Rail } from "@/three/closet/Rail";
import { Wardrobe } from "@/three/closet/Wardrobe";

interface ClosetSceneProps {
  items: WardrobeItem[];
  doorsOpen: boolean;
  selectedId: string | null;
  quality?: "light" | "standard" | "high";
  onToggleDoors: () => void;
  onSelect: (id: string) => void;
}

export function ClosetScene({
  items,
  doorsOpen,
  selectedId,
  quality = "standard",
  onToggleDoors,
  onSelect,
}: ClosetSceneProps): React.JSX.Element {
  const [railOffset, setRailOffset] = useState(0);
  const offsetRef = useRef(0);
  offsetRef.current = railOffset;

  const qualityConfig = QUALITY_PRESETS[quality];

  // PanResponder to allow horizontal rail sliding with soft boundaries
  const panResponder = useMemo(() => {
    let startOffset = 0;
    const maxOffset = Math.max(0, (items.length - 1) * 0.72) / 2 + 0.5;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && doorsOpen;
      },
      onPanResponderGrant: () => {
        startOffset = offsetRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        // Convert screen pixels to 3D world space (approx 100px = 0.5 units)
        const deltaWorld = (gestureState.dx / 180);
        let nextOffset = startOffset + deltaWorld;
        if (nextOffset > maxOffset) nextOffset = maxOffset;
        if (nextOffset < -maxOffset) nextOffset = -maxOffset;
        setRailOffset(nextOffset);
      },
      onPanResponderRelease: () => {},
    });
  }, [items.length, doorsOpen]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 48 }}
        style={styles.canvas}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[2, 3, 3]} intensity={1.2} />
        <directionalLight position={[-2, 1, 2]} intensity={0.5} color="#c7d2fe" />

        <CameraRig
          doorsOpen={doorsOpen}
          isInspecting={Boolean(selectedId)}
          inspectOffset={railOffset}
        />

        <Wardrobe
          doorsOpen={doorsOpen}
          onTapDoors={onToggleDoors}
        />

        {doorsOpen && (
          <Rail
            items={items}
            offset={railOffset}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        )}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0c10",
  },
  canvas: {
    flex: 1,
  },
});

