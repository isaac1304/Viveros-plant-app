import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type MembershipTier = 'guest' | 'silver' | 'gold';

export type UserProfile = {
  name: string;
  initial: string;
  city: string;
  weather: string;
  membership: MembershipTier;
  memberSince?: string;
};

const DEFAULT_USER: UserProfile = {
  name: 'María',
  initial: 'M',
  city: 'Cartago',
  weather: '22°C parcial',
  membership: 'gold',
  memberSince: 'marzo 2024',
};

const UserContext = createContext<UserProfile>(DEFAULT_USER);

export function UserProvider({ children, user }: { children: ReactNode; user?: Partial<UserProfile> }) {
  const value = useMemo<UserProfile>(() => ({ ...DEFAULT_USER, ...(user ?? {}) }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserProfile {
  return useContext(UserContext);
}

export const membershipLabel = (tier: MembershipTier): string =>
  tier === 'gold' ? 'Gold' : tier === 'silver' ? 'Silver' : 'Visitante';
