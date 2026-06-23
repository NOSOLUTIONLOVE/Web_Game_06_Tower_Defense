/**
 * WinModal - 胜利弹窗
 *
 * 显示分数、最佳分标记、下一关 / 重玩 / 菜单 按钮
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from './ui/button';
import { useGameStore } from '../store/useGameStore';
import { useEngine } from './GameCanvas';
import { BUILTIN_LEVELS } from '../engine/levels/builtinLevels';

export function WinModal() {
  const flashWin = useGameStore((s) => s.flashWin);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const totalLevels = useGameStore((s) => s.totalLevels);
  const clearFlashWin = useGameStore((s) => s.clearFlashWin);
  const engine = useEngine();

  const isLastLevel = currentLevelId + 1 >= totalLevels;
  const level = BUILTIN_LEVELS[currentLevelId];

  // 关闭弹窗时自动清理
  useEffect(() => {
    if (!flashWin) return;
    const t = setTimeout(() => clearFlashWin(), 1000);
    return () => clearTimeout(t);
  }, [flashWin, clearFlashWin]);

  return (
    <AnimatePresence>
      {flashWin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-yellow-500/30 bg-zinc-950/95 shadow-2xl shadow-yellow-500/20 w-full max-w-sm mx-4"
          >
            <div className="flex items-center gap-2 text-yellow-400">
              <Trophy className="h-6 w-6" />
              <h2 className="text-2xl font-black tracking-widest text-glow">VICTORY</h2>
              <Trophy className="h-6 w-6" />
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">{level?.name}</div>
              <div className="text-5xl font-black font-mono text-primary text-glow mt-1">
                {flashWin.score}
              </div>
              {flashWin.isNewBest && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                  <Star className="h-3 w-3 fill-yellow-400" /> NEW BEST
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
              {!isLastLevel && (
                <Button
                  size="lg"
                  onClick={() => {
                    clearFlashWin();
                    engine.nextLevel();
                  }}
                  className="w-full gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  下一关
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  clearFlashWin();
                  engine.resetLevel();
                }}
                className="w-full gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                重玩本关
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  clearFlashWin();
                  engine.goToLevelSelect();
                }}
                className="w-full gap-2"
              >
                <Home className="h-4 w-4" />
                关卡选择
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
