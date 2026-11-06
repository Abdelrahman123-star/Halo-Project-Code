/**
 * WelcomeVideoScreen — cinematic HALO intro shown once when the app opens.
 *
 * Plays the bundled intro video full-screen with sound, exactly once, then
 * fades out and calls onFinished so the root layout can reveal the navigator
 * (Login, or Home if a session exists). If the video errors or never becomes
 * ready, we finish anyway so the user is never stuck on the intro.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';

const WELCOME_VIDEO = require('../../../../assets/videos/welcome-intro.mp4');

// Pastel tone close to the video's palette, so neither the loading moment nor
// the fade-out flashes black/white.
const BACKDROP_COLOR = '#EDE6F6';
const FADE_OUT_MS = 450;
const LOAD_TIMEOUT_MS = 8000;

type WelcomeVideoScreenProps = {
  onFinished: () => void;
};

export function WelcomeVideoScreen({ onFinished }: WelcomeVideoScreenProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const hasFinished = useRef(false);
  // The parent passes an inline callback; keeping it in a ref means a parent
  // re-render never re-subscribes listeners or restarts playback.
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  // The player is created once per mount; expo-video releases it on unmount.
  const player = useVideoPlayer(WELCOME_VIDEO, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });

  useEffect(() => {
    function finish() {
      if (hasFinished.current) return;
      hasFinished.current = true;
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => onFinishedRef.current());
    }

    let isReady = false;
    const loadTimeout = setTimeout(() => {
      if (!isReady) finish();
    }, LOAD_TIMEOUT_MS);

    const endSubscription = player.addListener('playToEnd', finish);
    const statusSubscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') isReady = true;
      if (status === 'error') finish();
    });

    return () => {
      clearTimeout(loadTimeout);
      endSubscription.remove();
      statusSubscription.remove();
    };
  }, [player, opacity]);

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      <StatusBar hidden />
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        nativeControls={false}
        contentFit="cover"
        allowsPictureInPicture={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BACKDROP_COLOR },
});
