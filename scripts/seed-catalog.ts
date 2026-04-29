// One-time seed: pushes the static plants list into a tenant's catalog
// at /tenants/{tenantId}/catalog/{plantId}.
//
// Usage:
//   1. In Firebase Console, set your user doc's role to 'super_admin' or
//      'tenant_admin' so writes pass the rules. (Revert afterwards if you want.)
//   2. Add to .env:
//        SEED_ADMIN_EMAIL=you@example.com
//        SEED_ADMIN_PASSWORD=...
//        SEED_TENANT_ID=zamorano   # optional, defaults to 'zamorano'
//   3. Run: npm run seed:catalog
//
// The script does NOT use firebase-admin — it signs in as a real user and
// writes through the same security rules the app does. This keeps the rules
// honest (a leaky rule would surface here too).

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  doc,
  initializeFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { plants } from '../src/data/plants.ts';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const TENANT_ID = process.env.SEED_TENANT_ID ?? 'zamorano';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!config.apiKey || !config.projectId || !config.appId) {
  fail('Missing EXPO_PUBLIC_FIREBASE_* env vars. Did you run with --env-file=.env?');
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  fail('Missing SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env vars.');
}

const app = getApps()[0] ?? initializeApp(config);
const auth = getAuth(app);
const db = initializeFirestore(app, {});

console.log(`→ Signing in as ${ADMIN_EMAIL}…`);
await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);

console.log(
  `→ Seeding ${plants.length} plants into tenants/${TENANT_ID}/catalog/…`,
);

let written = 0;
for (const p of plants) {
  try {
    await setDoc(
      doc(db, 'tenants', TENANT_ID, 'catalog', p.id),
      {
        id: p.id,
        commonName: p.commonName,
        scientificName: p.scientificName,
        image: p.image,
        light: p.light,
        water: p.water,
        temp: p.temp,
        toxic: p.toxic,
        origin: p.origin,
        inStore: p.inStore,
        price: p.price ?? null,
        description: p.description,
        pests: p.pests,
        diseases: p.diseases,
        tips: p.tips,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log(`  ✓ ${p.id.padEnd(12)} — ${p.commonName}`);
    written += 1;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${p.id} — ${message}`);
  }
}

await signOut(auth);
console.log(`\nDone. ${written}/${plants.length} written.`);
process.exit(written === plants.length ? 0 : 1);
