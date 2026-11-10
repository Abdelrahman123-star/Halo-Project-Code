/** Provides the active closet palette to every wardrobe component below the screen. */
import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { WOMENS_PALETTE, type ClosetPalette } from './closetTheme';

const ClosetPaletteContext = createContext<ClosetPalette>(WOMENS_PALETTE);

export function ClosetPaletteProvider({ palette, children }: { palette: ClosetPalette; children: ReactNode }) {
  return <ClosetPaletteContext.Provider value={palette}>{children}</ClosetPaletteContext.Provider>;
}

export function useClosetPalette(): ClosetPalette {
  return useContext(ClosetPaletteContext);
}

/**
 * Styles built from the active palette by a module-level `StyleSheet.create`
 * factory; rebuilt only when the palette changes.
 */
export function usePaletteStyles<T>(make: (palette: ClosetPalette) => T): T {
  const palette = useClosetPalette();
  // `make` is a module-level factory in every caller, so the palette is the only real dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => make(palette), [palette]);
}
