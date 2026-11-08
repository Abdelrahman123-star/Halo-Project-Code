/**
 * Garment3DView — renders the on-device 3D garment (see garmentMesh.ts) on a
 * small "product studio" stage with React Three Fiber native + expo-gl.
 * Drag to rotate, pinch to zoom, gentle auto-rotation when idle.
 * Knows nothing about screens or the database.
 */

import "@/shared/lib/polyfills";
import React, { useEffect, useMemo, useRef } from "react";
import { PanResponder, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber/native";
import * as THREE from "three";
import { decodeJpegBase64 } from "@/features/garment/api/imageProcessor";
import { bleedBackground } from "@/three/garment/garmentOutline";
import { buildGarmentMesh, type GarmentShapeProfile, type RgbaPixels } from "@/three/garment/garmentMesh";

interface Garment3DViewProps {
  cropBase64: string;
  backCropBase64?: string | null;
  profile: GarmentShapeProfile;
  backgroundColor?: string;
}

interface ViewState {
  rotationY: number;
  rotationX: number;
  zoom: number;
  lastInteraction: number;
}

const IDLE_BEFORE_AUTOROTATE_MS = 2500;
const AUTOROTATE_SPEED = 0.35; // radians per second
const FLOOR_Y = -1.12;

function touchDistance(event: GestureResponderEvent): number | null {
  const touches = event.nativeEvent.touches;
  if (touches.length < 2) return null;
  return Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
}

function makeTexture(pixels: RgbaPixels): THREE.DataTexture {
  // flipY stays false: expo-gl ignores UNPACK_FLIP_Y, so UVs are built top-down instead.
  const texture = new THREE.DataTexture(pixels.data, pixels.width, pixels.height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** Radial dark→transparent texture used as a soft contact shadow on the floor. */
function makeShadowTexture(): THREE.DataTexture {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - size / 2 + 0.5, y - size / 2 + 0.5) / (size / 2);
      const alpha = Math.max(0, 1 - d) ** 2 * 140;
      data.set([20, 16, 30, Math.round(alpha)], (y * size + x) * 4);
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

function useGarmentAssets(cropBase64: string, backCropBase64: string | null | undefined, profile: GarmentShapeProfile) {
  const assets = useMemo(() => {
    try {
      const front = decodeJpegBase64(cropBase64);
      const back = backCropBase64 ? decodeJpegBase64(backCropBase64) : null;
      const mesh = buildGarmentMesh(front, profile, { back });
      if (!mesh) return null;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(mesh.positions, 3));
      geometry.setAttribute("uv", new THREE.BufferAttribute(mesh.uvs, 2));
      geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
      geometry.addGroup(0, mesh.frontIndexCount, 0);
      geometry.addGroup(mesh.frontIndexCount, mesh.indices.length - mesh.frontIndexCount, 1);
      geometry.computeVertexNormals();

      const frontTexture = makeTexture(bleedBackground(front));
      const backTexture = mesh.usesBackPhoto && back ? makeTexture(bleedBackground(back)) : frontTexture;
      const frontMaterial = new THREE.MeshStandardMaterial({ map: frontTexture, roughness: 0.82, metalness: 0 });
      const backMaterial = new THREE.MeshStandardMaterial({
        map: backTexture,
        roughness: 0.85,
        metalness: 0,
        // Without a real back photo the back is a copy of the front, shown slightly darker.
        color: mesh.usesBackPhoto ? "#ffffff" : "#cfcfcf",
      });
      const shadowTexture = makeShadowTexture();
      const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
      const textures = frontTexture === backTexture ? [frontTexture, shadowTexture] : [frontTexture, backTexture, shadowTexture];
      return { geometry, textures, materials: [frontMaterial, backMaterial], shadowMaterial, usesBackPhoto: mesh.usesBackPhoto };
    } catch (err: unknown) {
      console.warn("[HALO 3D] Could not build garment mesh:", err instanceof Error ? err.message : err);
      return null;
    }
  }, [cropBase64, backCropBase64, profile]);

  useEffect(() => {
    return () => {
      assets?.geometry.dispose();
      assets?.textures.forEach((t) => t.dispose());
      assets?.materials.forEach((m) => m.dispose());
      assets?.shadowMaterial.dispose();
    };
  }, [assets]);

  return assets;
}

type GarmentAssets = NonNullable<ReturnType<typeof useGarmentAssets>>;

function StudioScene({ assets, viewState }: { assets: GarmentAssets; viewState: React.MutableRefObject<ViewState> }): React.JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const state = viewState.current;
    if (Date.now() - state.lastInteraction > IDLE_BEFORE_AUTOROTATE_MS) {
      state.rotationY += AUTOROTATE_SPEED * delta;
      state.rotationX = THREE.MathUtils.damp(state.rotationX, 0, 2, delta);
    }
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, state.rotationY, 10, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, state.rotationX, 10, delta);
    const scale = THREE.MathUtils.damp(group.scale.x, state.zoom, 10, delta);
    group.scale.set(scale, scale, scale);
  });
  return (
    <>
      {/* Product-studio lighting: soft sky/ground fill, warm key, cool rim from behind. */}
      <hemisphereLight args={["#ffffff", "#d9d2e6", 0.85]} />
      <directionalLight position={[1.6, 2.4, 3]} intensity={1.5} color="#fff6ec" />
      <directionalLight position={[-2.2, 1.2, -2.6]} intensity={0.9} color="#dfe6ff" />
      <directionalLight position={[-2.5, -0.5, 2]} intensity={0.35} />
      <mesh position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={assets.shadowMaterial}>
        <planeGeometry args={[2.6, 1.3]} />
      </mesh>
      <group ref={groupRef}>
        <mesh geometry={assets.geometry} material={assets.materials} />
      </group>
    </>
  );
}

