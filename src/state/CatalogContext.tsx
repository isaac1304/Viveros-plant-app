import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { subscribeCatalog } from '@/lib/catalog';
import type { Plant } from '@/data/plants';
import { useAuth } from './UserContext';

// CatalogContext exposes the signed-in user's tenant catalog as a live list.
// We subscribe in the provider and re-emit on changes so screens see updates
// from another device (or a tenant_admin editing the catalog) without a
// manual refresh. While unauthenticated or before the first snapshot, plants
// is an empty array and `loading` is true.

type CatalogState = {
  plants: Plant[];
  loading: boolean;
  error: Error | null;
  getPlantById: (id: string) => Plant | undefined;
};

const CatalogContext = createContext<CatalogState | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const tenantId = profile?.tenant.slug;

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setPlants([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeCatalog(
      tenantId,
      (next) => {
        setPlants(next);
        setLoading(false);
      },
      (err) => {
        console.warn('[catalog] subscription error', err);
        setError(err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [tenantId]);

  const value = useMemo<CatalogState>(() => {
    const byId = new Map(plants.map((p) => [p.id, p]));
    return {
      plants,
      loading,
      error,
      getPlantById: (id: string) => byId.get(id),
    };
  }, [plants, loading, error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogState {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}
