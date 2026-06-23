/**
 * HUD - 顶部状态栏
 *
 * 显示：标题 / 金币 / 生命 / 当前波次 / 暂停 / 加速 / 静音 / 设置
 */

import { Coins, Heart, Pause, Play, Settings, Volume2, VolumeX, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button } from './ui/button';
import { useEngine } from './GameCanvas';
import { SettingsPanel } from './SettingsPanel';

export function HUD() {
  const gold = useGameStore((s) => s.gold);
  const lives = useGameStore((s) => s.lives);
  const wave = useGameStore((s) => s.wave);
  const totalWaves = useGameStore((s) => s.totalWaves);
  const timeScale = useGameStore((s) => s.timeScale);
  const phase = useGameStore((s) => s.phase);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const toggleAudio = useGameStore((s) => s.toggleAudio);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const engine = useEngine();

  const inGame = phase === 'playing' || phase === 'betweenWaves' || phase === 'paused';

  return (
    <>
      <div className="flex items-center justify-between w-full gap-2 flex-wrap">
        {/* 左侧标题 */}
        <h1 className="text-xl md:text-2xl font-extrabold tracking-widest text-primary text-glow">
          TOWER DEFENSE
        </h1>

        {/* 中间状态 */}
        {inGame && (
          <div className="flex items-center gap-3 md:gap-4 font-mono text-sm md:text-base">
            {/* 生命 */}
            <motion.div
              key={lives}
              initial={{ scale: 1 }}
              animate={lives <= 5 ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-1 ${lives <= 5 ? 'text-red-400' : 'text-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${lives <= 5 ? 'fill-red-500' : ''}`} />
              <span className="font-bold tabular-nums">{lives}</span>
            </motion.div>
            {/* 金币 */}
            <motion.div
              key={gold}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-1 text-yellow-400"
            >
              <Coins className="h-4 w-4" />
              <span className="font-bold tabular-nums">{gold}</span>
            </motion.div>
            {/* 波次 */}
            <div className="text-muted-foreground">
              <span className="text-[10px] uppercase">Wave</span>
              <span className="ml-1 text-foreground font-bold tabular-nums">
                {wave}/{totalWaves}
              </span>
            </div>
          </div>
        )}

        {/* 右侧控制 */}
        <div className="flex items-center gap-1 md:gap-2">
          {inGame && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => engine.toggleSpeed()}
                aria-label={timeScale === 1 ? '加速到 2x' : '恢复 1x'}
                title={timeScale === 1 ? '2x' : '1x'}
              >
                <Zap className={`h-4 w-4 ${timeScale === 2 ? 'text-yellow-400' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => engine.togglePause()}
                aria-label={phase === 'paused' ? '继续' : '暂停'}
              >
                {phase === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAudio}
            aria-label={audioEnabled ? '关闭音效' : '开启音效'}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="设置"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
