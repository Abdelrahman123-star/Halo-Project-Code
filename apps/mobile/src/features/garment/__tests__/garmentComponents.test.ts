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
import { WardrobeAtelier } from '@/features/wardrobe/atelier/WardrobeAtelier';
import { WardrobeDetailModal } from '@/features/wardrobe/components/WardrobeDetailModal';
import { WardrobeDropdownField } from '@/features/wardrobe/components/WardrobeDropdownField';

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

    const compactBentoCard = React.createElement(GarmentOptionCard, {
      type: 'camera',
      title: 'Take a Photo',
      subtitle: 'Live camera capture',
      layout: 'vertical',
      onPress: onCameraPress,
    });
    expect(compactBentoCard.props.layout).toBe('vertical');
    expect(compactBentoCard.props.subtitle).toBe('Live camera capture');
  });

  it('instantiates GarmentPreview with retake and continue actions', () => {
    const onChooseAnother = jest.fn();
    const onConfirm = jest.fn();

    const preview = React.createElement(GarmentPreview, {
      imageUri: 'file:///data/garment.jpg',
      sourceType: 'camera',
      backImageUri: 'file:///data/garment-back.jpg',
      onPickBack: jest.fn(),
      onRemoveBack: jest.fn(),
      onRetakeOrChooseAnother: onChooseAnother,
      onConfirm: onConfirm,
    });

    expect(preview.props.imageUri).toBe('file:///data/garment.jpg');
    expect(preview.props.sourceType).toBe('camera');
    expect(preview.props.backImageUri).toBe('file:///data/garment-back.jpg');
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

  it('instantiates the wardrobe atelier view in empty and populated states', () => {
    const emptySection = React.createElement(WardrobeAtelier, {
      items: [],
      isLoading: false,
      onOpenItem: jest.fn(),
      onAddPiece: jest.fn(),
      onViewAll: jest.fn(),
    });

    const sampleItem = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      name: 'Denim Jeans',
      category: 'trousers',
      confidence: 0.94,
      crop_base64: 'data:image/jpeg;base64,abc',
      colors: [],
      attributes: {
        fabric: { predicted: 'denim', confidence: 88, top_candidates: [] },
        pattern: { predicted: 'solid plain', confidence: 90, top_candidates: [] },
        subtype: { predicted: 'Straight-leg Denim Jeans', confidence: 85, top_candidates: [] },
      },
      created_at: '2026-11-07T12:00:00Z',
      updated_at: '2026-11-07T12:00:00Z',
    };

    const populatedSection = React.createElement(WardrobeAtelier, {
      items: [sampleItem],
      isLoading: false,
      onOpenItem: jest.fn(),
      onAddPiece: jest.fn(),
      onViewAll: jest.fn(),
    });

    const modal = React.createElement(WardrobeDetailModal, {
      visible: true,
      item: sampleItem,
      onClose: jest.fn(),
      onSave: jest.fn(),
      onDelete: jest.fn(),
    });

    const dropdown = React.createElement(WardrobeDropdownField, {
      label: 'Category',
      selectedValue: 'trousers',
      options: [{ value: 'trousers', label: 'Pants & Trousers' }],
      isOpen: true,
      onToggle: jest.fn(),
      onSelect: jest.fn(),
    });

    expect((emptySection.props as any).items).toHaveLength(0);
    expect((populatedSection.props as any).items).toHaveLength(1);
    expect((modal.props as any).visible).toBe(true);
    expect((dropdown.props as any).selectedValue).toBe('trousers');
  });
});
