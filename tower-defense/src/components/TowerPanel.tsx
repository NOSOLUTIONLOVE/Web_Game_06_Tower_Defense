/**
 * TowerPanel - 选中已有塔时的属性面板
 *
 * 显示：等级 / 伤害 / 射程 / 攻击速度 / 总投入 / 升级按钮 / 出售按钮
 */

import { ArrowUp, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { useGameStore } from '../store/useGameStore';
import { useEngine } from './GameCanvas';

export function TowerPanel() {
  const gold = useGameStore((s) => s.gold);
  const engine = useEngine();
  const selectedId = engine.selectedTowerId;
  const tower = selectedId ? engine.towers.find((t) => t.id === selectedId) : null;

  return (
    <AnimatePresence>
      {tower && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-2 right-2 z-20 w-56 rounded-lg border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl p-3 text-xs"
        >
          {/* 标题 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: tower.data.color }}
              />
              <span className="font-bold text-sm">{tower.data.name}</span>
              <span className="text-muted-foreground text-[10px]">
                Lv{tower.level}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => engine.clearSelection()}
              className="h-6 w-6"
              aria-label="关闭"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* 属性 */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <Stat label="伤害" value={tower.data.damage.toString()} />
            <Stat label="射程" value={tower.data.range.toString()} />
            <Stat label="攻速" value={`${tower.data.attackSpeed.toFixed(1)}/s`} />
            {tower.data.effect === 'slow' && (
              <Stat label="减速" value={`${Math.round((1 - (tower.data.slowFactor ?? 1)) * 100)}%`} />
            )}
            {tower.data.effect === 'splash' && (
              <Stat label="溅射" value={tower.data.splashRadius?.toString() ?? '0'} />
            )}
          </div>

          {/* 升级 / 出售 */}
          <div className="mt-3 flex gap-1.5">
            {tower.level < 3 ? (
              <Button
                size="sm"
                onClick={() => engine.upgradeTower(tower.id)}
                disabled={gold < tower.data.upgradeCost}
                className="flex-1 h-8 text-xs gap-1"
              >
                <ArrowUp className="h-3 w-3" />
                升级
                <span className="ml-auto text-yellow-300 font-mono">
                  {tower.data.upgradeCost}
                </span>
              </Button>
            ) : (
              <Button size="sm" disabled className="flex-1 h-8 text-xs">
                MAX
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                engine.sellTower(tower.id);
                engine.clearSelection();
              }}
              className="h-8 text-xs gap-1"
            >
              <Trash2 className="h-3 w-3" />
              出售
              <span className="ml-1 text-yellow-300 font-mono">
                +{tower.getSellValue()}
              </span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-bold tabular-nums">{value}</span>
    </div>
  );
}
