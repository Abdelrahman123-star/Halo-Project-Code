/**
 * Colours for a room's interactive marks: the callout lines ("arrows"), the
 * label text, the label boxes, the icons and the furniture outline.
 * Each room scene picks one (see roomScenes.ts), so the men's and women's
 * rooms can be styled separately. Edit the values below to restyle a set.
 */
export type RoomLabelTheme = {
  /** Callout line + the bend leading into the label. */
  line: string;
  /** Label text and the small dot at the bend. */
  labelText: string;
  /** Label box fill. */
  boxBackground: string;
  /** Label box edge. */
  boxBorder: string;
  /** Hint icons (hanger, avatar, bottle, face scan) and the back button. */
  icon: string;
  /** Faint breathing outline on the furniture. */
  outline: string;
};

/** Women's rooms — the original colours. */
export const FEMALE_LABEL_THEME: RoomLabelTheme = {
  line: 'rgba(78, 58, 106, 0.9)',
  labelText: '#3D2E55',
  boxBackground: 'rgba(165, 157, 157, 0.62)',
  boxBorder: 'rgba(104, 96, 121, 0.95)',
  icon: '#5E4A78',
  outline: 'rgba(195, 96, 195, 0.95)',
};

/** Men's rooms — navy and ice blue to match the boy bedroom / bathroom. */
export const MALE_LABEL_THEME: RoomLabelTheme = {
  line: 'rgba(28, 44, 78, 0.9)',
  labelText: '#1C2A4A',
  boxBackground: 'rgba(214, 224, 240, 0.78)',
  boxBorder: 'rgba(120, 140, 175, 0.95)',
  icon: '#24375E',
  outline: 'rgba(150, 190, 240, 0.95)',
};
