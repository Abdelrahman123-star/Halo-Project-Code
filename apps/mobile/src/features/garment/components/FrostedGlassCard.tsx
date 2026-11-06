/**
 * FrostedGlassCard — luxury frosted-glass surface container.
 * Features translucent white fill, soft mauve ambient shadow, delicate white hairline border,
 * and elegant rounded corners.
 */
import React, { type ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface FrostedGlassCardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'card' | 'panel' | 'subtle';
}

export function FrostedGlassCard({
  children,
  style,
  variant = 'card',
}: FrostedGlassCardProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.base,
        variant === 'card' && styles.card,
        variant === 'panel' && styles.panel,
        variant === 'subtle' && styles.subtle,
        style,
      ]}
    >
      {/* Delicate top sheen line */}
      <View style={styles.topSheen} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#77708F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  panel: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.98)',
    shadowColor: '#77708F',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 26,
    elevation: 6,
  },
  subtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.82)',
    shadowColor: '#77708F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
});
