/**
 * 5 关 × 10 波 = 50 个波次
 *
 * 难度梯度：
 * - Level 1: 简单（少量普通 + 快速）
 * - Level 2: 中等（普通 + 快速 + 少量重甲）
 * - Level 3: 偏难（快速 + 重甲混合）
 * - Level 4: 难（含飞行敌人）
 * - Level 5: Boss 关（最后 3 波有 boss）
 */

import type { Wave } from '../../config';

/** 通用 helper：创建 N 个同类型敌人 */
function spawn(type: Wave['spawns'][0]['type'], count: number, interval: number): Wave['spawns'] {
  return [{ type, count, interval }];
}

function spawnMulti(...items: Wave['spawns']): Wave['spawns'] {
  return items;
}

// =====================================================
// Level 1: 简单（教学）
// =====================================================
const WAVES_LV1: Wave[] = [
  { index: 1, spawns: spawn('normal', 5, 1000), bonus: 25 },
  { index: 2, spawns: spawn('normal', 8, 800), bonus: 25 },
  { index: 3, spawns: spawn('fast', 6, 700), bonus: 25 },
  { index: 4, spawns: spawnMulti({ type: 'normal', count: 5, interval: 800 }, { type: 'fast', count: 3, interval: 600 }), bonus: 25 },
  { index: 5, spawns: spawn('normal', 12, 600), bonus: 25 },
  { index: 6, spawns: spawn('fast', 10, 500), bonus: 25 },
  { index: 7, spawns: spawnMulti({ type: 'heavy', count: 2, interval: 1500 }, { type: 'normal', count: 5, interval: 600 }), bonus: 25 },
  { index: 8, spawns: spawn('fast', 15, 400), bonus: 25 },
  { index: 9, spawns: spawnMulti({ type: 'heavy', count: 4, interval: 1200 }, { type: 'normal', count: 8, interval: 500 }), bonus: 25 },
  { index: 10, spawns: spawn('boss', 1, 0), bonus: 100 },
];

// =====================================================
// Level 2: S 形弯道（中等）
// =====================================================
const WAVES_LV2: Wave[] = [
  { index: 1, spawns: spawn('normal', 8, 800), bonus: 25 },
  { index: 2, spawns: spawn('fast', 8, 600), bonus: 25 },
  { index: 3, spawns: spawnMulti({ type: 'normal', count: 8, interval: 600 }, { type: 'fast', count: 5, interval: 500 }), bonus: 25 },
  { index: 4, spawns: spawn('heavy', 4, 1000), bonus: 25 },
  { index: 5, spawns: spawnMulti({ type: 'fast', count: 12, interval: 400 }, { type: 'normal', count: 6, interval: 600 }), bonus: 25 },
  { index: 6, spawns: spawn('heavy', 6, 800), bonus: 25 },
  { index: 7, spawns: spawnMulti({ type: 'heavy', count: 4, interval: 1000 }, { type: 'fast', count: 8, interval: 400 }), bonus: 25 },
  { index: 8, spawns: spawn('normal', 20, 300), bonus: 25 },
  { index: 9, spawns: spawnMulti({ type: 'heavy', count: 6, interval: 800 }, { type: 'fast', count: 10, interval: 300 }), bonus: 25 },
  { index: 10, spawns: spawnMulti({ type: 'boss', count: 1, interval: 0 }, { type: 'fast', count: 8, interval: 400 }), bonus: 100 },
];

