import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type AppState = {
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(['monstera', 'helecho']);

  const value = useMemo<AppState>(
    () => ({
      savedIds,
      toggleSave: (id: string) =>
        setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      isSaved: (id: string) => savedIds.includes(id),
    }),
    [savedIds],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
