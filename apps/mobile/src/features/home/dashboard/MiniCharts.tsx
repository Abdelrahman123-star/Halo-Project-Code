/** Small SVG charts for the dashboard: score ring, trend sparkline, thin bar. */
import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient as ViewGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { dashboardTheme } from './dashboardTheme';

type ProgressRingProps = {
  size: number;
  strokeWidth: number;
  /** 0–1 */
  progress: number;
  gradientId: string;
  children?: ReactNode;
};

export function ProgressRing({ size, strokeWidth, progress, gradientId, children }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const [pink, lilac, blue] = dashboardTheme.pearlGradient;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={pink} />
            <Stop offset="0.5" stopColor="#B9A8F3" />
            <Stop offset="1" stopColor={blue} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={lilac} strokeOpacity={0.35} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          // Start the arc at 12 o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringCenter}>{children}</View>
    </View>
  );
}

type SparklineProps = {
  values: readonly number[];
  height: number;
  gradientId: string;
};

/** Smooth area chart that fills its container's width. */
export function Sparkline({ values, height, gradientId }: SparklineProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => ({
    x: pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2),
    y: pad + (1 - (value - min) / span) * (height - pad * 2),
  }));

  // Horizontal-tangent cubic curves between points give a soft, organic line.
  const line = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = points[index - 1];
    const midX = (prev.x + point.x) / 2;
    return `${path} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
  const last = points[points.length - 1];
  const area = last ? `${line} L ${last.x} ${height} L ${points[0].x} ${height} Z` : '';

  return (
    <View style={{ height }} onLayout={onLayout}>
      {width > 0 && last ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#B9A8F3" stopOpacity={0.4} />
              <Stop offset="1" stopColor="#B9A8F3" stopOpacity={0} />
            </LinearGradient>
            <LinearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#F2A9D3" />
              <Stop offset="1" stopColor="#8F78EE" />
            </LinearGradient>
          </Defs>
          <Path d={area} fill={`url(#${gradientId}-fill)`} />
          <Path d={line} stroke={`url(#${gradientId}-line)`} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <Circle cx={last.x} cy={last.y} r={4.5} fill="#FFFFFF" stroke="#8F78EE" strokeWidth={2} />
        </Svg>
      ) : null}
    </View>
  );
}

type ThinBarProps = {
  /** 0–1 */
  value: number;
  colors: readonly [string, string];
};

export function ThinBar({ value, colors }: ThinBarProps) {
  const percent = `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%` as const;
  return (
    <View style={styles.barTrack}>
      <ViewGradient colors={colors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.barFill, { width: percent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ringCenter: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: dashboardTheme.track, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});
