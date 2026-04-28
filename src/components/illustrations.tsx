import Svg, { Path, G, Ellipse, Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '@/theme/tokens';

type LeafProps = { size?: number; primary?: string; secondary?: string };

export function LeafShape({
  size = 120,
  primary = colors.brand[500],
  secondary = colors.brand[700],
}: LeafProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Path
        d="M100 20 C 50 40, 30 90, 40 160 C 100 150, 160 110, 175 50 C 140 30, 115 22, 100 20 Z"
        fill={primary}
        opacity={0.95}
      />
      <Path
        d="M100 20 C 90 70, 75 115, 40 160"
        stroke={secondary}
        strokeWidth={2.5}
        fill="none"
        opacity={0.55}
      />
      <Path
        d="M88 60 L 65 70"
        stroke={secondary}
        strokeWidth={1.5}
        fill="none"
        opacity={0.5}
      />
      <Path
        d="M82 90 L 55 100"
        stroke={secondary}
        strokeWidth={1.5}
        fill="none"
        opacity={0.5}
      />
      <Path
        d="M75 120 L 48 135"
        stroke={secondary}
        strokeWidth={1.5}
        fill="none"
        opacity={0.5}
      />
    </Svg>
  );
}

type MonsteraProps = { size?: number; color?: string; bgColor?: string };

export function MonsteraIllo({
  size = 160,
  color = colors.brand[500],
  bgColor = colors.surface.base,
}: MonsteraProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G fill={color} opacity={0.9}>
        <Path d="M100 15 C 60 30, 30 75, 35 145 C 80 145, 130 125, 165 90 C 165 50, 135 22, 100 15 Z" />
      </G>
      <G fill={bgColor} opacity={0.95}>
        <Ellipse cx={80} cy={60} rx={14} ry={6} transform="rotate(-30 80 60)" />
        <Ellipse cx={115} cy={55} rx={12} ry={5} transform="rotate(20 115 55)" />
        <Ellipse cx={60} cy={95} rx={16} ry={6} transform="rotate(-10 60 95)" />
        <Ellipse cx={135} cy={85} rx={14} ry={6} transform="rotate(10 135 85)" />
        <Ellipse cx={100} cy={120} rx={18} ry={7} />
      </G>
      <Path
        d="M100 15 L 100 200"
        stroke={colors.brand[700]}
        strokeWidth={2}
        opacity={0.5}
      />
    </Svg>
  );
}

type ConfidenceRingProps = {
  value?: number;
  size?: number;
  stroke?: number;
  color?: string;
};

export function ConfidenceRing({
  value = 94,
  size = 56,
  stroke = 5,
  color = colors.brand[500],
}: ConfidenceRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={stroke}
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
      <SvgText
        x={size / 2}
        y={size / 2 + 4}
        fontSize={14}
        fontWeight="700"
        fill={colors.text.primary}
        textAnchor="middle"
      >
        {value}
      </SvgText>
    </Svg>
  );
}
