import type { Plant } from '@/data/plants';

export type WaterLog = Record<string, string>;

const FREQUENCY_MAP: { test: RegExp; days: number }[] = [
  { test: /diario/i, days: 1 },
  { test: /3x\s*semana|cada\s*2\s*d[ií]as/i, days: 2 },
  { test: /2-3x\s*semana/i, days: 3 },
  { test: /2x\s*semana/i, days: 4 },
  { test: /1x\s*semana|semanal/i, days: 7 },
  { test: /quincenal|cada\s*15/i, days: 15 },
  { test: /mensual/i, days: 30 },
];

export function waterIntervalDays(water: string): number {
  for (const { test, days } of FREQUENCY_MAP) {
    if (test.test(water)) return days;
  }
  return 5;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysSince(iso: string | undefined, now: Date = new Date()): number {
  if (!iso) return Infinity;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Infinity;
  return Math.floor((now.getTime() - then) / MS_PER_DAY);
}

export type WaterStatus = {
  plant: Plant;
  daysSince: number;
  intervalDays: number;
  overdueDays: number;
};

export function getWaterStatus(plant: Plant, log: WaterLog, now: Date = new Date()): WaterStatus {
  const interval = waterIntervalDays(plant.water);
  const since = daysSince(log[plant.id], now);
  const overdue = since === Infinity ? interval : since - interval;
  return { plant, daysSince: since, intervalDays: interval, overdueDays: overdue };
}

export function describeWaterStatus(status: WaterStatus): string {
  if (status.daysSince === Infinity) {
    return `Sin registro · regar cada ${status.intervalDays} día${status.intervalDays === 1 ? '' : 's'}`;
  }
  if (status.overdueDays > 0) {
    return `Hace ${status.daysSince} día${status.daysSince === 1 ? '' : 's'} sin agua`;
  }
  if (status.overdueDays === 0) {
    return 'Toca regar hoy';
  }
  const inDays = -status.overdueDays;
  return `En ${inDays} día${inDays === 1 ? '' : 's'}`;
}

export function activeReminders(plants: Plant[], log: WaterLog, now: Date = new Date()): WaterStatus[] {
  return plants
    .map((p) => getWaterStatus(p, log, now))
    .filter((s) => s.overdueDays >= 0)
    .sort((a, b) => b.overdueDays - a.overdueDays);
}
