import { Pressable, Text, View, ActivityIndicator, type ViewStyle, type StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
  iconLeft,
  iconRight,
  fullWidth,
}: Props) {
  const handlePress = () => {
    if (loading || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const heights: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
  const paddingH: Record<Size, number> = { sm: spacing.md, md: spacing.lg + 4, lg: spacing['2xl'] };

  const variantStyles: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.brand[500], fg: colors.text.inverse, border: 'transparent' },
    secondary: { bg: colors.surface.raised, fg: colors.brand[700], border: colors.brand[500] },
    ghost: { bg: 'transparent', fg: colors.brand[700], border: 'transparent' },
    destructive: { bg: colors.semantic.error, fg: colors.text.inverse, border: 'transparent' },
  };
  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        {
          height: heights[size],
          paddingHorizontal: paddingH[size],
          backgroundColor: v.bg,
          borderRadius: radius.full,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderColor: v.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <>
          {iconLeft ? <View>{iconLeft}</View> : null}
          <Text style={[typography.button, { color: v.fg }]}>{label}</Text>
          {iconRight ? <View>{iconRight}</View> : null}
        </>
      )}
    </Pressable>
  );
}
