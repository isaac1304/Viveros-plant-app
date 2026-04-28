import { View, Text } from 'react-native';
import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { Issue } from '@/data/plants';

export function AlertCard({ issue }: { issue: Issue }) {
  const borderColor = colors.severity[issue.severity];
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface.raised,
          borderLeftWidth: 4,
          borderLeftColor: borderColor,
          borderRadius: radius.md,
          padding: spacing.lg,
          gap: spacing.sm,
        },
        shadows.card,
      ]}
    >
      <Text style={typography.headingSm}>{issue.name}</Text>
      <Text style={typography.bodySm}>
        <Text style={{ fontWeight: '600', color: colors.text.primary }}>Síntomas: </Text>
        {issue.symptoms}
      </Text>
      <Text style={typography.bodySm}>
        <Text style={{ fontWeight: '600', color: colors.text.primary }}>Tratamiento: </Text>
        {issue.treatment}
      </Text>
    </View>
  );
}
