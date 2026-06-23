/**
 * 关卡进度持久化
 */

import { storage } from '../../lib/storage';
import { CONFIG } from '../../config';

export interface LevelProgress {
  unlocked: number[];
  bestScore: Record<number, number>;
  cleared: Record<number, boolean>;
}

const DEFAULT_PROGRESS: LevelProgress = {
  unlocked: [0], // 默认解锁第 1 关
  bestScore: {},
  cleared: {},
};

export function loadProgress(): LevelProgress {
  return storage.get<LevelProgress>(CONFIG.STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
}

export function saveProgress(p: LevelProgress): void {
  storage.set(CONFIG.STORAGE_KEYS.PROGRESS, p);
}

export function unlockNextLevel(progress: LevelProgress, levelId: number, totalLevels: number): LevelProgress {
  const next = levelId + 1;
  if (next < totalLevels && !progress.unlocked.includes(next)) {
    return {
      ...progress,
      unlocked: [...progress.unlocked, next],
    };
  }
  return progress;
}
