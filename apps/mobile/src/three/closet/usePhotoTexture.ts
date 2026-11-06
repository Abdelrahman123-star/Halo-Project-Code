/**
 * In-memory Three.js texture creation from base64 JPEG crops.
 * Uses pure JS in-memory JPEG decoding without touching the filesystem.
 */

import { useEffect, useState } from "react";
import * as THREE from "three";
import { decodeJpegBase64 } from "@/features/garment/api/imageProcessor";

export function usePhotoTexture(base64Uri?: string | null): THREE.DataTexture | null {
  const [texture, setTexture] = useState<THREE.DataTexture | null>(null);

  useEffect(() => {
    if (!base64Uri || !base64Uri.startsWith("data:image")) {
      setTexture(null);
      return;
    }

    try {
      const decoded = decodeJpegBase64(base64Uri);
      const dataTex = new THREE.DataTexture(
        new Uint8Array(decoded.data),
        decoded.width,
        decoded.height,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
      );
      dataTex.flipY = true;
      dataTex.needsUpdate = true;
      dataTex.generateMipmaps = true;
      dataTex.minFilter = THREE.LinearMipmapLinearFilter;
      dataTex.magFilter = THREE.LinearFilter;

      setTexture(dataTex);

      return () => {
        dataTex.dispose();
      };
    } catch (err) {
      console.warn("[HALO 3D Closet] Failed to decode base64 photo for 3D texture:", err);
      setTexture(null);
    }
  }, [base64Uri]);

  return texture;
}

