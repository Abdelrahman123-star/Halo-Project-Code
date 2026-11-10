/**
 * Per-gender room scenes. Everything in HALO is the same for every user except
 * the bedroom and bathroom pictures: each scene is a room image plus the
 * measured positions (image fractions) of its interactive furniture, because a
 * different photo puts the wardrobe / mirror / shelves in different places.
 *
 * Male users get the male scenes; accounts with no gender saved get the
 * female scenes (the original rooms). The male bathroom has no makeup shelf
 * mark — its right shelf is part of the picture only.
 */
import type { ImageSourcePropType } from 'react-native';
import type { Gender } from '@/features/auth/schemas';
import { FEMALE_LABEL_THEME, MALE_LABEL_THEME, type RoomLabelTheme } from './roomLabelTheme';
import {
  BATHROOM_CROP_CENTER_X,
  BATHROOM_IMAGE_SIZE,
  MAKEUP_HINT_POINT,
  MAKEUP_REGION,
  SKINCARE_HINT_POINT,
  SKINCARE_REGION,
  VANITY_FRONT_Y,
  VANITY_MIRROR_HINT_POINT,
  VANITY_MIRROR_REGION,
  WALL_PANEL_TOP_Y,
} from '../bathroom/bathroomLayout';
import {
  BEDROOM_IMAGE_SIZE,
  MIRROR_HINT_POINT,
  MIRROR_REGION,
  POUF_TOP_Y,
  WARDROBE_HINT_POINT,
  WARDROBE_REGION,
  type ImagePoint,
  type ImageRegion,
} from '../bedroom/bedroomLayout';

type ImageSize = { width: number; height: number };

export type BedroomScene = {
  image: ImageSourcePropType;
  imageSize: ImageSize;
  /** Image x-fraction to centre when phones crop the sides; omitted keeps the right edge. */
  cropCenterX?: number;
  wardrobeRegion: ImageRegion;
  mirrorRegion: ImageRegion;
  /** Only `y` is used for the wardrobe hint; x is centred on the visible wardrobe. */
  wardrobeHintPoint: ImagePoint;
  /** Fine-tune (pt) for the wardrobe hint's horizontal position. */
  wardrobeHintOffsetX: number;
  mirrorHintPoint: ImagePoint;
  /** Where the wardrobe label rests (just above the pouf / floor object). */
  wardrobeLabelRestY: number;
  /** Colours of the lines, labels, boxes, icons and outlines. */
  labelTheme: RoomLabelTheme;
};

export type BathroomScene = {
  image: ImageSourcePropType;
  imageSize: ImageSize;
  cropCenterX?: number;
  skincareRegion: ImageRegion;
  mirrorRegion: ImageRegion;
  /** Null when the room has no interactive makeup shelf. */
  makeupRegion: ImageRegion | null;
  skincareHintPoint: ImagePoint;
  mirrorHintPoint: ImagePoint;
  makeupHintPoint: ImagePoint | null;
  /** Mirror / makeup labels rise to just above this line. */
  wallPanelTopY: number;
  /** Skincare label drops onto this line. */
  vanityFrontY: number;
  /** Colours of the lines, labels, boxes, icons and outlines. */
  labelTheme: RoomLabelTheme;
};

export const FEMALE_BEDROOM: BedroomScene = {
  image: require('../../../../assets/girl-bedroom.png'),
  imageSize: BEDROOM_IMAGE_SIZE,
  wardrobeRegion: WARDROBE_REGION,
  mirrorRegion: MIRROR_REGION,
  wardrobeHintPoint: WARDROBE_HINT_POINT,
  wardrobeHintOffsetX: -20,
  mirrorHintPoint: MIRROR_HINT_POINT,
  wardrobeLabelRestY: POUF_TOP_Y,
  labelTheme: FEMALE_LABEL_THEME,
};

export const FEMALE_BATHROOM: BathroomScene = {
  image: require('../../../../assets/girl-bathroom.png'),
  imageSize: BATHROOM_IMAGE_SIZE,
  cropCenterX: BATHROOM_CROP_CENTER_X,
  skincareRegion: SKINCARE_REGION,
  mirrorRegion: VANITY_MIRROR_REGION,
  makeupRegion: MAKEUP_REGION,
  skincareHintPoint: SKINCARE_HINT_POINT,
  mirrorHintPoint: VANITY_MIRROR_HINT_POINT,
  makeupHintPoint: MAKEUP_HINT_POINT,
  wallPanelTopY: WALL_PANEL_TOP_Y,
  vanityFrontY: VANITY_FRONT_Y,
  labelTheme: FEMALE_LABEL_THEME,
};

/**
 * `boy-bedroom.png` has the same composition as the girl's room (wardrobe,
 * mirror and pouf in the same places — checked by overlaying the regions), so
 * it reuses the same measurements.
 */
export const MALE_BEDROOM: BedroomScene = {
  ...FEMALE_BEDROOM,
  image: require('../../../../assets/boy-bedroom.png'),
  labelTheme: MALE_LABEL_THEME,
};

/**
 * `boy-bathroom.png`: same layout as the girl's bathroom, except its lowest
 * skincare row and counter edge sit slightly lower, and it has no makeup mark.
 */
export const MALE_BATHROOM: BathroomScene = {
  ...FEMALE_BATHROOM,
  image: require('../../../../assets/boy-bathroom.png'),
  skincareRegion: { left: 0.07, top: 0.272, width: 0.205, height: 0.265 },
  makeupRegion: null,
  makeupHintPoint: null,
  vanityFrontY: 0.548,
  labelTheme: MALE_LABEL_THEME,
};

export function bedroomSceneFor(gender: Gender | null): BedroomScene {
  return gender === 'male' ? MALE_BEDROOM : FEMALE_BEDROOM;
}

export function bathroomSceneFor(gender: Gender | null): BathroomScene {
  return gender === 'male' ? MALE_BATHROOM : FEMALE_BATHROOM;
}
