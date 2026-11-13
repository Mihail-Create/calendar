import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { DayLog, PeriodCycle, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/cycleCalculations';

const LOCAL_CYCLES_KEY = 'eva_guest_cycles';
const LOCAL_LOGS_KEY = 'eva_guest_logs';
const LOCAL_SETTINGS_KEY = 'eva_guest_settings';

export interface AppData {
  cycles: PeriodCycle[];
  dayLogs: Record<string, DayLog>;
  settings: UserSettings;
}

export function subscribeToUserData(
  userId: string,
  onData: (data: AppData) => void,
  onError: (err: any) => void
): () => void {
  if (!db || !userId) {
    const data = loadLocalGuestData();
    onData(data);
    return () => {};
  }

  const cyclesRef = collection(db, 'users', userId, 'cycles');
  const logsRef = collection(db, 'users', userId, 'logs');
  const settingsRef = doc(db, 'users', userId, 'profile', 'settings');

  let currentCycles: PeriodCycle[] = [];
  let currentLogs: Record<string, DayLog> = {};
  let currentSettings: UserSettings = DEFAULT_SETTINGS;

  const emit = () => {
    onData({
      cycles: currentCycles,
      dayLogs: currentLogs,
      settings: currentSettings
    });
  };

  const unsubCycles = onSnapshot(
    cyclesRef,
    (snapshot) => {
      currentCycles = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<PeriodCycle, 'id'>)
      }));
      emit();
    },
    onError
  );

  const unsubLogs = onSnapshot(
    logsRef,
    (snapshot) => {
      const logsMap: Record<string, DayLog> = {};
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as DayLog;
        logsMap[data.date] = data;
      });
      currentLogs = logsMap;
      emit();
    },
    onError
  );

  const unsubSettings = onSnapshot(
    settingsRef,
    (docSnap) => {
      if (docSnap.exists()) {
        currentSettings = { ...DEFAULT_SETTINGS, ...(docSnap.data() as UserSettings) };
      } else {
        currentSettings = DEFAULT_SETTINGS;
      }
      emit();
    },
    onError
  );

  return () => {
    unsubCycles();
    unsubLogs();
    unsubSettings();
  };
}

export async function saveCycle(userId: string | null, cycle: PeriodCycle): Promise<void> {
  if (!userId || !db) {
    const data = loadLocalGuestData();
    const existingIndex = data.cycles.findIndex((c) => c.id === cycle.id);
    if (existingIndex >= 0) {
      data.cycles[existingIndex] = cycle;
    } else {
      data.cycles.push(cycle);
    }
    saveLocalGuestData(data);
    return;
  }

  const cycleRef = doc(db, 'users', userId, 'cycles', cycle.id);
  await setDoc(cycleRef, cycle, { merge: true });
}

export async function deleteCycle(userId: string | null, cycleId: string): Promise<void> {
  if (!userId || !db) {
    const data = loadLocalGuestData();
    data.cycles = data.cycles.filter((c) => c.id !== cycleId);
    saveLocalGuestData(data);
    return;
  }

  const cycleRef = doc(db, 'users', userId, 'cycles', cycleId);
  await deleteDoc(cycleRef);
}

export async function saveDayLog(userId: string | null, log: DayLog): Promise<void> {
  if (!userId || !db) {
    const data = loadLocalGuestData();
    data.dayLogs[log.date] = log;
    saveLocalGuestData(data);
    return;
  }

  const logRef = doc(db, 'users', userId, 'logs', log.date);
  await setDoc(logRef, log, { merge: true });
}

export async function deleteDayLog(userId: string | null, dateStr: string): Promise<void> {
  if (!userId || !db) {
    const data = loadLocalGuestData();
    delete data.dayLogs[dateStr];
    saveLocalGuestData(data);
    return;
  }

  const logRef = doc(db, 'users', userId, 'logs', dateStr);
  await deleteDoc(logRef);
}

export async function saveSettings(userId: string | null, settings: UserSettings): Promise<void> {
  if (!userId || !db) {
    const data = loadLocalGuestData();
    data.settings = settings;
    saveLocalGuestData(data);
    return;
  }

  const settingsRef = doc(db, 'users', userId, 'profile', 'settings');
  await setDoc(settingsRef, settings, { merge: true });
}

