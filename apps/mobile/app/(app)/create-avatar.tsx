/**
 * Create Your Avatar — guided three-photo capture (front, back, face), consent,
 * server-side preprocessing (body + face profile) and results.
 *
 * Photos stay in memory on this screen and are deleted from the app cache when
 * the user leaves. With consent they are uploaded once to the HALO backend, which
 * analyses and discards them and saves only the derived profile. The 3D avatar is
 * still the labelled preview image; the profile is input for future 3D work.
 */
import { useCallback, useReducer, useState } from 'react';
import { Alert, BackHandler, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { deleteLocalPhotoFiles } from '@/features/avatar/api/avatarApi';
import { measurementsFromResponse } from '@/features/avatar/avatarProfileStore';
import {
  avatarCaptureReducer,
  capturedCount,
  completePhotos,
  initialAvatarCaptureState,
} from '@/features/avatar/avatarCaptureState';
import { CAPTURE_STEP_ORDER, getStepConfig, type CaptureStepId } from '@/features/avatar/avatarSteps';
import { useAvatarPreprocessing } from '@/features/avatar/hooks/useAvatarPreprocessing';
import { usePreviewAvatar } from '@/features/avatar/hooks/usePreviewAvatar';
import { CloseIcon } from '@/features/avatar/components/AvatarIcons';
import { AvatarConsentView } from '@/features/avatar/components/AvatarConsentView';
import { AvatarIntroView } from '@/features/avatar/components/AvatarIntroView';
import { AvatarProcessingView } from '@/features/avatar/components/AvatarProcessingView';
import { AvatarReadyView } from '@/features/avatar/components/AvatarReadyView';
import { AvatarResultsView } from '@/features/avatar/components/AvatarResultsView';
import { AvatarReviewView } from '@/features/avatar/components/AvatarReviewView';
import { CaptureProgress } from '@/features/avatar/components/CaptureProgress';
import { CaptureStepView } from '@/features/avatar/components/CaptureStepView';
import { FadeInView } from '@/features/home/components/FadeInView';
import { GlassIconButton } from '@/features/home/components/GlassIconButton';
import { ChevronLeftIcon } from '@/features/home/components/HomeIcons';

const GUTTER = 20;

export default function CreateAvatarScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [state, dispatch] = useReducer(avatarCaptureReducer, initialAvatarCaptureState);
  const [isFocused, setIsFocused] = useState(true);
  const { create: createPreviewAvatar } = usePreviewAvatar();
  const { state: preprocessing, run: runPreprocessing } = useAvatarPreprocessing();
  const { stage, photos } = state;

  async function analysePhotos() {
    const allPhotos = completePhotos(photos);
    if (!allPhotos) return;
    const outcome = await runPreprocessing(allPhotos);
    if (outcome.kind === 'success') {
      // The profile is saved server-side; this on-device flag keeps Home showing the (preview) avatar.
      await createPreviewAvatar().catch(() => undefined);
    }
    dispatch({ type: 'processingFinished' });
  }

  function handleConsent() {
    dispatch({ type: 'consentAccepted' });
    void analysePhotos();
  }

  function handleRetry() {
    dispatch({ type: 'retryProcessing' });
    void analysePhotos();
  }

  async function pickFromLibrary(step: CaptureStepId) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow access to your photos in Settings to choose a picture.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    const asset = picked.canceled ? undefined : picked.assets[0];
    if (asset) dispatch({ type: 'photoTaken', step, photo: { uri: asset.uri, width: asset.width, height: asset.height } });
  }

  // Camera runs only while this screen is focused; it is released when the user navigates away.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const leave = useCallback(() => {
    // The upload is in flight; leaving now would hide its result.
    if (stage.kind === 'processing') return;
    const exit = () => {
      deleteLocalPhotoFiles(Object.values(photos).map((photo) => photo.uri));
      if (router.canGoBack()) router.back();
      else router.replace('/(app)');
    };
    if (capturedCount(photos) === 0 || stage.kind === 'complete') {
      exit();
      return;
    }
    Alert.alert(
      'Leave avatar setup?',
      'Your photos are only kept while you are on this screen, so they will be discarded.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: exit },
      ],
    );
  }, [photos, router, stage.kind]);

  const handleBack = useCallback(() => {
    if (stage.kind === 'intro') leave();
    else dispatch({ type: 'back' });
  }, [leave, stage.kind]);

  // Android hardware back walks backwards through the flow instead of leaving.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });
      return () => subscription.remove();
    }, [handleBack]),
  );

  const frameHeight = Math.min((width - GUTTER * 2) * (4 / 3), height * 0.5);
  const currentStep = stage.kind === 'capture' ? stage.step : null;
  const showProgress = stage.kind === 'capture' || stage.kind === 'review';

  function renderStage() {
    switch (stage.kind) {
      case 'intro':
        return <AvatarIntroView hasPhotos={capturedCount(photos) > 0} onStart={() => dispatch({ type: 'start' })} />;
      case 'capture': {
        const step = getStepConfig(stage.step);
        const othersDone = CAPTURE_STEP_ORDER.every((id) => id === stage.step || photos[id] !== undefined);
        return (
          <CaptureStepView
            step={step}
            photo={photos[stage.step]}
            frameHeight={frameHeight}
            cameraActive={isFocused}
            isLastMissing={othersDone}
            onCaptured={(photo) => dispatch({ type: 'photoTaken', step: stage.step, photo })}
            onRetake={() => dispatch({ type: 'retake', step: stage.step })}
            onConfirm={() => dispatch({ type: 'confirmStep', step: stage.step })}
            onPickFromLibrary={() => void pickFromLibrary(stage.step)}
          />
        );
      }
      case 'review':
        return (
          <AvatarReviewView
            photos={photos}
            onRetake={(step) => dispatch({ type: 'retake', step })}
            onCreate={() => dispatch({ type: 'requestCreate' })}
          />
        );
      case 'consent':
        return <AvatarConsentView onAccept={handleConsent} onDecline={() => dispatch({ type: 'back' })} />;
      case 'processing':
        return <AvatarProcessingView phase={preprocessing.kind === 'running' ? preprocessing.phase : 'preparing'} />;
      case 'results':
        if (preprocessing.kind === 'success') {
          return (
            <AvatarResultsView outcome="success" result={preprocessing.result} onFinish={() => dispatch({ type: 'finish' })} />
          );
        }
        return (
          <AvatarResultsView
            outcome="failed"
            failure={
              preprocessing.kind === 'failed'
                ? preprocessing.failure
                : { code: 'unknown', message: 'Something went wrong. Please try again.', validation: null }
            }
            onRetake={(step) => dispatch({ type: 'retake', step })}
            onRetry={handleRetry}
            onBackToPhotos={() => dispatch({ type: 'back' })}
          />
        );
      case 'complete':
        return (
          <AvatarReadyView
            measurements={preprocessing.kind === 'success' ? measurementsFromResponse(preprocessing.result) : null}
            onGoHome={leave}
            onReviewPhotos={() => dispatch({ type: 'openReview' })}
          />
        );
    }
  }

  return (
    <View style={styles.root}>
      {/* Swipe-back would skip the "discard photos?" confirmation. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <StatusBar style="dark" />
      <PastelBlobBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <GlassIconButton onPress={handleBack} accessibilityLabel="Back">
            <ChevronLeftIcon />
          </GlassIconButton>
          <GlassIconButton onPress={leave} accessibilityLabel="Close and return home">
            <CloseIcon />
          </GlassIconButton>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {showProgress ? (
            <CaptureProgress
              photos={photos}
              currentStep={currentStep}
              onSelectStep={(step) => dispatch({ type: 'goToStep', step })}
            />
          ) : null}

          {/* Keyed by stage so each stage gets the gentle entrance. */}
          <FadeInView key={currentStep ?? stage.kind} fromTranslateY={14}>
            {renderStage()}
          </FadeInView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  safeArea: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 8 },
  content: { paddingHorizontal: GUTTER, paddingTop: 12, paddingBottom: 40, gap: 20 },
});
