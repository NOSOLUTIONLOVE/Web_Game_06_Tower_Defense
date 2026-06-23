/**
 * useGameStore - Zustand 全局状态
 *
 * 桥接 UI 层（React）与游戏层（GameEngine）
 * - GameEngine 通过 actions 通知 UI 状态变化
 * - UI 通过 actions 触发 GameEngine 行为
 * - 持久化关卡进度 + 音量设置到 localStorage
 *
 * 设计原则：
 * - 引擎内部状态（towers/enemies/projectiles）私有持有，store 仅缓存 UI 关心的快照
 * - 仅事件触发 store 更新（建塔/升级/胜利/失败等关键事件）
 * - 一次性事件（胜利弹窗/错误 toast）通过 clearXxx actions 主动清除
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CONFIG, type GamePhase, type TimeScale } from '../config';

export interface GameStore {
  // ============ 阶段 / 引擎摘要 ============
  phase: GamePhase;
  currentLevelId: number;
  totalLevels: number;
  levelName: string;
  gold: number;
  lives: number;
  wave: number;
  totalWaves: number;
  timeScale: TimeScale;

  // ============ 关卡进度（持久化）============
  unlockedLevels: number[];
  levelBestScore: Record<number, number>;
  levelCleared: Record<number, boolean>;

  // ============ 设置（持久化）============
  audioEnabled: boolean;

  // ============ 一次性事件标记 ============
  flashWin: { levelId: number; score: number; isNewBest: boolean } | null;
  lastError: string | null;

  // ============ actions（GameEngine 调用）============
  setPhase: (phase: GamePhase) => void;
  setLevel: (id: number, name: string, total: number, totalWaves: number) => void;
  setStats: (stats: { gold: number; lives: number; wave: number; totalWaves: number }) => void;
  setProgress: (progress: {
    unlocked: number[];
    bestScore: Record<number, number>;
    cleared: Record<number, boolean>;
  }) => void;
  setFlashWin: (payload: { levelId: number; score: number; isNewBest: boolean } | null) => void;
  clearFlashWin: () => void;
  setError: (msg: string | null) => void;
  clearError: () => void;
  setTimeScale: (scale: TimeScale) => void;

  // ============ actions（UI 调用）============
  toggleAudio: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  resetProgress: () => void;
}

const DEFAULT_PROGRESS = {
  unlockedLevels: [0] as number[],
  levelBestScore: {} as Record<number, number>,
  levelCleared: {} as Record<number, boolean>,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // ============ 初始状态 ============
      phase: 'menu',
      currentLevelId: 0,
      totalLevels: 0,
      levelName: '',
      gold: CONFIG.ECONOMY.START_GOLD,
      lives: CONFIG.ECONOMY.START_LIVES,
      wave: 0,
      totalWaves: 0,
      timeScale: 1,

      ...DEFAULT_PROGRESS,

      audioEnabled: true,

      flashWin: null,
      lastError: null,

      // ============ GameEngine 回调 ============
      setPhase: (phase) => set({ phase }),
      setLevel: (id, name, total, totalWaves) =>
        set({
          currentLevelId: id,
          levelName: name,
          totalLevels: total,
          totalWaves,
        }),
      setStats: (stats) =>
        set({
          gold: stats.gold,
          lives: stats.lives,
          wave: stats.wave,
          totalWaves: stats.totalWaves,
        }),
      setProgress: (progress) =>
        set({
          unlockedLevels: [...progress.unlocked],
          levelBestScore: { ...progress.bestScore },
          levelCleared: { ...progress.cleared },
        }),
      setFlashWin: (payload) => set({ flashWin: payload }),
      clearFlashWin: () => set({ flashWin: null }),
      setError: (msg) => set({ lastError: msg }),
      clearError: () => set({ lastError: null }),
      setTimeScale: (scale) => set({ timeScale: scale }),

      // ============ UI 回调 ============
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
      setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
      resetProgress: () =>
        set({
          ...DEFAULT_PROGRESS,
        }),
    }),
    {
      name: CONFIG.STORAGE_KEYS.STORE, // 'tower-defense:store'
      // 仅持久化进度 + 设置；游戏运行时状态不持久化
      partialize: (s) => ({
        unlockedLevels: s.unlockedLevels,
        levelBestScore: s.levelBestScore,
        levelCleared: s.levelCleared,
        audioEnabled: s.audioEnabled,
      }),
    }
  )
);
