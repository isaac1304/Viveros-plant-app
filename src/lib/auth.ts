import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { fetchTenant, validateTenantCode } from './tenants';

export type UserRole = 'customer' | 'staff_vivero' | 'tenant_admin' | 'super_admin';
export type MembershipTier = 'guest' | 'silver' | 'gold';

export type UserDoc = {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  membership: MembershipTier;
  tenantId: string;        // tenant slug. Required for customer/staff/tenant_admin.
  city?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
  tenantCode: string;      // raw input from form, e.g. 'ZAMORANO'
  city?: string;
};

export class TenantNotFoundError extends Error {
  code = 'tenant/not-found' as const;
  constructor(message = 'Código de vivero no encontrado.') {
    super(message);
    this.name = 'TenantNotFoundError';
  }
}

const userRef = (uid: string) => doc(db, 'users', uid);

export async function signUp({
  email,
  password,
  name,
  tenantCode,
  city,
}: SignUpInput): Promise<void> {
  // Validate tenant BEFORE creating the auth user. If we created the auth user
  // first and the tenant lookup failed, we'd be stuck with an orphan auth account.
  const tenant = await validateTenantCode(tenantCode);
  if (!tenant) throw new TenantNotFoundError();

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  const now = serverTimestamp();
  await setDoc(userRef(cred.user.uid), {
    uid: cred.user.uid,
    email: cred.user.email ?? email,
    name,
    role: 'customer' satisfies UserRole,
    membership: 'guest' satisfies MembershipTier,
    tenantId: tenant.slug,
    ...(city ? { city } : {}),
    createdAt: now,
    updatedAt: now,
  });
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export async function fetchUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}

// Self-heal for accounts created out-of-band (Firebase console, or a sign-up
// interrupted between auth and setDoc). We *do not* invent a tenantId here —
// throwing forces the auth context to surface a clear error and sign the user
// out. Otherwise we'd let users without a tenant into a half-broken app.
export async function ensureUserDoc(fbUser: FirebaseUser): Promise<UserDoc> {
  const existing = await fetchUserDoc(fbUser.uid);
  if (!existing) {
    throw new Error(
      'Tu cuenta no está asociada a ningún vivero. Hablá con tu vivero para que te asignen.',
    );
  }
  return existing;
}

// Resolve the tenant for a user. Returns null if the tenant doc was deleted
// out from under us — caller decides how to handle (we currently sign-out).
export async function fetchUserTenant(userDoc: UserDoc) {
  if (!userDoc.tenantId) return null;
  return fetchTenant(userDoc.tenantId);
}

export function mapAuthError(err: unknown): string {
  if (err instanceof TenantNotFoundError) return err.message;
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intentá de nuevo en unos minutos.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisá tu internet.';
    default:
      return 'Algo salió mal. Intentá de nuevo.';
  }
}
