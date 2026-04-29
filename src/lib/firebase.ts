import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  // @ts-expect-error — getReactNativePersistence is exported but not in the public types.
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!config.apiKey || !config.projectId || !config.appId) {
  throw new Error(
    'Firebase env vars are missing. Copy .env.example to .env and fill in EXPO_PUBLIC_FIREBASE_*.',
  );
}

const app: FirebaseApp = getApps()[0] ?? initializeApp(config);

// On native, persist auth in AsyncStorage so sessions survive app restarts.
// On web, the JS SDK uses IndexedDB by default — getAuth() handles it.
export const auth: Auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

// experimentalAutoDetectLongPolling avoids streaming-connection issues that
// some RN networks (corporate proxies, flaky Wi-Fi) hit with Firestore's
// default WebChannel transport.
export const db: Firestore = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

export { app };
