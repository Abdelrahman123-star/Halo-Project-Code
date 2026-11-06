/**
 * Create Your Avatar — guided three-photo capture (front, back, face).
 *
 * Prototype scope: photos are held in memory on this screen only. Nothing is
 * uploaded and no avatar is generated; the final stage says so plainly.
 * All stages live on this one route so moving between steps can never drop a
 * photo; leaving the screen with photos asks for confirmation first.
 */
import { useCallback, useReducer, useState } from 'react';
import { Alert, BackHandler, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import {
  avatarCaptureReducer,
  capturedCount,
  initialAvatarCaptureState,
} from '@/features/avatar/avatarCaptureState';
import { CAPTURE_STEP_ORDER, getStepConfig } from '@/features/avatar/avatarSteps';
import { usePreviewAvatar } from '@/features/avatar/hooks/usePreviewAvatar';
import { CloseIcon } from '@/features/avatar/components/AvatarIcons';
import { AvatarIntroView } from '@/features/avatar/components/AvatarIntroView';
import { AvatarReadyView } from '@/features/avatar/components/AvatarReadyView';
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
  const [isCreating, setIsCreating] = useState(false);
  const { create: createPreviewAvatar } = usePreviewAvatar();
  const { stage, photos } = state;

  // PROTOTYPE: no generation yet — finishing assigns the labelled sample preview avatar.
  async function handleCreateAvatar() {
    if (isCreating) return;
    setIsCreating(true);
    try {
      await createPreviewAvatar();
      dispatch({ type: 'finish' });
    } catch {
      Alert.alert('Something went wrong', "We couldn't save your avatar on this device. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  // Camera runs only while this screen is focused; it is released when the user navigates away.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const leave = useCallback(() => {
    const exit = () => (router.canGoBack() ? router.back() : router.replace('/(app)'));
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
          />
        );
      }
      case 'review':
        return (
          <AvatarReviewView
            photos={photos}
            onRetake={(step) => dispatch({ type: 'retake', step })}
            isCreating={isCreating}
            onCreate={() => void handleCreateAvatar()}
          />
        );
      case 'complete':
        return <AvatarReadyView onGoHome={leave} onReviewPhotos={() => dispatch({ type: 'openReview' })} />;
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
