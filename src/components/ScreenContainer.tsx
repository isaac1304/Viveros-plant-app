import { View, type ViewStyle, type StyleProp } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  background?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  withTabBarPadding?: boolean;
};

export function ScreenContainer({
  children,
  style,
  background = colors.surface.base,
  edges = ['top', 'left', 'right'],
  withTabBarPadding,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: background }}>
      <View
        style={[
          { flex: 1 },
          withTabBarPadding ? { paddingBottom: 64 + insets.bottom } : null,
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