export function Garment3DView({
  cropBase64,
  backCropBase64 = null,
  profile,
  backgroundColor = "#F3EFFC",
}: Garment3DViewProps): React.JSX.Element {
  const assets = useGarmentAssets(cropBase64, backCropBase64, profile);
  const viewState = useRef<ViewState>({ rotationY: 0, rotationX: 0, zoom: 1, lastInteraction: 0 });

  const panResponder = useMemo(() => {
    let lastDx = 0;
    let lastDy = 0;
    let pinchStart: number | null = null;
    let zoomStart = 1;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // keep the gesture away from the parent ScrollView
      onPanResponderGrant: () => {
        lastDx = 0;
        lastDy = 0;
        pinchStart = null;
        viewState.current.lastInteraction = Date.now();
      },
      onPanResponderMove: (event, gesture) => {
        const state = viewState.current;
        state.lastInteraction = Date.now();
        const distance = touchDistance(event);
        if (distance !== null) {
          if (pinchStart === null) {
            pinchStart = distance;
            zoomStart = state.zoom;
          }
          state.zoom = THREE.MathUtils.clamp((zoomStart * distance) / pinchStart, 0.6, 2.2);
          return;
        }
        pinchStart = null;
        state.rotationY += (gesture.dx - lastDx) * 0.012;
        state.rotationX = THREE.MathUtils.clamp(state.rotationX + (gesture.dy - lastDy) * 0.008, -0.7, 0.7);
        lastDx = gesture.dx;
        lastDy = gesture.dy;
      },
    });
  }, []);

  if (!assets) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor }]}>
        <Text style={styles.fallbackText}>
          The 3D shape could not be built from this photo. Retake it flat on a plain, light background.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]} {...panResponder.panHandlers}>
      <Canvas camera={{ position: [0, 0.25, 3.3], fov: 42 }} style={styles.canvas}>
        <StudioScene assets={assets} viewState={viewState} />
      </Canvas>
      <View style={styles.hintBar} pointerEvents="none">
        <Text style={styles.hintText}>
          Drag to rotate · Pinch to zoom{assets.usesBackPhoto ? " · Real back photo" : ""}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 16, overflow: "hidden" },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
  canvas: { flex: 1 },
  fallbackText: { color: "#76648E", fontSize: 12.5, textAlign: "center", lineHeight: 18 },
  hintBar: { position: "absolute", bottom: 8, left: 0, right: 0, alignItems: "center" },
  hintText: { color: "rgba(90, 62, 145, 0.55)", fontSize: 11, fontWeight: "600" },
});
