/**
 * Line icons for the home feature, drawn in the same rounded-stroke style as
 * the auth input icons.
 */
import Svg, { Circle, Path } from 'react-native-svg';
import { authTheme } from '@/features/auth/components/AuthComponents';

type IconProps = { size?: number; color?: string };

const STROKE = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function ProfileIcon({ size = 20, color = authTheme.textMain }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4.5 20c0-3.3 3.4-5.8 7.5-5.8s7.5 2.5 7.5 5.8" stroke={color} strokeWidth={1.8} {...STROKE} />
    </Svg>
  );
}

export function PlusIcon({ size = 14, color = authTheme.inputFocusBorder }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.8} {...STROKE} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color = authTheme.textMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2.2} {...STROKE} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 22, color = authTheme.textMain }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2.4} {...STROKE} />
    </Svg>
  );
}

export function HangerIcon({ size = 22, color = authTheme.textMain }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 5.5a2 2 0 1 1 2 2v1.6l8.2 6.4c.8.6.4 1.9-.6 1.9H4.4c-1 0-1.4-1.3-.6-1.9L12 9.1"
        stroke={color}
        strokeWidth={1.8}
        {...STROKE}
      />
    </Svg>
  );
}

export function MirrorIcon({ size = 22, color = authTheme.textMain }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={9.5} r={6.5} stroke={color} strokeWidth={1.8} />
      <Path d="M12 16v5M8.5 21h7" stroke={color} strokeWidth={1.8} {...STROKE} />
      <Path d="M9.5 7.5a3.5 3.5 0 0 1 3.5-1" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

export function SparkleBeautyIcon({ size = 22, color = authTheme.textMain }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx={18.5} cy={6.5} r={1.5} fill={color} />
    </Svg>
  );
}
