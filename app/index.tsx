import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/state/UserContext';
import { colors } from '@/theme/tokens';

const SPLASH_MIN_MS = 1200;

export default function SplashScreen() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    const start = Date.now();
    if (status === 'loading') return;

    const elapsed = Date.now() - start;
    const wait = Math.max(0, SPLASH_MIN_MS - elapsed);

    const t = setTimeout(() => {
      if (status === 'authenticated') {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    }, wait);
    return () => clearTimeout(t);
  }, [router, status]);

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
