/**
 * Digital Wardrobe Screen (`/(app)/garment`) — Reached from Bedroom.
 * Browsing is the editorial "atelier" view (WardrobeAtelier); adding a piece goes
 * through the floating pearl "+" → Add a Piece sheet → preview → analysis → save,
 * all via the existing `useGarmentAnalysis` / `useWardrobe` hooks. Tapping a piece
 * opens the existing detail / edit sheet.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GarmentPreview } from '@/features/garment/components/GarmentPreview';
import { GarmentProcessingView } from '@/features/garment/components/GarmentProcessingView';
import { useGarmentAnalysis } from '@/features/garment/hooks/useGarmentAnalysis';
import type { GarmentAnalysisResponse } from '@/features/garment/types/garment';
import { BOTTOM_NAV_CLEARANCE } from '@/features/home/components/HomeBottomNav';
import { GlassIconButton } from '@/features/home/components/GlassIconButton';
import { ChevronLeftIcon, ProfileIcon } from '@/features/home/components/HomeIcons';
import { FloatingAddButton } from '@/features/wardrobe/atelier/AtelierActions';
import { PEARL_HAIRLINE, PEARL_TINT, PEARL_WHITE } from '@/features/wardrobe/atelier/pearlWhite';
import { WardrobeAtelier } from '@/features/wardrobe/atelier/WardrobeAtelier';
import { AddPieceSheet } from '@/features/wardrobe/components/AddPieceSheet';
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

  // Reload when coming back (e.g. after editing or deleting on the All pieces screen).
  const hasFocusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnce.current) void refreshWardrobe();
      hasFocusedOnce.current = true;
    }, [refreshWardrobe]),
  );

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
  const isBrowsing = !isPreviewMode && !isProcessingMode;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

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

          <View style={styles.headerSide}>
            {isBrowsing ? (
              <GlassIconButton onPress={() => router.push('/(app)/profile')} accessibilityLabel="Open your profile" style={styles.tinted}>
                <ProfileIcon size={18} />
              </GlassIconButton>
            ) : null}
          </View>
        </View>

        {combinedError ? (
          <View style={styles.bannerWrap}>
            <Banner tone="error" message={combinedError} />
          </View>
        ) : null}

        {isBrowsing ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, styles.orbitPage]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoadingWardrobe && wardrobeItems.length > 0} onRefresh={refreshWardrobe} tintColor="#7E5FA8" />
            }
          >
            <WardrobeAtelier
              items={wardrobeItems}
              isLoading={isLoadingWardrobe}
              onOpenItem={(item) => setSelectedItemId(item.id)}
              onAddPiece={() => setIsAddSheetOpen(true)}
              onViewAll={(group) => router.push({ pathname: '/(app)/wardrobe-pieces', params: { group } })}
            />
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

      {/* Floats just above the bottom navigation; only while browsing with pieces saved
          (the empty state has its own "Add Your First Piece" button). */}
      {isBrowsing && wardrobeItems.length > 0 ? (
        <FloatingAddButton bottom={BOTTOM_NAV_CLEARANCE + 8} onPress={() => setIsAddSheetOpen(true)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Pearl-white editorial page (no lilac background on this screen).
  root: { flex: 1, backgroundColor: PEARL_WHITE },
  tinted: { backgroundColor: PEARL_TINT, borderColor: PEARL_HAIRLINE, shadowOpacity: 0 },
  safeArea: { flex: 1 },
  // Sits lower on the page, with a larger logo.
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 44, paddingBottom: 10 },
  backBtn: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22, backgroundColor: PEARL_TINT, borderWidth: 1, borderColor: PEARL_HAIRLINE },
  backBtnText: { fontSize: 13, fontWeight: '600', color: '#6B5299' },
  btnPressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  logo: { width: 136, height: 56 },
  // Same width as the back pill, so the logo stays centred.
  headerSide: { width: 84, alignItems: 'flex-end' },
  bannerWrap: { paddingHorizontal: 20, marginBottom: 6 },
  // Extra bottom room so the floating + never covers the last pieces.
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: BOTTOM_NAV_CLEARANCE + 84 },
  // The orbit is the page: centred in the space between the header and the nav.
  orbitPage: { flexGrow: 1, justifyContent: 'center' },
  previewScroll: { paddingTop: 10, paddingBottom: 110 },
});
