import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WaterLog } from '@/lib/reminders';
import { scheduleWaterReminders } from '@/lib/notifications';
import { plants } from '@/data/plants';

// Storage keys are namespaced by app, NOT by user/tenant. In Phase 2 these
// move to Firestore subcollections (users/{uid}/garden, etc.) and AsyncStorage
// becomes pure offline cache. Until then a logout doesn't wipe garden state —
// acceptable for a single-user-per-device demo.
const SAVED_KEY = 'verdor:savedIds:v1';
const WATER_KEY = 'verdor:waterLog:v1';
const HISTORY_KEY = 'verdor:history:v1';
const DEFAULT_SAVED: string[] = ['monstera', 'helecho'];
const HISTORY_LIMIT = 20;

export type IdentificationEntry = {
  id: string;
  timestamp: string;
  commonName: string;
  scientificName: string;
  matchedPlantId?: string;
  imageUri: string;
  confidence: number;
};

const seedWaterLog = (): WaterLog => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return {
    monstera: new Date(now - 6 * dayMs).toISOString(),
    helecho: new Date(now - 1 * dayMs).toISOString(),
  };
};

type AppState = {
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  waterLog: WaterLog;
  markWatered: (id: string) => void;
  history: IdentificationEntry[];
  addIdentification: (entry: Omit<IdentificationEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  hydrated: boolean;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(DEFAULT_SAVED);
  const [waterLog, setWaterLog] = useState<WaterLog>(seedWaterLog);
  const [history, setHistory] = useState<IdentificationEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const skipNextSavedWrite = useRef(true);
  const skipNextWaterWrite = useRef(true);
  const skipNextHistoryWrite = useRef(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      AsyncStorage.getItem(SAVED_KEY),
      AsyncStorage.getItem(WATER_KEY),
      AsyncStorage.getItem(HISTORY_KEY),
    ])
      .then(([savedRaw, waterRaw, historyRaw]) => {
        if (!alive) return;
        if (savedRaw) {
          try {
            const parsed = JSON.parse(savedRaw);
            if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
              setSavedIds(parsed);
            }
          } catch {}
        }
        if (waterRaw) {
          try {
            const parsed = JSON.parse(waterRaw);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              setWaterLog(parsed);
            }
          } catch {}
        }
        if (historyRaw) {
          try {
            const parsed = JSON.parse(historyRaw);
            if (Array.isArray(parsed)) setHistory(parsed);
          } catch {}
        }
      })
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSavedWrite.current) {
      skipNextSavedWrite.current = false;
      return;
    }
    AsyncStorage.setItem(SAVED_KEY, JSON.stringify(savedIds)).catch(() => {});
  }, [savedIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextWaterWrite.current) {
      skipNextWaterWrite.current = false;
      return;
    }
    AsyncStorage.setItem(WATER_KEY, JSON.stringify(waterLog)).catch(() => {});
  }, [waterLog, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextHistoryWrite.current) {
      skipNextHistoryWrite.current = false;
      return;
    }
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(() => {});
  }, [history, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const saved = plants.filter((p) => savedIds.includes(p.id));
    scheduleWaterReminders(saved, waterLog).catch(() => {});
  }, [savedIds, waterLog, hydrated]);

  const value = useMemo<AppState>(
    () => ({
      savedIds,
      hydrated,
      toggleSave: (id: string) =>
        setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      isSaved: (id: string) => savedIds.includes(id),
      waterLog,
      markWatered: (id: string) =>
        setWaterLog((prev) => ({ ...prev, [id]: new Date().toISOString() })),
      history,
      addIdentification: (entry) =>
        setHistory((prev) => {
          const next: IdentificationEntry = {
            ...entry,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toISOString(),
          };
          return [next, ...prev].slice(0, HISTORY_LIMIT);
        }),
      clearHistory: () => setHistory([]),
    }),
    [savedIds, waterLog, history, hydrated],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
