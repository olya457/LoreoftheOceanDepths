import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LordKey } from '../navigation/types';

const KEY_POINTS = 'progress_points_v1';

function keyUnlocked(lord: LordKey) {
  return `progress_unlocked_${lord}_v1`;
}

const UNLOCK_COST = 300;
const MAX_STORIES = 15;

export function getUnlockCost(): number {
  return UNLOCK_COST;
}

async function ensureDefaults(lord: LordKey): Promise<void> {
  const p = await AsyncStorage.getItem(KEY_POINTS);
  if (p === null) {
    await AsyncStorage.setItem(KEY_POINTS, '0');
  }

  const uKey = keyUnlocked(lord);
  const u = await AsyncStorage.getItem(uKey);
  if (u === null) {
    await AsyncStorage.setItem(uKey, '1');
  }
}

export async function getPoints(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY_POINTS);
  const num = raw ? Number(raw) : 0;
  if (Number.isFinite(num)) return num;
  return 0;
}

export async function setPoints(points: number): Promise<void> {
  const safe = Math.max(0, Math.floor(points));
  await AsyncStorage.setItem(KEY_POINTS, String(safe));
}

export async function addPoints(delta: number): Promise<number> {
  const cur = await getPoints();
  const next = Math.max(0, Math.floor(cur + delta));
  await AsyncStorage.setItem(KEY_POINTS, String(next));
  return next;
}

export async function getUnlockedCount(lord: LordKey): Promise<number> {
  await ensureDefaults(lord);
  const raw = await AsyncStorage.getItem(keyUnlocked(lord));
  const n = raw ? Number(raw) : 1;
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(MAX_STORIES, Math.floor(n)));
}

async function setUnlockedCount(lord: LordKey, count: number): Promise<number> {
  const safe = Math.max(1, Math.min(MAX_STORIES, Math.floor(count)));
  await AsyncStorage.setItem(keyUnlocked(lord), String(safe));
  return safe;
}

export async function unlockNextStory(
  lord: LordKey
): Promise<{ ok: boolean; points: number; unlockedCount: number; reason?: 'not_enough_points' }> {
  await ensureDefaults(lord);

  const points = await getPoints();
  const unlockedCount = await getUnlockedCount(lord);

  if (unlockedCount >= MAX_STORIES) {
    return { ok: true, points, unlockedCount };
  }

  if (points < UNLOCK_COST) {
    return { ok: false, points, unlockedCount, reason: 'not_enough_points' };
  }

  const newPoints = points - UNLOCK_COST;
  await setPoints(newPoints);

  const newUnlocked = await setUnlockedCount(lord, unlockedCount + 1);

  return { ok: true, points: newPoints, unlockedCount: newUnlocked };
}
