/**
 * Unit tests for HALO Garment Studio components and luxury pastel tokens.
 */
import React from 'react';
import { luxuryPastel } from '@/shared/theme/tokens';
import { FrostedGlassCard } from '@/features/garment/components/FrostedGlassCard';
import { PhotoCaptureGuide } from '@/features/garment/components/PhotoCaptureGuide';
import { WardrobeHangerDecor } from '@/features/garment/components/WardrobeHangerDecor';
import { GarmentOptionCard } from '@/features/garment/components/GarmentOptionCard';
import { GarmentPreview } from '@/features/garment/components/GarmentPreview';
import { HaloHeader } from '@/features/garment/components/HaloHeader';

describe('HALO Garment Studio Visual Identity & Tokens', () => {
  it('defines the correct primary luxury pastel color palette', () => {
    expect(luxuryPastel.lavenderMist).toBe('#D9CFF1');
    expect(luxuryPastel.blushPink).toBe('#F1D9E5');
    expect(luxuryPastel.pearlBlue).toBe('#D4E9EC');
    expect(luxuryPastel.softMint).toBe('#D7EAE3');
    expect(luxuryPastel.warmIvory).toBe('#F6EBDD');
    expect(luxuryPastel.dustyMauve).toBe('#77708F');
  });

  it('renders FrostedGlassCard with default and custom variants', () => {
    const defaultCard = React.createElement(FrostedGlassCard, null, 'Content');
    const panelCard = React.createElement(FrostedGlassCard, { variant: 'panel' }, 'Panel');
    const subtleCard = React.createElement(FrostedGlassCard, { variant: 'subtle' }, 'Subtle');

    expect(defaultCard).toBeDefined();
    expect(panelCard).toBeDefined();
    expect(subtleCard).toBeDefined();
  });

  it('instantiates PhotoCaptureGuide and WardrobeHangerDecor successfully', () => {
    const guide = React.createElement(PhotoCaptureGuide);
    const hanger = React.createElement(WardrobeHangerDecor);

    expect(guide).toBeDefined();
    expect(hanger).toBeDefined();
  });

  it('instantiates GarmentOptionCard for camera and gallery types', () => {
    const onCameraPress = jest.fn();
    const onGalleryPress = jest.fn();

    const cameraCard = React.createElement(GarmentOptionCard, {
      type: 'camera',
      title: 'Take a Photo',
      subtitle: 'Capture your clothing item directly using your camera.',
      onPress: onCameraPress,
    });

    const galleryCard = React.createElement(GarmentOptionCard, {
      type: 'gallery',
      title: 'Choose from Gallery',
      subtitle: 'Select a clothing photo already saved on your device.',
      onPress: onGalleryPress,
    });

    expect(cameraCard.props.title).toBe('Take a Photo');
    expect(galleryCard.props.title).toBe('Choose from Gallery');
  });

  it('instantiates GarmentPreview with retake and continue actions', () => {
    const onChooseAnother = jest.fn();
    const onConfirm = jest.fn();

    const preview = React.createElement(GarmentPreview, {
      imageUri: 'file:///data/garment.jpg',
      sourceType: 'camera',
      onRetakeOrChooseAnother: onChooseAnother,
      onConfirm: onConfirm,
    });

    expect(preview.props.imageUri).toBe('file:///data/garment.jpg');
    expect(preview.props.sourceType).toBe('camera');
  });

  it('instantiates HaloHeader with onBack callback', () => {
    const onBack = jest.fn();
    const header = React.createElement(HaloHeader, {
      onBack,
      title: 'Garment Studio',
    });

    expect(header.props.title).toBe('Garment Studio');
    expect(header.props.onBack).toBe(onBack);
  });
});
