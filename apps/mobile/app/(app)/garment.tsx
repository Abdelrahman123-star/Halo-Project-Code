/**
 * Digital Wardrobe Screen (`/(app)/garment`) — Reached from Bedroom.
 * Redesigned with `ui-ux-pro-max`: frosted pastel capture cards, capture tip banner,
 * inline Saved Garments Bento grid + empty state, Garment Detail & Dropdown Edit Modal,
 * and automatic backend persistence via `useWardrobe` (Supabase RLS + local cache).
 */
import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { GarmentPreview } from '@/features/garment/components/GarmentPreview';
import { GarmentProcessingView } from '@/features/garment/components/GarmentProcessingView';
import { useGarmentAnalysis } from '@/features/garment/hooks/useGarmentAnalysis';
import type { GarmentAnalysisResponse } from '@/features/garment/types/garment';
import { FadeInView } from '@/features/home/components/FadeInView';
import { ChevronLeftIcon } from '@/features/home/components/HomeIcons';
import { AddPieceSheet } from '@/features/wardrobe/components/AddPieceSheet';
import { SavedWardrobeSection } from '@/features/wardrobe/components/SavedWardrobeSection';
import { WardrobeDetailModal } from '@/features/wardrobe/components/WardrobeDetailModal';
import { useWardrobe } from '@/features/wardrobe/hooks/useWardrobe';
import type { WardrobeItem } from '@/features/wardrobe/types/wardrobe';
import { Banner } from '@/shared/ui/Banner';

export default function GarmentScreen(): React.JSX.Element {
  const router = useRouter();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [savedBatch, setSavedBatch] = useState<WardrobeItem[]>([]);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const lastSavedResultRef = useRef<GarmentAnalysisResponse | null>(null);

  const {
    imageUri, imageBase64, sourceType, isLoading: isAnalyzing, statusText,
    error: analysisError, result, pickFromCamera, pickFromGallery, runAnalysis, reset,
    backImageUri, pickBackPhoto, clearBackPhoto,
  } = useGarmentAnalysis();

  const {
    items: wardrobeItems, isLoading: isLoadingWardrobe, isSavingBatch,
    error: wardrobeError, refreshWardrobe, saveAllGarments, saveManualPhoto, editItem, removeItem,
  } = useWardrobe();

  useEffect(() => {
    if (result && result !== lastSavedResultRef.current && result.garments.length > 0) {
      lastSavedResultRef.current = result;
      void saveAllGarments(result.garments).then(setSavedBatch);
    }
  }, [result, saveAllGarments]);

  const activeModalItem = selectedItemId
    ? wardrobeItems.find((i) => i.id === selectedItemId) ?? null
    : null;

  const isPreviewMode = Boolean(imageUri && !hasConfirmed);
  const isProcessingMode = Boolean(hasConfirmed);

  function handleBack() {
    if (hasConfirmed && !isAnalyzing) {
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

  function handleFullReset() {
    reset();
    setHasConfirmed(false);
    setSavedBatch([]);
  }

  async function handleConfirmAndAnalyze() {
    setSavedBatch([]);
    setHasConfirmed(true);
    await runAnalysis();
  }

  async function handleManualSave() {
    const dataUri = imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : imageUri ?? '';
    if (!dataUri) return;
    const saved = await saveManualPhoto(dataUri);
    handleFullReset();
    if (saved) setSelectedItemId(saved.id);
  }

  const combinedError = !isProcessingMode ? analysisError || wardrobeError : null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <PastelBlobBackground animated={false} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          >
            <ChevronLeftIcon size={18} color="#6B5299" />
            <Text style={styles.backBtnText}>
              {isPreviewMode || isProcessingMode ? 'Back' : 'Bedroom'}
            </Text>
          </Pressable>

          <Image
            source={require('../../assets/halo-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="HALO Logo"
          />

          <View style={styles.headerSpacer} />
        </View>

        {combinedError ? (
          <View style={styles.bannerWrap}>
            <Banner tone="error" message={combinedError} />
          </View>
        ) : null}

        {!isPreviewMode && !isProcessingMode ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Capture options + tips live in the Add a Piece sheet; the page is the wardrobe. */}
            <FadeInView fromTranslateY={8}>
              <SavedWardrobeSection
                items={wardrobeItems}
                isLoading={isLoadingWardrobe}
                onRefresh={refreshWardrobe}
                onSelectItem={(item) => setSelectedItemId(item.id)}
                onTakeFirstPhoto={() => setIsAddSheetOpen(true)}
                onAddPiece={() => setIsAddSheetOpen(true)}
              />
            </FadeInView>
          </ScrollView>
        ) : null}

        {isPreviewMode && imageUri ? (
          <ScrollView contentContainerStyle={styles.previewScroll} showsVerticalScrollIndicator={false}>
            <GarmentPreview
              imageUri={imageUri}
              sourceType={sourceType}
              backImageUri={backImageUri}
              onPickBack={(source) => void pickBackPhoto(source)}
              onRemoveBack={clearBackPhoto}
              onRetakeOrChooseAnother={handleFullReset}
              onConfirm={handleConfirmAndAnalyze}
              isLoading={isAnalyzing}
            />
          </ScrollView>
        ) : null}

        {isProcessingMode ? (
          <GarmentProcessingView
            isLoading={isAnalyzing}
            isSaving={isSavingBatch}
            statusText={statusText}
            error={analysisError}
            result={result}
            savedBatch={savedBatch}
            onRetry={runAnalysis}
            onReset={handleFullReset}
            onEditSavedItem={(item) => setSelectedItemId(item.id)}
            onManualSave={handleManualSave}
          />
        ) : null}

        <WardrobeDetailModal
          visible={Boolean(activeModalItem)}
          item={activeModalItem}
          onClose={() => setSelectedItemId(null)}
          onSave={editItem}
          onDelete={removeItem}
        />

        <AddPieceSheet
          visible={isAddSheetOpen}
          onClose={() => setIsAddSheetOpen(false)}
          onTakePhoto={() => void pickFromCamera()}
          onChooseFromGallery={() => void pickFromGallery()}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  safeArea: { flex: 1 },
  // Sits lower on the page, with a larger logo.
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 14 },
  backBtn: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.76)', borderWidth: 1.2, borderColor: 'rgba(255, 255, 255, 0.95)', shadowColor: '#8C78B3', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  backBtnText: { fontSize: 13, fontWeight: '600', color: '#6B5299' },
  btnPressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  logo: { width: 136, height: 56 },
  headerSpacer: { width: 84 },
  bannerWrap: { paddingHorizontal: 20, marginBottom: 6 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110, gap: 10 },
  previewScroll: { paddingTop: 10, paddingBottom: 110 },
});
