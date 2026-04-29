import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// A "tenant" is a single vivero using Verdor. Every customer/staff doc carries
// a tenantId pointing to one of these. The tenant doc id IS the slug — a
// short stable identifier the vivero hands out (e.g. "ZAMORANO" -> "zamorano").

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type Tenant = {
  slug: string;            // doc id, lowercase. e.g. 'zamorano'
  name: string;            // display name. e.g. 'Vivero El Zamorano'
  city?: string;           // 'Cartago, Costa Rica'
  address?: string;        // multi-line ok. shown in plant detail.
  hours?: string;          // 'Lun-Sáb 7:30am-5:00pm · Dom 9:30am-5:00pm'
  whatsapp?: string;       // E.164 sin '+', e.g. '50622688257'
  primaryColor?: string;   // hex; future white-label tint
  subscriptionTier: SubscriptionTier;
  createdAt: Timestamp;
  ownerUid?: string;       // uid del tenant_admin que lo creó (futuro)
};

export const tenantRef = (slug: string) => doc(db, 'tenants', slug);

// Normalize whatever the user types ("ZAMORANO ", "Zamorano") to the slug.
export const normalizeSlug = (input: string): string =>
  input.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

export async function fetchTenant(slug: string): Promise<Tenant | null> {
  const snap = await getDoc(tenantRef(slug));
  if (!snap.exists()) return null;
  return snap.data() as Tenant;
}

// Used in the sign-up flow to validate the code the user entered.
// Returns null when the code is empty / invalid / not found, so callers
// can show a friendly error.
export async function validateTenantCode(code: string): Promise<Tenant | null> {
  const slug = normalizeSlug(code);
  if (!slug) return null;
  return fetchTenant(slug);
}
