/**
 * Overlays - 根据 phase 路由到对应覆盖层
 *
 * - menu / levelSelect: 居中弹层
 * - paused: 居中弹层
 * - win / over: 由 WinModal / LoseModal 全屏覆盖（在 GameCanvas 之外）
 */

import { useGameStore } from '../store/useGameStore';
import { MainMenu } from './MainMenu';
import { LevelSelect } from './LevelSelect';
import { PauseOverlay } from './PauseOverlay';
import { useEngine } from './GameCanvas';

interface OverlaysProps {
  onStartFromMenu: () => void;
}

export function Overlays({ onStartFromMenu }: OverlaysProps) {
  const phase = useGameStore((s) => s.phase);
  const engine = useEngine();

  if (phase === 'menu') {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
        <MainMenu
          onStart={onStartFromMenu}
          onLevelSelect={() => engine.goToLevelSelect()}
        />
      </div>
    );
  }

  if (phase === 'levelSelect') {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm overflow-auto">
        <LevelSelect
          onPick={(id) => engine.startLevel(id)}
          onBack={() => engine.goToMenu()}
        />
      </div>
    );
  }

  if (phase === 'paused') {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
        <PauseOverlay
          onResume={() => engine.togglePause()}
          onReset={() => engine.resetLevel()}
          onMenu={() => engine.goToMenu()}
        />
      </div>
    );
  }

  return null;
}
