/**
 * Digital Wardrobe Screen (`/(app)/garment`) — Reached from Bedroom.
 * Browsing is the image-built closet (WardrobeCloset: category pills + a
 * horizontally scrolling closet with garments in its slots). "Add a Piece"
 * (first rod slot) → Add a Piece sheet →
 * preview → analysis → save, all via the existing `useGarmentAnalysis` /
 * `useWardrobe` hooks. Tapping a piece opens GarmentDetailSheet; its "Fix it"
 * opens the existing dropdown editor (WardrobeDetailModal).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GarmentPreview } from '@/features/garment/components/GarmentPreview';
import { GarmentProcessingView } from '@/features/garment/components/GarmentProcessingView';
import { useGarmentAnalysis } from '@/features/garment/hooks/useGarmentAnalysis';
import type { GarmentAnalysisResponse } from '@/features/garment/types/garment';
import { BOTTOM_NAV_CLEARANCE } from '@/features/home/components/HomeBottomNav';
import { usePreviewAvatar } from '@/features/avatar/hooks/usePreviewAvatar';
import { AddPieceSheet } from '@/features/wardrobe/components/AddPieceSheet';
import { WardrobeDetailModal } from '@/features/wardrobe/components/WardrobeDetailModal';
import { useWardrobe } from '@/features/wardrobe/hooks/useWardrobe';
import { ClosetPaletteProvider } from '@/features/wardrobe/closet/ClosetPaletteContext';
import { closetPaletteFor } from '@/features/wardrobe/closet/closetTheme';
import { GarmentDetailSheet } from '@/features/wardrobe/closet/GarmentDetailSheet';
import { WardrobeCloset } from '@/features/wardrobe/closet/WardrobeCloset';
import { WardrobeBackground, WardrobeHeader } from '@/features/wardrobe/closet/WardrobeHeader';
import { useWashState } from '@/features/wardrobe/closet/washStore';
import type { WardrobeItem } from '@/features/wardrobe/types/wardrobe';
import { useUserGender } from '@/features/profile/hooks/useUserGender';
import { Banner } from '@/shared/ui/Banner';

export default function GarmentScreen(): React.JSX.Element {
  const router = useRouter();
  // The men's closet gets its own colours (steel + navy) to match its images.
  const palette = closetPaletteFor(useUserGender());
  const [hasConfirmed, setHasConfirmed] = useState(false);
  // The detail sheet (tap a piece) and the existing editor ("Fix it", or right after saving).
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
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

  const { washIds, toggleWash } = useWashState();
  const washSet = useMemo(() => new Set(washIds), [washIds]);
  const { state: avatarState } = usePreviewAvatar();
  const hasAvatar = avatarState.status === 'ready' && avatarState.hasAvatar;

  // Reload when coming back to this screen.
  const hasFocusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnce.current) void refreshWardrobe();
      hasFocusedOnce.current = true;
    }, [refreshWardrobe]),
  );

  const findItem = (id: string | null) => (id ? wardrobeItems.find((i) => i.id === id) ?? null : null);
  const selectedItem = findItem(selectedItemId);
  const editingItem = findItem(editingItemId);

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
    if (saved) setEditingItemId(saved.id);
  }

  const combinedError = !isProcessingMode ? analysisError || wardrobeError : null;
  const isBrowsing = !isPreviewMode && !isProcessingMode;

  return (
    <ClosetPaletteProvider palette={palette}>
      <View style={[styles.root, { backgroundColor: palette.base }]}>
        <StatusBar style="dark" />
        <WardrobeBackground />

        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <WardrobeHeader
            backLabel={isPreviewMode || isProcessingMode ? 'Back' : 'Bedroom'}
            onBack={handleBack}
            onOpenProfile={isBrowsing ? () => router.push('/(app)/profile') : null}
          />

          {combinedError ? (
            <View style={styles.bannerWrap}>
              <Banner tone="error" message={combinedError} />
            </View>
          ) : null}

          {isBrowsing ? (
            <View style={styles.closetArea}>
              <WardrobeCloset
                items={wardrobeItems}
                isLoading={isLoadingWardrobe}
                washIds={washSet}
                onRefresh={() => void refreshWardrobe()}
                onOpenItem={(item) => setSelectedItemId(item.id)}
                onAddPiece={() => setIsAddSheetOpen(true)}
              />
            </View>
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
              onEditSavedItem={(item) => setEditingItemId(item.id)}
              onManualSave={handleManualSave}
            />
          ) : null}

          <GarmentDetailSheet
            item={selectedItem}
            onClose={() => setSelectedItemId(null)}
            onEdit={(item) => setEditingItemId(item.id)}
            // Try-on needs an avatar: open it if there is one, otherwise start creating it.
            onTryOn={() => router.push(hasAvatar ? '/(app)/avatar' : '/(app)/create-avatar')}
            onDelete={removeItem}
            isInWash={selectedItem ? washSet.has(selectedItem.id) : false}
            onToggleWash={toggleWash}
          />

          <WardrobeDetailModal
            visible={Boolean(editingItem)}
            item={editingItem}
            onClose={() => setEditingItemId(null)}
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
    </ClosetPaletteProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  bannerWrap: { paddingHorizontal: 20, marginBottom: 6 },
  // The closet fills what's left above the floating bottom navigation.
  closetArea: { flex: 1, paddingTop: 4, paddingBottom: BOTTOM_NAV_CLEARANCE },
  // Clears the floating bottom navigation so the preview's buttons stay tappable.
  previewScroll: { paddingTop: 10, paddingBottom: BOTTOM_NAV_CLEARANCE + 24 },
});
