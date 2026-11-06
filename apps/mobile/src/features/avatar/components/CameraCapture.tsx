/**
 * Live camera for one capture step: permission handling, preview with the
 * step's positioning guide, shutter, front/back switch and a self-timer.
 *
 * The CameraView is only mounted while `isActive` is true (screen focused,
 * step still needs a photo), so the camera hardware is released as soon as
 * the user leaves the step or the screen. Remount per step with `key`.
 */
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthButton } from '@/features/auth/components/AuthComponents';
import { GlassIconButton } from '@/features/home/components/GlassIconButton';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { Banner } from '@/shared/ui/Banner';
import type { CapturedPhoto } from '../avatarCaptureState';
import type { CameraFacing, CaptureStepConfig } from '../avatarSteps';
import { CameraIcon, FlipCameraIcon, TimerIcon } from './AvatarIcons';
import { CaptureFrame } from './CaptureFrame';
import { CaptureGuide } from './CaptureGuides';

const TIMER_OPTIONS = [0, 3, 10] as const;
type TimerSeconds = (typeof TIMER_OPTIONS)[number];

type CameraCaptureProps = {
  step: CaptureStepConfig;
  height: number;
  isActive: boolean;
  onCaptured: (photo: CapturedPhoto) => void;
};

export function CameraCapture({ step, height, isActive, onCaptured }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraFacing>(step.defaultFacing);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mountKey, setMountKey] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  async function takePhoto() {
    if (!cameraRef.current || !isReady || isCapturing) return;
    setIsCapturing(true);
    setErrorMessage(null);
    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!picture?.uri) throw new Error('Camera returned no photo');
      onCaptured({ uri: picture.uri, width: picture.width, height: picture.height });
    } catch {
      setErrorMessage("We couldn't take that photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }

  // Self-timer: tick once a second, shoot at zero. Cleared if the step unmounts.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      void takePhoto();
      return;
    }
    const tick = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(tick);
    // takePhoto reads refs/state at call time; re-running on its identity would restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Leaving the step/screen cancels a running countdown.
  useEffect(() => {
    if (!isActive) setCountdown(null);
  }, [isActive]);

  function handleShutter() {
    if (timerSeconds > 0) setCountdown(timerSeconds);
    else void takePhoto();
  }

  function cycleTimer() {
    const next = TIMER_OPTIONS[(TIMER_OPTIONS.indexOf(timerSeconds) + 1) % TIMER_OPTIONS.length];
    setTimerSeconds(next);
  }

  function flipCamera() {
    setIsReady(false);
    setFacing((current) => (current === 'front' ? 'back' : 'front'));
  }

  function retryCamera() {
    setErrorMessage(null);
    setIsReady(false);
    setMountKey((key) => key + 1);
  }

  if (!permission) {
    return (
      <CaptureFrame height={height}>
        <ActivityIndicator color="#FFFFFF" />
      </CaptureFrame>
    );
  }

  if (!permission.granted) {
    return (
      <CaptureFrame height={height} light>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <CameraIcon size={26} />
          </View>
          <Text style={styles.permissionTitle}>
            {permission.canAskAgain ? 'Allow camera access' : 'Camera access is turned off'}
          </Text>
          <Text style={styles.permissionText}>
            {permission.canAskAgain
              ? 'HALO needs your camera to take the three photos for your avatar. Photos stay on this device.'
              : 'To take your avatar photos, turn on camera access for HALO in your phone’s Settings.'}
          </Text>
          <View style={styles.permissionButton}>
            {permission.canAskAgain ? (
              <AuthButton label="Allow camera" onPress={() => void requestPermission()} />
            ) : (
              <AuthButton label="Open Settings" onPress={() => void Linking.openSettings()} />
            )}
          </View>
        </View>
      </CaptureFrame>
    );
  }

  const isBusy = !isReady || isCapturing || countdown !== null;
  const guideHeight = step.id === 'face' ? height * 0.62 : height * 0.88;

  return (
    <View style={styles.container}>
      <CaptureFrame height={height}>
        {isActive ? (
          <CameraView
            key={`${mountKey}-${facing}`}
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            // Save front-camera photos the way the user saw them in the preview.
            mirror={facing === 'front'}
            active={isActive}
            onCameraReady={() => setIsReady(true)}
            onMountError={() => setErrorMessage("The camera couldn't start. Please try again.")}
          />
        ) : null}

        <View style={styles.guide} pointerEvents="none">
          <CaptureGuide kind={step.id} height={guideHeight} />
        </View>

        {!isReady && !errorMessage ? <ActivityIndicator style={styles.loader} color="#FFFFFF" /> : null}
        {countdown !== null && countdown > 0 ? (
          <View style={styles.countdown} pointerEvents="none">
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        ) : null}
      </CaptureFrame>

      {errorMessage ? (
        <View style={styles.errorBlock}>
          <Banner tone="error" message={errorMessage} />
          <Pressable onPress={retryCamera} accessibilityRole="button" style={styles.retry}>
            <Text style={styles.retryText}>Restart camera</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.controls}>
        <View style={styles.sideControl}>
          <GlassIconButton onPress={cycleTimer} accessibilityLabel={`Self-timer ${timerSeconds ? `${timerSeconds} seconds` : 'off'}`}>
            <TimerIcon color={timerSeconds ? dashboardTheme.accent : dashboardTheme.text} />
          </GlassIconButton>
          <Text style={styles.sideLabel}>{timerSeconds ? `${timerSeconds}s` : 'Timer'}</Text>
        </View>

        <Pressable
          onPress={handleShutter}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel={`Take ${step.title.toLowerCase()} photo`}
          style={({ pressed }) => [styles.shutter, isBusy && styles.shutterBusy, pressed && styles.shutterPressed]}
        >
          <LinearGradient colors={dashboardTheme.pearlGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.shutterCore}>
            {isCapturing ? <ActivityIndicator color={dashboardTheme.plum} /> : null}
          </LinearGradient>
        </Pressable>

        <View style={styles.sideControl}>
          <GlassIconButton onPress={flipCamera} accessibilityLabel="Switch between front and back camera">
            <FlipCameraIcon />
          </GlassIconButton>
          <Text style={styles.sideLabel}>{facing === 'front' ? 'Selfie' : 'Rear'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  guide: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  loader: { position: 'absolute' },
  countdown: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  countdownText: { fontSize: 88, fontWeight: '200', color: '#FFFFFF', textShadowColor: 'rgba(60, 40, 90, 0.5)', textShadowRadius: 12 },
  errorBlock: { gap: 8 },
  retry: { alignSelf: 'center', paddingVertical: 4 },
  retryText: { fontSize: 13, fontWeight: '700', color: dashboardTheme.accent },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  sideControl: { alignItems: 'center', gap: 4, width: 64 },
  sideLabel: { fontSize: 11, fontWeight: '600', color: dashboardTheme.muted },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#B9A3E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  shutterBusy: { opacity: 0.55 },
  shutterPressed: { transform: [{ scale: 0.94 }] },
  shutterCore: { flex: 1, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  permissionCard: { alignItems: 'center', paddingHorizontal: 24, gap: 10 },
  permissionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dashboardTheme.toneChip.lilac,
  },
  permissionTitle: { fontSize: 18, fontWeight: '700', color: dashboardTheme.plum, textAlign: 'center' },
  permissionText: { fontSize: 14, lineHeight: 20, color: dashboardTheme.muted, textAlign: 'center' },
  permissionButton: { alignSelf: 'stretch', marginTop: 6 },
});
