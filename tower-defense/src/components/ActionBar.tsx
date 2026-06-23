/**
 * ActionBar - 塔选择 + 波次控制
 *
 * 3 个塔按钮（archer / frost / cannon）+ 选中状态高亮 + 费用显示
 * Start Wave / Pause / Speed 控制
 */

import { motion } from 'framer-motion';
import { Coins, Play, Pause, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useGameStore } from '../store/useGameStore';
import { TOWERS } from '../config/towers';
import { useEngine } from './GameCanvas';
import type { TowerType } from '../config';

const TOWER_INFO: Array<{ type: TowerType; label: string; emoji: string; color: string }> = [
  { type: 'archer', label: 'Archer', emoji: '🏹', color: 'text-emerald-400' },
  { type: 'frost', label: 'Frost', emoji: '❄', color: 'text-sky-400' },
  { type: 'cannon', label: 'Cannon', emoji: '💣', color: 'text-orange-400' },
];

export function ActionBar() {
  const gold = useGameStore((s) => s.gold);
  const phase = useGameStore((s) => s.phase);
  const timeScale = useGameStore((s) => s.timeScale);
  const engine = useEngine();

  if (phase !== 'playing' && phase !== 'betweenWaves' && phase !== 'paused') {
    return null;
  }

  const selectedType = engine.selectedTowerType;
  const handlePick = (t: TowerType): void => {
    engine.selectTowerType(selectedType === t ? null : t);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* 塔选择 */}
        <div className="flex items-center gap-2 flex-wrap">
          {TOWER_INFO.map((t) => {
            const cost = TOWERS[t.type][1].cost;
            const canAfford = gold >= cost;
            const isSelected = selectedType === t.type;
            return (
              <motion.button
                key={t.type}
                onClick={() => handlePick(t.type)}
                disabled={!canAfford}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all min-h-[44px] ${
                  isSelected
                    ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20'
                    : canAfford
                      ? 'border-white/10 bg-white/5 hover:bg-white/10'
                      : 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                }`}
                aria-label={`选择 ${t.label} 塔`}
              >
                <span className="text-lg">{t.emoji}</span>
                <div className="text-left">
                  <div className={`text-sm font-bold ${t.color}`}>{t.label}</div>
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    <Coins className="h-3 w-3" />
                    {cost}
                  </div>
                </div>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => engine.startNextWave()}
            disabled={phase === 'paused' || phase === 'playing'}
            className="gap-1"
          >
            <Play className="h-3 w-3" />
            Start Wave
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => engine.togglePause()}
            aria-label={phase === 'paused' ? '继续' : '暂停'}
          >
            {phase === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => engine.toggleSpeed()}
            aria-label="切换速度"
            title={timeScale === 1 ? '2x' : '1x'}
          >
            <Zap className={`h-4 w-4 ${timeScale === 2 ? 'text-yellow-400' : ''}`} />
          </Button>
        </div>
      </div>
      {selectedType && (
        <div className="text-xs text-muted-foreground">
          💡 点击地图空格建造 {TOWER_INFO.find((x) => x.type === selectedType)?.label} 塔 ·
          <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/10">Esc</kbd> 取消
        </div>
      )}
    </div>
  );
}
