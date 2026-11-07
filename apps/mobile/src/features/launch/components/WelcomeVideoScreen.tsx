/**
 * WelcomeVideoScreen — cinematic HALO intro shown once when the app opens.
 *
 * Plays the bundled intro video full-screen with sound, exactly once, then
 * fades out and calls onFinished so the root layout can reveal the navigator
 * (Login, or Home if a session exists). Includes a top-right Skip button matching
 * the house entrance video styling so users can skip directly to the app.
 */
import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const finish = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    try {
      player.pause();
    } catch {
      // player might already be finished/unmounted
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => onFinishedRef.current());
  }, [player, opacity]);

  useEffect(() => {
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
  }, [player, finish]);

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

      {/* Top bar with Skip button matching house entrance video */}
      <SafeAreaView style={styles.controlsOverlay} pointerEvents="box-none" edges={['top', 'right']}>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={finish}
          accessibilityRole="button"
          accessibilityLabel="Skip intro video"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [styles.pillBtn, pressed && styles.pillPressed]}
        >
          <Text style={styles.pillText}>Skip</Text>
        </Pressable>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BACKDROP_COLOR },
  controlsOverlay: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 20,
  },
  headerSpacer: { flex: 1 },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(25, 18, 40, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  pillPressed: {
    opacity: 0.7,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
