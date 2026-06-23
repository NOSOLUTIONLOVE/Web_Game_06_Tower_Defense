/**
 * LoseModal - 失败弹窗
 *
 * 重试 / 返回关卡选择
 */

import { motion } from 'framer-motion';
import { Skull, RotateCcw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { useGameStore } from '../store/useGameStore';
import { useEngine } from './GameCanvas';

export function LoseModal() {
  const phase = useGameStore((s) => s.phase);
  const engine = useEngine();

  if (phase !== 'over') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-red-500/30 bg-zinc-950/95 shadow-2xl shadow-red-500/20 w-full max-w-sm mx-4"
      >
        <div className="flex items-center gap-2 text-red-400">
          <Skull className="h-6 w-6" />
          <h2 className="text-2xl font-black tracking-widest">DEFEAT</h2>
          <Skull className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          基地被攻破了。重新布局，尝试不同的塔组合。
        </p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <Button
            size="lg"
            onClick={() => engine.resetLevel()}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            重试
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => engine.goToLevelSelect()}
            className="w-full gap-2"
          >
            <Home className="h-4 w-4" />
            关卡选择
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
