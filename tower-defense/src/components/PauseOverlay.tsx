/**
 * PauseOverlay - 暂停覆盖层
 */

import { motion } from 'framer-motion';
import { Play, RotateCcw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { useEngine } from './GameCanvas';

interface PauseOverlayProps {
  onResume: () => void;
  onReset: () => void;
  onMenu: () => void;
}

export function PauseOverlay({ onResume, onReset, onMenu }: PauseOverlayProps) {
  // 引用 engine 仅做类型守卫
  void useEngine;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center gap-5 p-6 w-full max-w-sm"
    >
      <h2 className="text-3xl font-black tracking-widest text-primary text-glow">PAUSED</h2>
      <div className="flex flex-col gap-2 w-full">
        <Button size="lg" onClick={onResume} className="w-full gap-2">
          <Play className="h-4 w-4" />
          继续
        </Button>
        <Button size="lg" variant="outline" onClick={onReset} className="w-full gap-2">
          <RotateCcw className="h-4 w-4" />
          重玩本关
        </Button>
        <Button size="lg" variant="ghost" onClick={onMenu} className="w-full gap-2">
          <Home className="h-4 w-4" />
          返回菜单
        </Button>
      </div>
    </motion.div>
  );
}
