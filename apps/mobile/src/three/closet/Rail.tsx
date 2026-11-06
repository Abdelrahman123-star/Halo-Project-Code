/**
 * Clothes Rail with metallic bar, end brackets, and positioned hangers.
 */

import React, { useMemo } from "react";
import * as THREE from "three";
import type { WardrobeItem } from "@/features/wardrobe/types/wardrobe";
import { Hanger } from "@/three/closet/Hanger";

interface RailProps {
  items: WardrobeItem[];
  offset: number; // Horizontal pan offset
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const HANGER_SPACING = 0.72;

export function Rail({
  items,
  offset,
  selectedId,
  onSelect,
}: RailProps): React.JSX.Element {
  const railLength = Math.max(3.2, (items.length + 1) * HANGER_SPACING);

  const hangerPositions = useMemo(() => {
    const totalWidth = (items.length - 1) * HANGER_SPACING;
    const startX = -totalWidth / 2;
    return items.map((item, idx) => ({
      item,
      x: startX + idx * HANGER_SPACING,
    }));
  }, [items]);

  return (
    <group position={[offset, 0.45, 0]}>
      {/* Horizontal Chrome Rail Bar */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.024, railLength, 20]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.92}
          roughness={0.15}
        />
      </mesh>

      {/* Left Wall Bracket */}
      <mesh position={[-railLength / 2, 0.08, -0.2]}>
        <boxGeometry args={[0.05, 0.2, 0.4]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Right Wall Bracket */}
      <mesh position={[railLength / 2, 0.08, -0.2]}>
        <boxGeometry args={[0.05, 0.2, 0.4]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Hangers */}
      {hangerPositions.map(({ item, x }) => (
        <Hanger
          key={item.id}
          item={item}
          position={[x, -0.4, 0]}
          isSelected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

