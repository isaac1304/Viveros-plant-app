import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  ensureUserDoc,
  fetchUserTenant,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
  type MembershipTier,
  type SignUpInput,
  type UserDoc,
  type UserRole,
} from '@/lib/auth';
import type { Tenant } from '@/lib/tenants';

export type { MembershipTier, UserRole, SignUpInput, Tenant };

export type UserProfile = {
  uid: string;
  name: string;
  initial: string;
  email: string;
  city: string;
  weather: string;
  membership: MembershipTier;
  role: UserRole;
  memberSince?: string;
  tenant: TenantSummary;
};

// What we expose to screens. Screens never need the full Tenant doc —
// just the bits they render. Keeps the prop surface narrow and lets us
// add per-tenant feature flags later without leaking everything.
export type TenantSummary = {
  slug: string;
  name: string;
  shortName: string;       // used in compact UI ("Tu jardín en {shortName}")
  city?: string;
  address?: string;
  hours?: string;
  whatsapp?: string;
  primaryColor?: string;
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SPANISH_MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// "Vivero El Zamorano" -> "Zamorano". Used in compact UI; falls back to full name.
function shortenTenantName(name: string): string {
  const cleaned = name.replace(/^vivero\s+(el\s+|la\s+|los\s+|las\s+)?/i, '').trim();
  return cleaned || name;
}

function toTenantSummary(t: Tenant): TenantSummary {
  return {
    slug: t.slug,
    name: t.name,
    shortName: shortenTenantName(t.name),
    city: t.city,
    address: t.address,
    hours: t.hours,
    whatsapp: t.whatsapp,
    primaryColor: t.primaryColor,
  };
}

function toProfile(userDoc: UserDoc, tenant: Tenant): UserProfile {
  const memberSince = userDoc.createdAt?.toDate
    ? `${SPANISH_MONTHS[userDoc.createdAt.toDate().getMonth()]} ${userDoc.createdAt.toDate().getFullYear()}`
    : undefined;
  const trimmedName = userDoc.name?.trim() || 'Jardinero';
  return {
    uid: userDoc.uid,
    name: trimmedName,
    initial: trimmedName.charAt(0).toUpperCase(),
    email: userDoc.email,
    city: userDoc.city ?? tenant.city ?? '—',
    // Weather is still mocked client-side until we wire a weather provider.
    weather: '22°C parcial',
    membership: userDoc.membership,
    role: userDoc.role,
    memberSince,
    tenant: toTenantSummary(tenant),
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setProfile(null);
        setStatus('unauthenticated');
        return;
      }
      try {
        const userDoc = await ensureUserDoc(fbUser);
        const tenant = await fetchUserTenant(userDoc);
        if (!tenant) {
          // Tenant deleted or user landed in an inconsistent state —
          // sign them out so they retry sign-up with a valid code.
          console.warn('[auth] user has no resolvable tenant; signing out', userDoc.tenantId);
          await authSignOut();
          return;
        }
        setProfile(toProfile(userDoc, tenant));
        setStatus('authenticated');
      } catch (err) {
        console.warn('[auth] failed to hydrate profile', err);
        await authSignOut().catch(() => {});
        setProfile(null);
        setStatus('unauthenticated');
      }
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await authSignIn(email, password);
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    await authSignUp(input);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, profile, signIn, signUp, signOut }),
    [status, profile, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside UserProvider');
  return ctx;
}

export function useAuth(): AuthContextValue {
  return useAuthContext();
}

// Throws if accessed before authentication. Protected routes are guarded
// in app/_layout.tsx, so any screen reachable from them has a profile.
export function useUser(): UserProfile {
  const { profile } = useAuthContext();
  if (!profile) {
    throw new Error('useUser called without an authenticated profile — check route guard');
  }
  return profile;
}

// Convenience for screens that want only tenant info.
export function useTenant(): TenantSummary {
  return useUser().tenant;
}

export const membershipLabel = (tier: MembershipTier): string =>
  tier === 'gold' ? 'Gold' : tier === 'silver' ? 'Silver' : 'Visitante';

export const roleLabel = (role: UserRole): string => {
  switch (role) {
    case 'super_admin': return 'Admin Verdor';
    case 'tenant_admin': return 'Admin Vivero';
    case 'staff_vivero': return 'Equipo Vivero';
    case 'customer': return 'Cliente';
  }
};
