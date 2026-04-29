import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { AppProvider } from '@/state/AppContext';
import { CatalogProvider } from '@/state/CatalogContext';
import { UserProvider, useAuth } from '@/state/UserContext';

// Routes that don't require authentication. Everything else (home, garden,
// camera, etc.) is gated by useProtectedRoute below.
const PUBLIC_ROUTES = new Set(['index', 'onboarding']);

function useProtectedRoute() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const first = segments[0];
    const inAuthGroup = first === '(auth)';
    const isPublic = first === undefined || PUBLIC_ROUTES.has(first);

    if (status === 'unauthenticated' && !inAuthGroup && !isPublic) {
      router.replace('/(auth)/sign-in');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/home');
    }
  }, [status, segments, router]);
}

function RootStack() {
  useProtectedRoute();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF7F2' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="home" options={{ animation: 'fade' }} />
      <Stack.Screen name="garden" options={{ animation: 'fade' }} />
      <Stack.Screen name="club" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="camera"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="qr"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="result" />
      <Stack.Screen name="plant/[id]" />
      <Stack.Screen name="history" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Fraunces-Regular': require('../assets/fonts/Fraunces-Regular.ttf'),
    'Fraunces-SemiBold': require('../assets/fonts/Fraunces-SemiBold.ttf'),
    'Fraunces-Bold': require('../assets/fonts/Fraunces-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FAF7F2' }} />;
  }

  return (
    <SafeAreaProvider>
      <UserProvider>
        <CatalogProvider>
          <AppProvider>
            <StatusBar style="dark" />
            <RootStack />
          </AppProvider>
        </CatalogProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
