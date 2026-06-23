/**
 * 5 关卡完整定义（地图 + 波次 + 理论分）
 */

import type { Level } from '../../config';
import { BUILTIN_MAPS } from './builtinMaps';
import { BUILTIN_WAVES } from './builtinWaves';

/** 5 关卡完整定义 */
export const BUILTIN_LEVELS: Level[] = BUILTIN_MAPS.map((map) => {
  const waves = BUILTIN_WAVES[map.id]!;
  // 理论最高分 = 全部击杀金币 + 全部波次奖励 + 起始金币 + 起始生命 × 100
  const killGold = waves.reduce((sum, w) => {
    return (
      sum +
      w.spawns.reduce((s, sp) => {
        const rewardMap: Record<string, number> = { normal: 10, fast: 15, heavy: 25, flying: 20, boss: 100 };
        return s + sp.count * (rewardMap[sp.type] ?? 0);
      }, 0)
    );
  }, 0);
  const waveBonus = waves.reduce((s, w) => s + w.bonus, 0);
  const optimalScore = killGold + waveBonus + 150 + 20 * 100;

  return {
    ...map,
    waves,
    optimalScore,
  };
});
