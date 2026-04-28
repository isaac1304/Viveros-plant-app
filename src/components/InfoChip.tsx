import { View, Text } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

type Props = {
  icon?: string;
  label: string;
  tone?: 'default' | 'warm' | 'inverse';
};

export function InfoChip({ icon, label, tone = 'default' }: Props) {
  const toneStyles = {
    default: { bg: colors.brand[100], fg: colors.brand[900] },
    warm: { bg: '#FFF1DA', fg: colors.accent.earth },
    inverse: { bg: 'rgba(255,255,255,0.2)', fg: colors.text.inverse },
  };
  const t = toneStyles[tone];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: t.bg,
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        borderRadius: radius.full,
        alignSelf: 'flex-start',
      }}
    >
      {icon ? <Text style={{ fontSize: 12 }}>{icon}</Text> : null}
      <Text style={[typography.caption, { color: t.fg, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}
