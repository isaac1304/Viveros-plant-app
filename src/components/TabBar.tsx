import { View, Pressable, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, shadows, spacing } from '@/theme/tokens';

type Tab = {
  href: '/home' | '/garden' | '/club';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TABS: Tab[] = [
  { href: '/home', label: 'Inicio', icon: 'home' },
  { href: '/garden', label: 'Mi Jardín', icon: 'leaf' },
  { href: '/club', label: 'Club', icon: 'people' },
];

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface.raised,
          borderTopWidth: 1,
          borderTopColor: colors.border.subtle,
        },
        shadows.raised,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: 64,
        }}
      >
        {TABS.slice(0, 1).map((tab) => (
          <TabItem key={tab.href} tab={tab} active={pathname === tab.href} onPress={() => router.replace(tab.href)} />
        ))}

        {/* Center FAB: open camera */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.push('/camera');
          }}
          style={({ pressed }) => [
            {
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.brand[500],
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -28,
              transform: [{ scale: pressed ? 0.92 : 1 }],
              borderWidth: 4,
              borderColor: colors.surface.raised,
            },
            shadows.floating,
          ]}
        >
          <Ionicons name="camera" size={28} color={colors.text.inverse} />
        </Pressable>

        {TABS.slice(1).map((tab) => (
          <TabItem key={tab.href} tab={tab} active={pathname === tab.href} onPress={() => router.replace(tab.href)} />
        ))}
      </View>
    </View>
  );
}

function TabItem({ tab, active, onPress }: { tab: Tab; active: boolean; onPress: () => void }) {
  const color = active ? colors.brand[700] : colors.text.tertiary;
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 4, paddingVertical: spacing.sm }}
    >
      <Ionicons name={tab.icon} size={22} color={color} />
      <Text style={{ fontSize: 11, fontWeight: '600', color }}>{tab.label}</Text>
    </Pressable>
  );
}
