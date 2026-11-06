/**
 * HouseEntranceScreen — Plays the interactive 3D house entrance video
 * and smoothly transitions to the Hallway screen upon completion.
 */
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ChevronLeftIcon } from '@/features/home/components/HomeIcons';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';

const ENTRANCE_VIDEO = require('../../assets/videos/house-entrance.mp4');

export default function HouseEntranceScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isReady, setIsReady] = useState(false);

  // Initialize expo-video player: auto-play, muted, single-play without looping
  const player = useVideoPlayer(ENTRANCE_VIDEO, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  const navigateToHallway = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    try {
      player.pause();
    } catch {
      // safe fallback
    }

    // Smooth fade transition before opening hallway
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      router.replace('/(app)/hallway');
    });
  };

  const handleBack = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    try {
      player.pause();
    } catch {
      // safe fallback
    }
    router.back();
  };

  useEffect(() => {
    // Navigate automatically when video finishes playing
    const endSub = player.addListener('playToEnd', () => {
      navigateToHallway();
    });

    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        setIsReady(true);
      }
    });

    return () => {
      endSub.remove();
      statusSub.remove();
      try {
        player.pause();
      } catch {
        // safe fallback
      }
    };
  }, [player]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Pastel background avoids any blank/black flash while buffering */}
      <View style={StyleSheet.absoluteFill}>
        <PastelBlobBackground />
        {!isReady && (
          <View style={styles.loadingBackdrop}>
            <ActivityIndicator size="small" color="#7E5FA8" />
            <Text style={styles.loadingText}>Stepping inside...</Text>
          </View>
        )}
      </View>

      {/* Full-screen entrance video */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          nativeControls={false}
          contentFit="cover"
        />
      </Animated.View>

      {/* Overlaid safe area controls */}
      <SafeAreaView style={styles.controlsOverlay} pointerEvents="box-none" edges={['top', 'left', 'right']}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to Home"
          style={({ pressed }) => [styles.pillBtn, pressed && styles.pillPressed]}
        >
          <ChevronLeftIcon size={18} color="#FFFFFF" />
          <Text style={styles.pillText}>Home</Text>
        </Pressable>

        <Pressable
          onPress={navigateToHallway}
          accessibilityRole="button"
          accessibilityLabel="Skip entrance video"
          style={({ pressed }) => [styles.pillBtn, pressed && styles.pillPressed]}
        >
          <Text style={styles.pillText}>Skip</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0C1B',
  },
  loadingBackdrop: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B5299',
    letterSpacing: 0.2,
  },
  controlsOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 20,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
