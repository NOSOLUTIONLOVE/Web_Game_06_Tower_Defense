/**
 * GameCanvas - Canvas 挂载点 + GameEngine 生命周期管理
 *
 * 职责：
 * - 渲染 <canvas> 元素
 * - useEffect 实例化 GameEngine + Renderer + Input
 * - 桥接 engine 回调 → Zustand store
 * - 同步 store (audioEnabled) → engine
 * - 通过 Context 暴露 engine 实例给子组件（HUD/Overlays/ActionBar）
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Renderer } from '../engine/Renderer';
import { Input } from '../engine/Input';
import { useGameStore } from '../store/useGameStore';
import { TOWERS } from '../config/towers';

const EngineContext = createContext<GameEngine | null>(null);

/** 获取 GameEngine 实例（必须在 GameCanvas 内使用） */
export function useEngine(): GameEngine {
  const engine = useContext(EngineContext);
  if (!engine) {
    throw new Error('useEngine must be used within GameCanvas');
  }
  return engine;
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);

  // 实例化引擎（一次性）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const store = useGameStore.getState();
    const e = new GameEngine();
    e.setCallbacks({
      onPhaseChange: (p) => useGameStore.getState().setPhase(p),
      onStatsChange: (s) => useGameStore.getState().setStats(s),
      onLevelStart: (lv) =>
        useGameStore.getState().setLevel(lv.id, lv.name, e.totalLevels, lv.waves.length),
      onLevelWin: (score, isNewBest) =>
        useGameStore.getState().setFlashWin({
          levelId: e.currentLevelId,
          score,
          isNewBest,
        }),
      onLevelLose: () => useGameStore.getState().setPhase('over'),
      onTimeScaleChange: (s) => useGameStore.getState().setTimeScale(s),
      onError: (m) => {
        useGameStore.getState().setError(m);
        setTimeout(() => useGameStore.getState().clearError(), 2500);
      },
    });
    // 同步初始进度到 store
    useGameStore.getState().setProgress({
      unlocked: store.unlockedLevels,
      bestScore: store.levelBestScore,
      cleared: store.levelCleared,
    });

    setEngine(e);

    // 渲染器
    const renderer = new Renderer(canvas);

    // 输入
    const input = new Input();
    input.bind(
      {
        onCellClick: (cell) => e.handleCellClick(cell),
        onCellHover: (cell) => e.setHoveredCell(cell),
        onRightClick: (cell) => {
          // 右键 = 取消选择
          e.clearSelection();
          void cell;
        },
        onSelectTowerType: (type) => e.selectTowerType(type),
        onPause: () => e.togglePause(),
        onStartNextWave: () => e.startNextWave(),
        onUpgradeSelected: () => {
          if (e.selectedTowerId) e.upgradeTower(e.selectedTowerId);
        },
        onSellSelected: () => {
          if (e.selectedTowerId) {
            e.sellTower(e.selectedTowerId);
            e.clearSelection();
          }
        },
        onToggleSpeed: () => e.toggleSpeed(),
        onClearSelection: () => e.clearSelection(),
      },
      canvas
    );

    // 渲染循环
    let rafId = 0;
    const loop = (): void => {
      renderer.render(e.getRenderSnapshot());
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      input.unbind();
      e.stop();
      setEngine(null);
    };
  }, []);

  // 同步 audioEnabled
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  useEffect(() => {
    if (engine) engine.audio.setEnabled(audioEnabled);
  }, [audioEnabled, engine]);

  return (
    <EngineContext.Provider value={engine}>
      <canvas
        ref={canvasRef}
        className="rounded-xl ring-1 ring-white/10 shadow-2xl shadow-purple-500/20 bg-zinc-950"
        style={{ touchAction: 'none' }}
      />
    </EngineContext.Provider>
  );
}

/** 工具：获取塔当前等级的费用（UI 面板用） */
export function getTowerCost(type: 'archer' | 'frost' | 'cannon', level: 1 | 2 | 3 = 1): number {
  return TOWERS[type][level].cost;
}
