import { Platform } from 'react-native';
import type { Plant } from '@/data/plants';
import { waterIntervalDays, type WaterLog } from './reminders';

const NOTIFICATION_PREFIX = 'zamorano:water:';
const isWeb = Platform.OS === 'web';

let notificationsModulePromise: Promise<typeof import('expo-notifications') | null> | null = null;
const getNotifications = (): Promise<typeof import('expo-notifications') | null> => {
  if (isWeb) return Promise.resolve(null);
  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').catch(() => null);
  }
  return notificationsModulePromise;
};

export async function ensureNotificationPermission(): Promise<boolean> {
  if (isWeb) return false;
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    if (!settings.canAskAgain) return false;
    const req = await Notifications.requestPermissionsAsync();
    return !!req.granted;
  } catch {
    return false;
  }
}

const notificationDate = (plant: Plant, waterLog: WaterLog, now: Date): Date | null => {
  const interval = waterIntervalDays(plant.water);
  const last = waterLog[plant.id];
  const base = last ? new Date(last) : new Date(now);
  if (Number.isNaN(base.getTime())) return null;
  const next = new Date(base);
  next.setDate(base.getDate() + interval);
  next.setHours(9, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setTime(now.getTime() + 60 * 60 * 1000);
  }
  return next;
};

export async function scheduleWaterReminders(
  savedPlants: Plant[],
  waterLog: WaterLog,
  now: Date = new Date(),
): Promise<void> {
  if (isWeb) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;

  try {
    const settings = await Notifications.getPermissionsAsync();
    if (!settings.granted) return;

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.identifier.startsWith(NOTIFICATION_PREFIX))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );

    for (const plant of savedPlants) {
      const fireAt = notificationDate(plant, waterLog, now);
      if (!fireAt) continue;
      const seconds = Math.max(60, Math.floor((fireAt.getTime() - now.getTime()) / 1000));
      await Notifications.scheduleNotificationAsync({
        identifier: `${NOTIFICATION_PREFIX}${plant.id}`,
        content: {
          title: `Hora de regar ${plant.commonName}`,
          body: 'Tu planta te está esperando 💧',
          sound: 'default',
          data: { plantId: plant.id },
        },
        trigger: { seconds, repeats: false } as any,
      });
    }
  } catch {}
}
