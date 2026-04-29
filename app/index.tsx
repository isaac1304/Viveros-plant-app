import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Logo } from '@/components/Logo';
import { colors } from '@/theme/tokens';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/onboarding'), 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.base,
      }}
    >
      <Animated.View entering={FadeIn.duration(600)}>
        <Logo size={240} />
      </Animated.View>
    </View>
  );
}
