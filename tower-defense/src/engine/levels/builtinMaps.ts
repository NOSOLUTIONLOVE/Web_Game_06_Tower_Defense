/**
 * 5 关地图（16×12 网格）
 *
 * 字符说明：
 * - '#': 装饰/障碍（不能建塔，敌人也走不了）
 * - '.': 路径（敌人行走路线，不能建塔）
 * - ' ': 草地（可以建塔）
 * - 'S': 起点（路径）
 * - 'E': 终点（路径）
 */

import type { CellType, Level, Point } from '../../config';

/** 解析字符串地图为 CellType 二维数组 */
function parseMap(rows: string[]): {
  cells: CellType[][];
  start: Point;
  end: Point;
} {
  const cells: CellType[][] = [];
  let start: Point = { x: 0, y: 0 };
  let end: Point = { x: 0, y: 0 };

  rows.forEach((row, y) => {
    const rowCells: CellType[] = [];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '#') {
        rowCells.push('blocked');
      } else if (ch === '.' || ch === 'S' || ch === 'E') {
        rowCells.push('path');
        if (ch === 'S') start = { x, y };
        if (ch === 'E') end = { x, y };
      } else {
        rowCells.push('grass');
      }
    }
    cells.push(rowCells);
  });

  return { cells, start, end };
}

// =====================================================
// Level 1: 教学关（直行到底 + 1 个弯）
// =====================================================
const LV1 = [
  'S...............',
  '.               ',
  '.  #############',
  '.               ',
  '.               ',
  '.  #############',
  '.               ',
  '.               ',
  '.  #############',
  '.               ',
  '.               ',
  '...............E',
];

// =====================================================
// Level 2: S 形弯道
// =====================================================
const LV2 = [
  'S...............',
  '.               ',
  '.#############..',
  '.               ',
  '.               ',
  '..#############.',
  '.               ',
  '.               ',
  '.#############..',
  '.               ',
  '.               ',
  '...............E',
];

// =====================================================
// Level 3: 螺旋路径
// =====================================================
const LV3 = [
  'S...............',
  '.##############.',
  '.              .',
  '.##########...#.',
  '.          .# .#',
  '.##########.#.#.',
  '.          .# .#',
  '.##########.#.#.',
  '.          .# .#',
  '.##########.#.#.',
  '.            .#.',
  '...............E',
];

// =====================================================
// Level 4: 多弯路径
// =====================================================
const LV4 = [
  'S...............',
  '.               ',
  '.##############.',
  '.               ',
  '.##############.',
  '.               ',
  '.##############.',
  '.               ',
  '.##############.',
  '.               ',
  '.               ',
  '...............E',
];

// =====================================================
// Level 5: 复杂长路径
// =====================================================
const LV5 = [
  'S...............',
  '.               ',
  '.##############.',
  '.               ',
  '.              .',
  '.##############.',
  '.               ',
  '.##############.',
  '.              .',
  '.##############.',
  '.               ',
  '...............E',
];

/** 5 张地图原始定义 */
const MAP_DEFS = [
  { rows: LV1, name: 'Grasslands', desc: '教学关 - 直行 + 弯道', difficulty: 'easy' as const, rank: 1 },
  { rows: LV2, name: 'S-Curve', desc: 'S 形弯道', difficulty: 'easy' as const, rank: 2 },
  { rows: LV3, name: 'Spiral', desc: '螺旋路径', difficulty: 'medium' as const, rank: 3 },
  { rows: LV4, name: 'Zigzag', desc: 'Z 字形多弯', difficulty: 'hard' as const, rank: 4 },
  { rows: LV5, name: 'Boss Arena', desc: 'Boss 关 - 复杂路径', difficulty: 'hard' as const, rank: 5 },
];

/** 5 关地图（不含波次，波次在 builtinWaves.ts） */
export const BUILTIN_MAPS: Omit<Level, 'waves' | 'optimalScore'>[] = MAP_DEFS.map((def, idx) => {
  const { cells, start, end } = parseMap(def.rows);
  return {
    id: idx,
    name: def.name,
    description: def.desc,
    difficulty: def.difficulty,
    difficultyRank: def.rank,
    cols: 16,
    rows: 12,
    cells,
    startCell: start,
    endCell: end,
    startGold: 150,
    startLives: 20,
  };
});
