/** Rounded frame shared by the live camera, permission prompt and photo preview. */
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type CaptureFrameProps = {
  height: number;
  /** Light frosted surface (permission prompt) instead of the dark camera surface. */
  light?: boolean;
  children: ReactNode;
};

export function CaptureFrame({ height, light = false, children }: CaptureFrameProps) {
  return <View style={[styles.frame, light ? styles.light : styles.dark, { height }]}>{children}</View>;
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  // Deep plum rather than black, so the camera's first frames don't flash harshly.
  dark: { backgroundColor: '#2E2540' },
  light: { backgroundColor: 'rgba(255, 255, 255, 0.55)' },
});
