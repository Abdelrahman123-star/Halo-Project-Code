/** The preview avatar image, optionally tappable, with a soft ground shadow. */
import { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PREVIEW_AVATAR_ASPECT_RATIO, PREVIEW_AVATAR_IMAGE } from '../previewAvatar';

type PreviewAvatarFigureProps = {
  height: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

function springTo(value: Animated.Value, toValue: number) {
  Animated.spring(value, { toValue, useNativeDriver: true, speed: 36, bounciness: 5 }).start();
}

export function PreviewAvatarFigure({ height, onPress, style }: PreviewAvatarFigureProps) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const width = height * PREVIEW_AVATAR_ASPECT_RATIO;

  const figure = (
    <Animated.View style={{ width, height, transform: [{ scale: pressScale }] }}>
      <View style={[styles.shadow, { width: width * 1.3, left: -width * 0.15 }]} pointerEvents="none" />
      <Image source={PREVIEW_AVATAR_IMAGE} style={{ width, height }} resizeMode="contain" accessible={false} />
    </Animated.View>
  );

  if (!onPress) return <View style={style}>{figure}</View>;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => springTo(pressScale, 0.95)}
      onPressOut={() => springTo(pressScale, 1)}
      accessibilityRole="button"
      accessibilityLabel="Open your avatar"
      style={style}
    >
      {figure}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Flattened ellipse under the feet so the figure sits on the ground.
  shadow: {
    position: 'absolute',
    bottom: -3,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(110, 85, 145, 0.22)',
  },
});
