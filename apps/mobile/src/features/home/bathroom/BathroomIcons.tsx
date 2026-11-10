/** Fine line icons for the bathroom hints (same 1.5 stroke style as the bedroom hints). */
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const INK = '#5E4A78';
const STROKE = { strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

type IconProps = { size?: number; color?: string };

/** Pump bottle — skincare. */
export function FineBottleIcon({ size = 25, color = INK }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M10 3h3.5M11.75 3v3M10 6h3.5" stroke={color} {...STROKE} />
      <Rect x={7.5} y={8.5} width={8.5} height={12.5} rx={2.5} stroke={color} {...STROKE} />
      <Path d="M9.5 6.5c0-.6.4-.5 2.25-.5S14 5.9 14 6.5v2h-4.5z" stroke={color} {...STROKE} />
      <Path d="M7.5 13h8.5" stroke={color} {...STROKE} opacity={0.7} />
    </Svg>
  );
}

/** Face inside scan corners — skin analysis. */
export function FineFaceScanIcon({ size = 26, color = INK }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" stroke={color} {...STROKE} />
      <Circle cx={12} cy={11.5} r={4} stroke={color} {...STROKE} />
      <Path d="M10.6 12.6c.8.6 2 .6 2.8 0" stroke={color} {...STROKE} />
    </Svg>
  );
}

/** Lipstick — makeup. */
export function FineLipstickIcon({ size = 25, color = INK }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={8} y={13} width={8} height={8} rx={1.2} stroke={color} {...STROKE} />
      <Path d="M9.5 13V9.5h5V13" stroke={color} {...STROKE} />
      <Path d="M10.5 9.5V6.2l3-2.7v6" stroke={color} {...STROKE} />
    </Svg>
  );
}
