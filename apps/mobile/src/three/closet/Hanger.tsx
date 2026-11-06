/**
 * 3D Clothes Hanger with hanging garment photo card.
 * Handles sway animation, inspect selection, and photo texture rendering.
 */

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber/native";
import * as THREE from "three";
import type { WardrobeItem } from "@/features/wardrobe/types/wardrobe";
import { usePhotoTexture } from "@/three/closet/usePhotoTexture";

interface HangerProps {
  item: WardrobeItem;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function Hanger({
  item,
  position,
  isSelected,
  onSelect,
}: HangerProps): React.JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const texture = usePhotoTexture(item.crop_base64);

  // Smooth forward offset when inspected
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetZ = isSelected ? 0.35 : 0;
    const targetScale = isSelected ? 1.08 : 1.0;
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetZ,
      8,
      delta,
    );
    const newScale = THREE.MathUtils.damp(
      groupRef.current.scale.x,
      targetScale,
      8,
      delta,
    );
    groupRef.current.scale.set(newScale, newScale, newScale);
  });

  const dominantHex = item.colors?.[0]?.hex || "#6366f1";

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
    >
      {/* Hook */}
      <mesh position={[0, 0.42, 0]}>
        <torusGeometry args={[0.07, 0.012, 12, 24, Math.PI * 1.3]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Shoulder Bar */}
      <mesh position={[0, 0.34, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.65, 16]} />
        <meshStandardMaterial color="#d4a373" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Crossbar */}
      <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.58, 12]} />
        <meshStandardMaterial color="#b08968" roughness={0.6} />
      </mesh>

      {/* Garment Photo Card */}
      <mesh position={[0, -0.22, 0]}>
        <planeGeometry args={[0.62, 0.8]} />
        {texture ? (
          <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial
            color={dominantHex}
            roughness={0.6}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/* Subtle Card Frame / Border */}
      <mesh position={[0, -0.22, -0.005]}>
        <boxGeometry args={[0.64, 0.82, 0.008]} />
        <meshStandardMaterial
          color={isSelected ? "#3b82f6" : "#ffffff"}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

