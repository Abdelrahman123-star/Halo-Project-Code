import { readGender } from '@/features/profile/hooks/useUserGender';
import {
  bathroomSceneFor,
  bedroomSceneFor,
  FEMALE_BATHROOM,
  FEMALE_BEDROOM,
  MALE_BATHROOM,
  MALE_BEDROOM,
} from '../rooms/roomScenes';
import { FEMALE_LABEL_THEME, MALE_LABEL_THEME } from '../rooms/roomLabelTheme';

describe('readGender', () => {
  it('reads female / male from sign-up metadata', () => {
    expect(readGender({ gender: 'female' })).toBe('female');
    expect(readGender({ gender: 'male' })).toBe('male');
  });

  it('is null when missing or unrecognised', () => {
    expect(readGender(undefined)).toBeNull();
    expect(readGender({})).toBeNull();
    expect(readGender({ gender: 'other' })).toBeNull();
  });
});

describe('room scenes', () => {
  it('gives female users the female rooms', () => {
    expect(bedroomSceneFor('female')).toBe(FEMALE_BEDROOM);
    expect(bathroomSceneFor('female')).toBe(FEMALE_BATHROOM);
  });

  it('falls back to the female rooms when gender is unknown', () => {
    expect(bedroomSceneFor(null)).toBe(FEMALE_BEDROOM);
    expect(bathroomSceneFor(null)).toBe(FEMALE_BATHROOM);
  });

  it('gives male users the male rooms', () => {
    expect(bedroomSceneFor('male')).toBe(MALE_BEDROOM);
    expect(bathroomSceneFor('male')).toBe(MALE_BATHROOM);
    expect(MALE_BEDROOM.image).not.toBe(FEMALE_BEDROOM.image);
    expect(MALE_BATHROOM.image).not.toBe(FEMALE_BATHROOM.image);
  });

  it('has a makeup mark only in the female bathroom', () => {
    expect(FEMALE_BATHROOM.makeupRegion).not.toBeNull();
    expect(MALE_BATHROOM.makeupRegion).toBeNull();
    expect(MALE_BATHROOM.makeupHintPoint).toBeNull();
  });

  it('styles the marks with each room set\'s own colours', () => {
    expect(FEMALE_BEDROOM.labelTheme).toBe(FEMALE_LABEL_THEME);
    expect(FEMALE_BATHROOM.labelTheme).toBe(FEMALE_LABEL_THEME);
    expect(MALE_BEDROOM.labelTheme).toBe(MALE_LABEL_THEME);
    expect(MALE_BATHROOM.labelTheme).toBe(MALE_LABEL_THEME);
  });
});
