/**
 * Global runtime polyfills for React Native / Hermes.
 * Polyfills Buffer and process.emitWarning (required by Three.js CJS build).
 */

import { Buffer } from "buffer";

// Polyfill global Buffer
const globalScope = globalThis as unknown as { Buffer?: typeof Buffer };
if (!globalScope.Buffer) {
  globalScope.Buffer = Buffer;
}

// Polyfill process.emitWarning for Three.js CJS build in React Native Hermes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proc = (globalThis as any).process;
if (proc && typeof proc.emitWarning !== "function") {
  proc.emitWarning = (warning: unknown, ..._args: unknown[]) => {
    if (__DEV__) {
      const msg = typeof warning === "string" ? warning : (warning as Error)?.message;
      if (msg && msg.includes("require(\"three\")")) {
        return;
      }
      console.warn("[process.emitWarning]", warning);
    }
  };
}