export function loadLocalGuestData(): AppData {
  try {
    const cycles = JSON.parse(localStorage.getItem(LOCAL_CYCLES_KEY) || '[]');
    const dayLogs = JSON.parse(localStorage.getItem(LOCAL_LOGS_KEY) || '{}');
    const settings = JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || JSON.stringify(DEFAULT_SETTINGS));
    return { cycles, dayLogs, settings };
  } catch {
    return { cycles: [], dayLogs: {}, settings: DEFAULT_SETTINGS };
  }
}

export function saveLocalGuestData(data: AppData): void {
  localStorage.setItem(LOCAL_CYCLES_KEY, JSON.stringify(data.cycles));
  localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(data.dayLogs));
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(data.settings));
}

export function exportDataAsJSON(data: AppData): void {
  const exportPayload = {
    appName: 'Eva Period Calendar',
    version: 1,
    exportDate: new Date().toISOString(),
    data
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eva-calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importDataFromJSON(
  userId: string | null,
  jsonText: string
): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const parsed = JSON.parse(jsonText);
    const incomingData: AppData = parsed.data || parsed;

    if (!incomingData.cycles && !incomingData.dayLogs) {
      throw new Error('Неверный формат файла резервной копии');
    }

    const cycles = incomingData.cycles || [];
    const logs = incomingData.dayLogs || {};
    const settings = incomingData.settings || DEFAULT_SETTINGS;

    if (userId && db) {
      const ops: { ref: ReturnType<typeof doc>; data: unknown }[] = [];

      for (const c of cycles) {
        if (!c || !c.id) continue;
        ops.push({
          ref: doc(db, 'users', userId, 'cycles', c.id),
          data: c
        });
      }

      for (const [dateKey, log] of Object.entries(logs)) {
        if (!dateKey || !log) continue;
        ops.push({
          ref: doc(db, 'users', userId, 'logs', dateKey),
          data: log
        });
      }

      ops.push({
        ref: doc(db, 'users', userId, 'profile', 'settings'),
        data: settings
      });

      const CHUNK_SIZE = 400;
      for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
        const chunk = ops.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const op of chunk) {
          batch.set(op.ref, op.data as Record<string, unknown>, { merge: true });
        }
        await batch.commit();
      }
    } else {
      saveLocalGuestData({ cycles, dayLogs: logs, settings });
    }

    return {
      success: true,
      message: 'Данные успешно восстановлены!',
      count: cycles.length + Object.keys(logs).length
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Ошибка импорта файла';
    return {
      success: false,
      message: errorMsg,
      count: 0
    };
  }
}

export async function migrateGuestDataToCloud(userId: string): Promise<boolean> {
  if (!userId || !db) return false;
  try {
    const guestData = loadLocalGuestData();
    const hasCycles = guestData.cycles && guestData.cycles.length > 0;
    const hasLogs = guestData.dayLogs && Object.keys(guestData.dayLogs).length > 0;

    if (!hasCycles && !hasLogs) {
      return false;
    }

    const ops: { ref: ReturnType<typeof doc>; data: unknown }[] = [];

    for (const c of guestData.cycles) {
      if (!c || !c.id) continue;
      ops.push({
        ref: doc(db, 'users', userId, 'cycles', c.id),
        data: c
      });
    }

    for (const [dateKey, log] of Object.entries(guestData.dayLogs)) {
      if (!dateKey || !log) continue;
      ops.push({
        ref: doc(db, 'users', userId, 'logs', dateKey),
        data: log
      });
    }

    if (guestData.settings) {
      ops.push({
        ref: doc(db, 'users', userId, 'profile', 'settings'),
        data: guestData.settings
      });
    }

    const CHUNK_SIZE = 400;
    for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
      const chunk = ops.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const op of chunk) {
        batch.set(op.ref, op.data as Record<string, unknown>, { merge: true });
      }
      await batch.commit();
    }

    localStorage.removeItem(LOCAL_CYCLES_KEY);
    localStorage.removeItem(LOCAL_LOGS_KEY);
    localStorage.removeItem(LOCAL_SETTINGS_KEY);

    return true;
  } catch (err) {
    console.error('Error migrating guest data to cloud:', err);
    return false;
  }
}
