/** Small line icons for the avatar flow (same 1.8 rounded stroke style). */
import Svg, { Circle, Path } from 'react-native-svg';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';

type IconProps = { size?: number; color?: string };
const STROKE = { strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

export function CheckIcon({ size = 14, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 6L9 17l-5-5" stroke={color} {...STROKE} strokeWidth={2.6} />
    </Svg>
  );
}

export function FlipCameraIcon({ size = 20, color = dashboardTheme.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" stroke={color} {...STROKE} />
      <Path d="M9 12.5a3 3 0 0 1 5.2-2M15 12.5a3 3 0 0 1-5.2 2" stroke={color} {...STROKE} />
      <Path d="M14.2 8.6v1.9h-1.9M9.8 16.4v-1.9h1.9" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function TimerIcon({ size = 20, color = dashboardTheme.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={13} r={7.5} stroke={color} {...STROKE} />
      <Path d="M12 9.5V13l2.2 1.6M9.5 3h5" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function CloseIcon({ size = 18, color = dashboardTheme.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} {...STROKE} strokeWidth={2.2} />
    </Svg>
  );
}

export function CameraIcon({ size = 20, color = dashboardTheme.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" stroke={color} {...STROKE} />
      <Circle cx={12} cy={12.5} r={3.5} stroke={color} {...STROKE} />
    </Svg>
  );
}
