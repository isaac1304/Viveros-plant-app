import { forwardRef } from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, style, ...rest },
  ref,
) {
  const hasError = Boolean(error);
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.bodySm, { color: colors.text.secondary, fontWeight: '600' }]}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.text.tertiary}
        style={[
          {
            height: 48,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface.raised,
            borderWidth: 1.5,
            borderColor: hasError ? colors.semantic.error : colors.border.subtle,
            borderRadius: radius.md,
            color: colors.text.primary,
            fontSize: 15,
            fontFamily: typography.bodyMd.fontFamily,
          },
          style,
        ]}
        {...rest}
      />
      {hasError ? (
        <Text style={[typography.bodySm, { color: colors.semantic.error }]}>{error}</Text>
      ) : hint ? (
        <Text style={[typography.bodySm, { color: colors.text.tertiary }]}>{hint}</Text>
      ) : null}
    </View>
  );
});
