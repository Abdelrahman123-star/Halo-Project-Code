/**
 * 3D Wardrobe Cabinet Carcass with animated swinging doors and interior lighting.
 */

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber/native";
import * as THREE from "three";

interface WardrobeProps {
  doorsOpen: boolean;
  onTapDoors?: () => void;
}

const W = 3.6;
const H = 2.6;
const D = 1.4;
const DOOR_W = W / 2;

export function Wardrobe({
  doorsOpen,
  onTapDoors,
}: WardrobeProps): React.JSX.Element {
  const leftHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const leftTarget = doorsOpen ? -Math.PI * 0.58 : 0;
    const rightTarget = doorsOpen ? Math.PI * 0.58 : 0;

    if (leftHingeRef.current) {
      leftHingeRef.current.rotation.y = THREE.MathUtils.damp(
        leftHingeRef.current.rotation.y,
        leftTarget,
        6,
        delta,
      );
    }
    if (rightHingeRef.current) {
      rightHingeRef.current.rotation.y = THREE.MathUtils.damp(
        rightHingeRef.current.rotation.y,
        rightTarget,
        6,
        delta,
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Back Wall */}
      <mesh position={[0, 0, -D / 2]}>
        <boxGeometry args={[W, H, 0.04]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.7} />
      </mesh>

      {/* Ceiling with recessed warm LED strip */}
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[W, 0.04, D]} />
        <meshStandardMaterial color="#2b2b36" roughness={0.6} />
      </mesh>
      <pointLight position={[0, H / 2 - 0.1, 0]} intensity={1.8} color="#fed7aa" distance={4} />

      {/* Floor */}
      <mesh position={[0, -H / 2, 0]}>
        <boxGeometry args={[W, 0.04, D]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-W / 2, 0, 0]}>
        <boxGeometry args={[0.04, H, D]} />
        <meshStandardMaterial color="#252530" roughness={0.6} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[W / 2, 0, 0]}>
        <boxGeometry args={[0.04, H, D]} />
        <meshStandardMaterial color="#252530" roughness={0.6} />
      </mesh>

      {/* Left Door with Hinge Pivot at [-W/2, 0, D/2] */}
      <group
        ref={leftHingeRef}
        position={[-W / 2, 0, D / 2]}
        onClick={onTapDoors}
      >
        <mesh position={[DOOR_W / 2, 0, 0]}>
          <boxGeometry args={[DOOR_W - 0.01, H - 0.02, 0.04]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.2}
            roughness={0.3}
          />
        </mesh>
        {/* Left Handle */}
        <mesh position={[DOOR_W - 0.08, 0, 0.04]}>
          <cylinderGeometry args={[0.014, 0.014, 0.4, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Right Door with Hinge Pivot at [W/2, 0, D/2] */}
      <group
        ref={rightHingeRef}
        position={[W / 2, 0, D / 2]}
        onClick={onTapDoors}
      >
        <mesh position={[-DOOR_W / 2, 0, 0]}>
          <boxGeometry args={[DOOR_W - 0.01, H - 0.02, 0.04]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.2}
            roughness={0.3}
          />
        </mesh>
        {/* Right Handle */}
        <mesh position={[-DOOR_W + 0.08, 0, 0.04]}>
          <cylinderGeometry args={[0.014, 0.014, 0.4, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

