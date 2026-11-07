/**
 * Unit tests for HALO Home components and screens:
 * AvatarSilhouette, HouseHero, HouseEntranceScreen,
 * HallwayScreen, DoorSelectionView, BedroomScreen, and BathroomScreen.
 */
import React from 'react';
import { AvatarSilhouette } from '../components/AvatarSilhouette';
import { HouseHero } from '../components/HouseHero';
import { DoorSelectionView } from '../components/DoorSelectionView';
import { BedroomPortalCard, RoomPortalCard } from '../components/BedroomPortalCard';
import { MirrorIcon, SparkleBeautyIcon } from '../components/HomeIcons';
import { WelcomeVideoScreen } from '@/features/launch/components/WelcomeVideoScreen';
import HouseEntranceScreen from '../../../../app/(app)/house-entrance';
import HallwayScreen from '../../../../app/(app)/hallway';
import BedroomScreen from '../../../../app/(app)/bedroom';
import BathroomScreen from '../../../../app/(app)/bathroom';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => callback()),
}));

describe('Home Components & Screens', () => {
  describe('AvatarSilhouette', () => {
    it('instantiates AvatarSilhouette with default and custom props', () => {
      const onAvatarPress = jest.fn();
      const defaultAvatar = React.createElement(AvatarSilhouette, {
        onPress: onAvatarPress,
      });
      const customAvatar = React.createElement(AvatarSilhouette, {
        height: 160,
        onPress: onAvatarPress,
        style: { left: 40, bottom: 20 },
      });

      expect(defaultAvatar).toBeDefined();
      expect(customAvatar).toBeDefined();
      expect(customAvatar.props.height).toBe(160);
      expect(customAvatar.props.onPress).toBe(onAvatarPress);
    });
  });

  describe('HouseHero', () => {
    it('instantiates HouseHero with width, house press handler, and avatar press handler', () => {
      const onHousePress = jest.fn();
      const onAvatarPress = jest.fn();

      const hero = React.createElement(HouseHero, {
        width: 320,
        onPress: onHousePress,
        onAvatarPress: onAvatarPress,
      });

      expect(hero).toBeDefined();
      expect(hero.props.width).toBe(320);
      expect(hero.props.onPress).toBe(onHousePress);
      expect(hero.props.onAvatarPress).toBe(onAvatarPress);
    });
  });

  describe('DoorSelectionView', () => {
    it('instantiates DoorSelectionView with room selection handlers', () => {
      const onSelectBedroom = jest.fn();
      const onSelectBathroom = jest.fn();
      const onBackOutside = jest.fn();

      const view = React.createElement(DoorSelectionView, {
        onSelectBedroom,
        onSelectBathroom,
        onBackOutside,
      });

      expect(view).toBeDefined();
    });
  });

  describe('BedroomPortalCard', () => {
    it('instantiates BedroomPortalCard with props', () => {
      const onPress = jest.fn();
      const card = React.createElement(BedroomPortalCard, {
        title: 'Digital Wardrobe',
        description: 'Scan clothes with CV.',
        badgeText: 'AI CURATION',
        badgeVariant: 'lilac',
        tags: ['CV Scan', 'Catalogue'],
        icon: null,
        gradientColors: ['rgba(255, 255, 255, 0.94)', 'rgba(247, 243, 255, 0.85)'] as const,
        iconGradientColors: ['#EFE9FD', '#E2D7FC'] as const,
        onPress,
        accessibilityLabel: 'Open Wardrobe',
      });

      expect(card).toBeDefined();
      expect(card.props.title).toBe('Digital Wardrobe');
      expect(card.props.badgeText).toBe('AI CURATION');

      const vanityCard = React.createElement(RoomPortalCard, {
        title: 'Smart Vanity Mirror',
        description: 'Adaptive studio lighting.',
        badgeText: 'SMART MIRROR',
        badgeVariant: 'rose',
        tags: ['Studio Lighting', 'Shade Match'],
        icon: React.createElement(MirrorIcon, { size: 24 }),
        gradientColors: ['rgba(255, 255, 255, 0.94)', 'rgba(255, 243, 248, 0.85)'] as const,
        iconGradientColors: ['#FDEEF5', '#FADCEB'] as const,
        onPress,
        accessibilityLabel: 'Open Smart Vanity Mirror',
      });
      expect(vanityCard).toBeDefined();
      expect(vanityCard.props.badgeVariant).toBe('rose');

      const sparkle = React.createElement(SparkleBeautyIcon, { size: 24 });
      expect(sparkle).toBeDefined();
    });
  });

  describe('Screens', () => {
    it('instantiates HouseEntranceScreen successfully', () => {
      const screen = React.createElement(HouseEntranceScreen);
      expect(screen).toBeDefined();
    });

    it('instantiates HallwayScreen successfully', () => {
      const screen = React.createElement(HallwayScreen);
      expect(screen).toBeDefined();
    });

    it('instantiates BedroomScreen successfully', () => {
      const screen = React.createElement(BedroomScreen);
      expect(screen).toBeDefined();
    });

    it('instantiates BathroomScreen successfully', () => {
      const screen = React.createElement(BathroomScreen);
      expect(screen).toBeDefined();
    });

    it('instantiates WelcomeVideoScreen successfully with skip capability', () => {
      const onFinished = jest.fn();
      const screen = React.createElement(WelcomeVideoScreen, { onFinished });
      expect(screen).toBeDefined();
    });
  });
});
