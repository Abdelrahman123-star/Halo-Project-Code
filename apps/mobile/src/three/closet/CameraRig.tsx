/**
 * Camera controller managing walk-in transition and inspection zoom.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber/native";
import * as THREE from "three";

interface CameraRigProps {
  doorsOpen: boolean;
  isInspecting: boolean;
  inspectOffset: number;
}

export function CameraRig({
  doorsOpen,
  isInspecting,
  inspectOffset,
}: CameraRigProps): null {
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    let targetX = 0;
    let targetY = 0;
    let targetZ = 4.4;

    if (doorsOpen) {
      if (isInspecting) {
        targetX = inspectOffset;
        targetY = -0.15;
        targetZ = 1.6;
      } else {
        targetX = 0;
        targetY = 0.05;
        targetZ = 2.55;
      }
    }

    // Smooth position dampening
    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      targetX,
      5,
      delta,
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      targetY,
      5,
      delta,
    );
    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      targetZ,
      5,
      delta,
    );

    // Smooth lookAt dampening
    const targetLookAt = new THREE.Vector3(targetX * 0.4, targetY * 0.4, 0);
    lookAtRef.current.lerp(targetLookAt, 0.1);
    state.camera.lookAt(lookAtRef.current);
  });

  return null;
}

