/**
 * TowerDefenseGame - 顶层游戏组件
 *
 * 整合：
 * - GameCanvas（Canvas + Engine + Renderer + Input）
 * - HUD（顶栏：金币/生命/波次/控制）
 * - ActionBar（塔选择 + Start Wave）
 * - TowerPanel（选中塔时显示）
 * - Overlays（菜单 / 关卡选择 / 暂停）
 * - WinModal / LoseModal
 * - ErrorToast
 * - Footer
 */

import { useGameStore } from '../store/useGameStore';
import { GameCanvas } from './GameCanvas';
import { HUD } from './HUD';
import { ActionBar } from './ActionBar';
import { TowerPanel } from './TowerPanel';
import { Overlays } from './Overlays';
import { WinModal } from './WinModal';
import { LoseModal } from './LoseModal';
import { ErrorToast } from './ErrorToast';
import { Footer } from './Footer';
import { Card, CardContent } from './ui/card';
import { useEffect, useState } from 'react';

export function TowerDefenseGame() {
  // 响应式：视口宽度 < 700 时缩小画布比例（保持 4:3）
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = (): void => {
      const w = window.innerWidth;
      // 卡片 padding 24*2 = 48，留 16px 余量
      const available = Math.min(w - 64, 640);
      setScale(Math.max(0.6, Math.min(1, available / 640)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 px-2 md:px-0">
      <Card>
        <CardContent className="p-2 md:p-4 space-y-3">
          <HUD />
          <div
            className="relative mx-auto flex items-center justify-center"
            style={{
              width: 640 * scale,
              height: 480 * scale,
              touchAction: 'none',
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <GameCanvas />
              <CanvasChildren />
              <ErrorToast />
            </div>
          </div>
          <ActionBar />
        </CardContent>
      </Card>
      <Footer />
    </div>
  );
}

/** 内部组件：在 EngineContext 内部使用 hooks（Overlays/TowerPanel/WinModal 需要） */
function CanvasChildren() {
  return (
    <>
      <Overlays onStartFromMenu={() => useGameStore.getState().setPhase('levelSelect')} />
      <TowerPanel />
      <WinModal />
      <LoseModal />
    </>
  );
}

/** 顶层根组件：自动从菜单进入关卡选择（首次） */
export function TowerDefenseGameRoot() {
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);

  // 首次加载：进入关卡选择
  useEffect(() => {
    if (phase === 'menu') {
      setPhase('levelSelect');
    }
  }, [phase, setPhase]);

  return <TowerDefenseGame />;
}
