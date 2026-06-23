/**
 * LevelSelect - 关卡选择覆盖层
 *
 * 5 张关卡卡片：名称 / 难度 / 最佳分 / 已通关 / 锁定
 */

import { motion } from 'framer-motion';
import { Lock, Star, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useGameStore } from '../store/useGameStore';
import { BUILTIN_LEVELS } from '../engine/levels/builtinLevels';

interface LevelSelectProps {
  onPick: (id: number) => void;
  onBack: () => void;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  hard: 'text-rose-400',
};

export function LevelSelect({ onPick, onBack }: LevelSelectProps) {
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);
  const levelBestScore = useGameStore((s) => s.levelBestScore);
  const levelCleared = useGameStore((s) => s.levelCleared);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-stretch gap-4 p-6 w-full max-w-2xl"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-wider text-primary text-glow">
          SELECT LEVEL
        </h2>
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="返回">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BUILTIN_LEVELS.map((lv) => {
          const unlocked = unlockedLevels.includes(lv.id);
          const cleared = levelCleared[lv.id] ?? false;
          const best = levelBestScore[lv.id] ?? 0;
          return (
            <button
              key={lv.id}
              onClick={() => unlocked && onPick(lv.id)}
              disabled={!unlocked}
              className={`relative flex flex-col items-start gap-2 p-4 rounded-lg border transition-all text-left ${
                unlocked
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 cursor-pointer'
                  : 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {String(lv.id + 1).padStart(2, '0')}
                  </span>
                  <span className="font-bold">{lv.name}</span>
                </div>
                {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                {cleared && <Trophy className="h-4 w-4 text-yellow-400" />}
              </div>
              <div className="text-xs text-muted-foreground">{lv.description}</div>
              <div className="flex items-center gap-3 text-xs">
                <span className={`font-mono ${DIFFICULTY_COLOR[lv.difficulty]}`}>
                  {'★'.repeat(lv.difficultyRank)}
                </span>
                {cleared && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-3 w-3 fill-yellow-400" />
                    {best}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
