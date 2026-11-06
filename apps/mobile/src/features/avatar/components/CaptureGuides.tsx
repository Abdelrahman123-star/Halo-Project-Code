/**
 * Positioning guides drawn over the live camera (dashed white outlines) and
 * reused as pearly illustrations on the intro / ready screens.
 * The body outline is the same silhouette as the home-page avatar.
 */
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import { HUMAN_SILHOUETTE_PATH, SILHOUETTE_ASPECT_RATIO } from '@/features/home/components/AvatarSilhouette';
import type { CaptureStepId } from '../avatarSteps';

type Variant = 'overlay' | 'illustration';

type GuideProps = {
  kind: CaptureStepId;
  height: number;
  variant?: Variant;
  /** Unique per mounted instance; SVG gradient ids are document-wide on some platforms. */
  idSuffix?: string;
};

// Head-and-shoulders outline in a 100 × 120 box for the face step.
const FACE_OVAL = { cx: 50, cy: 50, rx: 30, ry: 38 };
const SHOULDERS_PATH = 'M 8 120 C 10 100, 28 92, 40 90 M 92 120 C 90 100, 72 92, 60 90';

export function CaptureGuide({ kind, height, variant = 'overlay', idSuffix = 'guide' }: GuideProps) {
  const isOverlay = variant === 'overlay';
  const stroke = isOverlay ? 'rgba(255, 255, 255, 0.92)' : '#8E7AA6';
  const dash = isOverlay ? '6 6' : undefined;
  const fillId = `guide-fill-${kind}-${idSuffix}`;
  const fill = isOverlay ? 'rgba(255, 255, 255, 0.08)' : `url(#${fillId})`;

  const defs = isOverlay ? null : (
    <Defs>
      <LinearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} />
        <Stop offset="0.5" stopColor="#EADBFC" stopOpacity={0.75} />
        <Stop offset="1" stopColor="#CFE0F8" stopOpacity={0.7} />
      </LinearGradient>
    </Defs>
  );

  if (kind === 'face') {
    const width = height * (100 / 120);
    return (
      <Svg width={width} height={height} viewBox="0 0 100 120" fill="none">
        {defs}
        <Ellipse {...FACE_OVAL} stroke={stroke} strokeWidth={1.6} strokeDasharray={dash} fill={fill} />
        <Path d={SHOULDERS_PATH} stroke={stroke} strokeWidth={1.6} strokeDasharray={dash} strokeLinecap="round" />
      </Svg>
    );
  }

  const width = height * SILHOUETTE_ASPECT_RATIO;
  return (
    <Svg width={width} height={height} viewBox="0 0 100 240" fill="none">
      {defs}
      <Path
        d={HUMAN_SILHOUETTE_PATH}
        stroke={stroke}
        strokeWidth={1.4}
        strokeDasharray={dash}
        strokeLinejoin="round"
        fill={fill}
      />
      {/* Back view: a soft spine + shoulder-blade hint instead of a blank front. */}
      {kind === 'back' ? (
        <Path
          d="M 50 50 L 50 128 M 40 62 C 44 70, 44 76, 41 82 M 60 62 C 56 70, 56 76, 59 82"
          stroke={stroke}
          strokeWidth={1.1}
          strokeDasharray={dash}
          strokeLinecap="round"
          opacity={0.75}
        />
      ) : null}
    </Svg>
  );
}
