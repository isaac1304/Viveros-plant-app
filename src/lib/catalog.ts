import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type FirestoreDataConverter,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Issue, Plant } from '@/data/plants';

// A tenant's plant catalog lives at /tenants/{tenantId}/catalog/{plantId}.
// The doc id IS the plant slug ('monstera') so the customer's garden can
// reference it by ID without an extra lookup.
//
// CatalogDoc mirrors Plant 1:1 with two differences: optional `price` is
// flattened to `string | null` (Firestore prefers null over missing fields
// when the field can come back), and we add audit timestamps.

export type CatalogDoc = {
  id: string;
  commonName: string;
  scientificName: string;
  image: string;
  light: string;
  water: string;
  temp: string;
  toxic: boolean;
  origin: string;
  inStore: boolean;
  price: string | null;
  description: string;
  pests: Issue[];
  diseases: Issue[];
  tips: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const catalogConverter: FirestoreDataConverter<CatalogDoc> = {
  toFirestore(doc) {
    return doc as DocumentData;
  },
  fromFirestore(snap) {
    return snap.data() as CatalogDoc;
  },
};

export const catalogCollection = (tenantId: string) =>
  collection(db, 'tenants', tenantId, 'catalog').withConverter(catalogConverter);

export const catalogDoc = (tenantId: string, plantId: string) =>
  doc(db, 'tenants', tenantId, 'catalog', plantId).withConverter(catalogConverter);

// Drop Firestore-only fields and normalize price back to optional so the
// rest of the app keeps working with the existing Plant shape.
export function catalogToPlant(d: CatalogDoc): Plant {
  return {
    id: d.id,
    commonName: d.commonName,
    scientificName: d.scientificName,
    image: d.image,
    light: d.light,
    water: d.water,
    temp: d.temp,
    toxic: d.toxic,
    origin: d.origin,
    inStore: d.inStore,
    ...(d.price ? { price: d.price } : {}),
    description: d.description,
    pests: d.pests ?? [],
    diseases: d.diseases ?? [],
    tips: d.tips ?? [],
  };
}

// One-shot read of an entire catalog. Used by the seed script and any code
// path that needs the catalog without a live subscription.
export async function fetchCatalog(tenantId: string): Promise<Plant[]> {
  const snap = await getDocs(catalogCollection(tenantId));
  return snap.docs.map((d) => catalogToPlant(d.data()));
}

// Realtime subscription. Returns an unsubscribe. Caller is responsible for
// cleaning up on unmount.
export function subscribeCatalog(
  tenantId: string,
  onChange: (plants: Plant[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    catalogCollection(tenantId),
    (snap) => onChange(snap.docs.map((d) => catalogToPlant(d.data()))),
    (err) => onError?.(err),
  );
}

// Upsert one plant. Used by the seed script and (later) the tenant_admin
// catalog UI. createdAt is set only if the doc didn't already exist —
// can't read-then-write in a single call without a transaction, so we always
// merge and set updatedAt; createdAt is set with serverTimestamp() on create
// via merge:true (Firestore keeps the existing value if present).
export async function upsertCatalogPlant(
  tenantId: string,
  plant: Omit<CatalogDoc, 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const ref = catalogDoc(tenantId, plant.id);
  await setDoc(
    ref,
    {
      ...plant,
      price: plant.price ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as CatalogDoc,
    { merge: true },
  );
}

export async function deleteCatalogPlant(tenantId: string, plantId: string): Promise<void> {
  await deleteDoc(catalogDoc(tenantId, plantId));
}

// Convert a Plant (from the seed file) into the shape upsertCatalogPlant
// expects. Plant.price is `string | undefined`; CatalogDoc wants `string | null`.
export function plantToCatalogInput(p: Plant): Omit<CatalogDoc, 'createdAt' | 'updatedAt'> {
  return {
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
  };
}
