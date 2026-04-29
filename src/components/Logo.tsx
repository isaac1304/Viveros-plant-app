import Svg, { Text as SvgText, Path, G } from 'react-native-svg';
import { colors } from '@/theme/tokens';

// Wordmark for Verdor (default brand). Inspired by the original Vivero El
// Zamorano hand-drawn logo. Once tenant white-label lands (Phase 4), tenants
// with their own logoUrl will render an Image instead.

type Props = { size?: number; mono?: boolean };

export function Logo({ size = 200, mono }: Props) {
  const fg = mono ? colors.text.inverse : colors.brand[700];
  const accent = mono ? colors.text.inverse : colors.brand[500];
  const width = size;
  const height = size * 0.5;
  return (
    <Svg width={width} height={height} viewBox="0 0 200 100">
      <SvgText
        x="100"
        y="38"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        letterSpacing="2"
        fill={fg}
      >
        EL ZAMORANO
      </SvgText>
      <G>
        <Path
          d="M 18 56 C 60 78, 140 78, 182 56"
          stroke={accent}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      </G>
      <SvgText
        x="100"
        y="78"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        letterSpacing="6"
        fill={accent}
      >
        VIVERO
      </SvgText>
    </Svg>
  );
}
