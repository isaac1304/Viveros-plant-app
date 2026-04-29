import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { AppProvider } from '@/state/AppContext';
import { UserProvider } from '@/state/UserContext';

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
        <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FAF7F2' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
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
        </AppProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
