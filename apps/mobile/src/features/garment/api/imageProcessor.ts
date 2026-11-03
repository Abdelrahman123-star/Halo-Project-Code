/**
 * In-memory JPEG decoding, segmentation polygon masking, white-background
 * isolation, and base64 encoding. Zero disk writes.
 */

import { Buffer } from "buffer";
import * as jpeg from "jpeg-js";

const globalScope = globalThis as unknown as { Buffer?: typeof Buffer };
if (!globalScope.Buffer) {
  globalScope.Buffer = Buffer;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const cleaned = base64
    .replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "")
    .replace(/[\r\n\s]/g, "");
  return Uint8Array.from(Buffer.from(cleaned, "base64"));
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export interface DecodedImage {
  width: number;
  height: number;
  data: Uint8Array;
}

export function decodeJpegBase64(base64: string): DecodedImage {
  const rawBytes = base64ToUint8Array(base64);
  const decoded = jpeg.decode(rawBytes, {
    useTArray: true,
    formatAsRGBA: true,
  });
  return {
    width: decoded.width,
    height: decoded.height,
    data: decoded.data,
  };
}

export interface RawPredictionPoint {
  x: number;
  y: number;
}

export interface RawPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;
  class?: string;
  points?: Array<RawPredictionPoint | [number, number]>;
}

function normalizePoints(
  points?: Array<RawPredictionPoint | [number, number]>,
): [number, number][] {
  if (!points || points.length < 3) return [];
  return points.map((pt) =>
    Array.isArray(pt) ? [pt[0], pt[1]] : [pt.x, pt.y],
  );
}

/**
 * Ray-casting point-in-polygon test.
 */
export function isPointInPolygon(
  px: number,
  py: number,
  polygon: [number, number][],
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-10) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isLowerBodyGarment(categoryName: string): boolean {
  const lower = categoryName.toLowerCase();
  return ["trouser", "pant", "shorts", "skirt", "jeans"].some((kw) =>
    lower.includes(kw),
  );
}

/**
 * Crops the detected garment onto a clean white background (255, 255, 255),
 * applies polygon mask isolation when available, adds 5% uniform white padding,
 * and returns a `data:image/jpeg;base64,...` URI.
 */
export function cropAndCleanGarment(
  decoded: DecodedImage,
  pred: RawPrediction,
  paddingPct: number = 0.05,
): string {
  const { width: imgW, height: imgH, data: srcData } = decoded;

  const x1 = Math.max(0, Math.floor(pred.x - pred.width / 2));
  const y1 = Math.max(0, Math.floor(pred.y - pred.height / 2));
  const x2 = Math.min(imgW, Math.ceil(pred.x + pred.width / 2));
  const y2 = Math.min(imgH, Math.ceil(pred.y + pred.height / 2));

  const cropW = Math.max(1, x2 - x1);
  const cropH = Math.max(1, y2 - y1);

  const padX = Math.max(2, Math.round(cropW * paddingPct));
  const padY = Math.max(2, Math.round(cropH * paddingPct));

  const outW = cropW + padX * 2;
  const outH = cropH + padY * 2;
  const outData = new Uint8Array(outW * outH * 4);
  outData.fill(255); // Pure white RGBA background

  const polygon = normalizePoints(pred.points);
  const hasPolygon = polygon.length >= 3;

  // Compute tight polygon bounding box to bypass ray-casting for outside pixels
  let polyMinX = Infinity;
  let polyMaxX = -Infinity;
  let polyMinY = Infinity;
  let polyMaxY = -Infinity;
  if (hasPolygon) {
    for (let i = 0; i < polygon.length; i++) {
      const [ptX, ptY] = polygon[i];
      if (ptX < polyMinX) polyMinX = ptX;
      if (ptX > polyMaxX) polyMaxX = ptX;
      if (ptY < polyMinY) polyMinY = ptY;
      if (ptY > polyMaxY) polyMaxY = ptY;
    }
  }

  for (let cy = 0; cy < cropH; cy++) {
    const srcY = y1 + cy;
    const dstY = cy + padY;

    for (let cx = 0; cx < cropW; cx++) {
      const srcX = x1 + cx;

      if (hasPolygon) {
        if (
          srcX < polyMinX ||
          srcX > polyMaxX ||
          srcY < polyMinY ||
          srcY > polyMaxY ||
          !isPointInPolygon(srcX, srcY, polygon)
        ) {
          continue;
        }
      }

      const dstX = cx + padX;
      const srcOffset = (srcY * imgW + srcX) * 4;
      const dstOffset = (dstY * outW + dstX) * 4;

      outData[dstOffset] = srcData[srcOffset];
      outData[dstOffset + 1] = srcData[srcOffset + 1];
      outData[dstOffset + 2] = srcData[srcOffset + 2];
      outData[dstOffset + 3] = 255;
    }
  }

  const encoded = jpeg.encode(
    {
      data: outData,
      width: outW,
      height: outH,
    },
    85,
  );

  const b64 = Buffer.isBuffer(encoded.data)
    ? encoded.data.toString("base64")
    : uint8ArrayToBase64(encoded.data);

  return `data:image/jpeg;base64,${b64}`;
}
