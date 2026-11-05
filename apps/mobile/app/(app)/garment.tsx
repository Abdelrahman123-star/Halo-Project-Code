/**
 * GarmentStudioScreen (`/(app)/garment`).
 * Luxury pearlescent garment capture, preview, and AI recognition flow.
 * Combines HALO's refined pastel visual identity with in-memory garment analysis.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FrostedGlassCard } from '@/features/garment/components/FrostedGlassCard';
import { GarmentOptionCard } from '@/features/garment/components/GarmentOptionCard';
import { GarmentPreview } from '@/features/garment/components/GarmentPreview';
import { GarmentProcessingView } from '@/features/garment/components/GarmentProcessingView';
import { HaloHeader } from '@/features/garment/components/HaloHeader';
import { PearlescentBackground } from '@/features/garment/components/PearlescentBackground';
import { PhotoCaptureGuide } from '@/features/garment/components/PhotoCaptureGuide';
import { WardrobeHangerDecor } from '@/features/garment/components/WardrobeHangerDecor';
import { useGarmentAnalysis } from '@/features/garment/hooks/useGarmentAnalysis';
import { Banner } from '@/shared/ui/Banner';
import { luxuryPastel } from '@/shared/theme/tokens';

export default function GarmentScreen(): React.JSX.Element {
  const router = useRouter();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const screenFadeAnim = useRef(new Animated.Value(0)).current;

  const {
    imageUri,
    sourceType,
    isLoading,
    statusText,
    error,
    result,
    pickFromCamera,
    pickFromGallery,
    runAnalysis,
    clearError,
    reset,
  } = useGarmentAnalysis();

  useEffect(() => {
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [screenFadeAnim]);

  function handleBack() {
    if (hasConfirmed && !isLoading) {
      setHasConfirmed(false);
      return;
    }
    if (imageUri) {
      reset();
      setHasConfirmed(false);
      return;
    }
    router.back();
  }

  function handleChooseAnother() {
    reset();
    setHasConfirmed(false);
  }

  async function handleConfirmAndAnalyze() {
    setHasConfirmed(true);
    await runAnalysis();
  }

  function handleFullReset() {
    reset();
    setHasConfirmed(false);
  }

  // Determine active view mode
  const isPreviewMode = Boolean(imageUri && !hasConfirmed);
  const isProcessingMode = Boolean(hasConfirmed);

  return (
    <View style={styles.container}>
      <PearlescentBackground />

      <HaloHeader onBack={handleBack} />

      <Animated.View style={[{ opacity: screenFadeAnim }, styles.screenContent]}>
        {error && !isProcessingMode ? (
          <View style={styles.bannerWrapper}>
            <Banner
              tone="error"
              message={error}
            />
          </View>
        ) : null}

        {/* View 1: Main Selection Mode */}
        {!isPreviewMode && !isProcessingMode ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Heading */}
            <View style={styles.headingBox}>
              <Text style={styles.mainTitle}>Add to Your Wardrobe</Text>
              <Text style={styles.mainSubtitle}>
                Let's bring your favorite pieces into your digital closet.
              </Text>
              <WardrobeHangerDecor />
            </View>

            {/* Selection Cards */}
            <View style={styles.cardsContainer}>
              <GarmentOptionCard
                type="camera"
                title="Take a Photo"
                subtitle="Capture your clothing item directly using your camera."
                onPress={pickFromCamera}
              />

              <GarmentOptionCard
                type="gallery"
                title="Choose from Gallery"
                subtitle="Select a clothing photo already saved on your device."
                onPress={pickFromGallery}
              />
            </View>

            {/* Garment Capture Guide */}
            <PhotoCaptureGuide />
          </ScrollView>
        ) : null}

        {/* View 2: Image Preview Mode */}
        {isPreviewMode ? (
          <ScrollView
            contentContainerStyle={styles.previewScroll}
            showsVerticalScrollIndicator={false}
          >
            <GarmentPreview
              imageUri={imageUri!}
              sourceType={sourceType}
              onRetakeOrChooseAnother={handleChooseAnother}
              onConfirm={handleConfirmAndAnalyze}
              isLoading={isLoading}
            />
          </ScrollView>
        ) : null}

        {/* View 3: Processing & Results Mode */}
        {isProcessingMode ? (
          <GarmentProcessingView
            isLoading={isLoading}
            statusText={statusText}
            error={error}
            result={result}
            onRetry={runAnalysis}
            onReset={handleFullReset}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  screenContent: {
    flex: 1,
  },
  bannerWrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  previewScroll: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  headingBox: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: luxuryPastel.textMauve,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: luxuryPastel.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    width: '100%',
    marginVertical: 4,
    gap: 8,
  },
});
