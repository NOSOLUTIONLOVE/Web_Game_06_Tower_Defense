/**
 * MainMenu - 主菜单覆盖层
 *
 * 显示 Logo + 按钮：开始 / 关卡选择 / 设置
 */

import { Play, Map, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useGameStore } from '../store/useGameStore';

interface MainMenuProps {
  onStart: () => void;
  onLevelSelect: () => void;
}

export function MainMenu({ onStart, onLevelSelect }: MainMenuProps) {
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6 p-8 w-full max-w-md"
    >
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-wider text-primary text-glow">
          TOWER
        </h1>
        <h1 className="text-4xl md:text-5xl font-black tracking-wider text-primary text-glow">
          DEFENSE
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          像素风塔防 · 5 关卡 · 3 塔 · 5 敌人
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button size="lg" onClick={onStart} className="w-full gap-2">
          <Play className="h-4 w-4" />
          开始游戏
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onLevelSelect}
          className="w-full gap-2"
        >
          <Map className="h-4 w-4" />
          关卡选择 ({unlockedLevels.length}/5)
        </Button>
      </div>

      <a
        href="https://github.com/carlshen/web-game-01"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Github className="h-3 w-3" />
        View on GitHub
      </a>
    </motion.div>
  );
}