// =====================================================
// Level 3: 双分支汇聚
// =====================================================
const WAVES_LV3: Wave[] = [
  { index: 1, spawns: spawn('normal', 10, 700), bonus: 25 },
  { index: 2, spawns: spawn('fast', 12, 500), bonus: 25 },
  { index: 3, spawns: spawn('heavy', 5, 1000), bonus: 25 },
  { index: 4, spawns: spawnMulti({ type: 'fast', count: 15, interval: 300 }, { type: 'normal', count: 8, interval: 500 }), bonus: 25 },
  { index: 5, spawns: spawn('heavy', 8, 800), bonus: 25 },
  { index: 6, spawns: spawn('flying', 8, 600), bonus: 25 },
  { index: 7, spawns: spawnMulti({ type: 'heavy', count: 6, interval: 800 }, { type: 'flying', count: 10, interval: 400 }), bonus: 25 },
  { index: 8, spawns: spawn('fast', 20, 250), bonus: 25 },
  { index: 9, spawns: spawnMulti({ type: 'flying', count: 15, interval: 300 }, { type: 'heavy', count: 6, interval: 800 }), bonus: 25 },
  { index: 10, spawns: spawnMulti({ type: 'boss', count: 2, interval: 3000 }, { type: 'flying', count: 10, interval: 400 }), bonus: 100 },
];

// =====================================================
// Level 4: 长距离
// =====================================================
const WAVES_LV4: Wave[] = [
  { index: 1, spawns: spawn('normal', 12, 600), bonus: 25 },
  { index: 2, spawns: spawn('fast', 15, 400), bonus: 25 },
  { index: 3, spawns: spawn('heavy', 8, 800), bonus: 25 },
  { index: 4, spawns: spawn('flying', 12, 500), bonus: 25 },
  { index: 5, spawns: spawnMulti({ type: 'heavy', count: 8, interval: 700 }, { type: 'fast', count: 12, interval: 350 }), bonus: 25 },
  { index: 6, spawns: spawn('flying', 18, 350), bonus: 25 },
  { index: 7, spawns: spawnMulti({ type: 'heavy', count: 10, interval: 600 }, { type: 'flying', count: 12, interval: 400 }), bonus: 25 },
  { index: 8, spawns: spawn('fast', 25, 200), bonus: 25 },
  { index: 9, spawns: spawnMulti({ type: 'boss', count: 1, interval: 0 }, { type: 'flying', count: 12, interval: 400 }, { type: 'fast', count: 10, interval: 300 }), bonus: 25 },
  { index: 10, spawns: spawnMulti({ type: 'boss', count: 2, interval: 4000 }, { type: 'heavy', count: 8, interval: 600 }, { type: 'flying', count: 10, interval: 400 }), bonus: 100 },
];

// =====================================================
// Level 5: Boss Arena
// =====================================================
const WAVES_LV5: Wave[] = [
  { index: 1, spawns: spawn('normal', 15, 500), bonus: 25 },
  { index: 2, spawns: spawn('fast', 20, 300), bonus: 25 },
  { index: 3, spawns: spawn('heavy', 10, 600), bonus: 25 },
  { index: 4, spawns: spawn('flying', 15, 400), bonus: 25 },
  { index: 5, spawns: spawnMulti({ type: 'heavy', count: 8, interval: 600 }, { type: 'flying', count: 12, interval: 400 }), bonus: 25 },
  { index: 6, spawns: spawnMulti({ type: 'boss', count: 1, interval: 0 }, { type: 'fast', count: 15, interval: 300 }), bonus: 25 },
  { index: 7, spawns: spawnMulti({ type: 'flying', count: 20, interval: 300 }, { type: 'heavy', count: 8, interval: 600 }), bonus: 25 },
  { index: 8, spawns: spawnMulti({ type: 'boss', count: 2, interval: 3000 }, { type: 'heavy', count: 6, interval: 600 }), bonus: 25 },
  { index: 9, spawns: spawnMulti({ type: 'boss', count: 2, interval: 2500 }, { type: 'flying', count: 15, interval: 350 }, { type: 'fast', count: 10, interval: 300 }), bonus: 25 },
  { index: 10, spawns: spawnMulti({ type: 'boss', count: 3, interval: 3000 }, { type: 'heavy', count: 8, interval: 500 }, { type: 'flying', count: 10, interval: 400 }), bonus: 100 },
];

export const BUILTIN_WAVES: Record<number, Wave[]> = {
  0: WAVES_LV1,
  1: WAVES_LV2,
  2: WAVES_LV3,
  3: WAVES_LV4,
  4: WAVES_LV5,
};
