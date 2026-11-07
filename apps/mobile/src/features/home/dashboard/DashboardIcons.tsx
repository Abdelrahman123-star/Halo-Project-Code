/** Dashboard line icons, same rounded 1.8px stroke style as HomeIcons. */
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { dashboardTheme } from './dashboardTheme';

type IconProps = { size?: number; color?: string };

const STROKE = { strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

export function SparkleIcon({ size = 16, color = dashboardTheme.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M11 3.5l1.7 4.8 4.8 1.7-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.7z" stroke={color} {...STROKE} />
      <Path d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function BellIcon({ size = 16, color = dashboardTheme.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z" stroke={color} {...STROKE} />
      <Path d="M10 20.5a2 2 0 0 0 4 0" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function CalendarIcon({ size = 16, color = dashboardTheme.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5.5 6h13A1.5 1.5 0 0 1 20 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6z" stroke={color} {...STROKE} />
      <Path d="M4 10.5h16M8.5 4v4M15.5 4v4" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function DropletIcon({ size = 16, color = dashboardTheme.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3.5c3 3.6 6 7.1 6 10.4a6 6 0 0 1-12 0c0-3.3 3-6.8 6-10.4z" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function SkincareIcon({ size = 16, color = dashboardTheme.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M10 3h4v3h-4z" stroke={color} {...STROKE} />
      <Path d="M8.5 6h7A1.5 1.5 0 0 1 17 7.5V19a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7.5A1.5 1.5 0 0 1 8.5 6z" stroke={color} {...STROKE} />
      <Path d="M7 11.5h10" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function HeartPulseIcon({ size = 16, color = dashboardTheme.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" stroke={color} {...STROKE} />
      <Path d="M8 12.5h2l1-2 2 4 1-2h2" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function CloudSunIcon({ size = 16, color = dashboardTheme.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 3.5v1.3M20.2 5.8l-.9.9M21.5 11h-1.3M9.8 5.8l.9.9" stroke={color} {...STROKE} />
      <Path d="M12.2 8.6A3.6 3.6 0 0 1 18.6 11" stroke={color} {...STROKE} />
      <Path d="M7 19.5h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.4 1.3A2.9 2.9 0 0 0 7 19.5z" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function HomeIcon({ size = 20, color = dashboardTheme.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 10.8L12 4l8.5 6.8V19.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V10.8z"
        stroke={color}
        {...STROKE}
      />
      <Path
        d="M9.5 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"
        stroke={color}
        {...STROKE}
      />
    </Svg>
  );
}

/** Filled, pastel "partly cloudy" illustration for the weather card. */
export function PartlyCloudyIllustration({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="weather-sun" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FBE3C4" />
          <Stop offset="1" stopColor="#F5B4D8" />
        </LinearGradient>
        <LinearGradient id="weather-cloud" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#E6DEFA" />
        </LinearGradient>
      </Defs>
      <Circle cx={30} cy={17} r={9.5} fill="url(#weather-sun)" />
      <Path
        d="M14 38h20a7 7 0 0 0 .9-13.9A10 10 0 0 0 15.6 22 8 8 0 0 0 14 38z"
        fill="url(#weather-cloud)"
        stroke="#C9B6F6"
        strokeWidth={1.2}
      />
    </Svg>
  );
}
