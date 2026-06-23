/**
 * PathFinder A* 单元测试
 */

import { describe, it, expect } from 'vitest';
import { PathFinder } from '../PathFinder';
import { MapGrid } from '../MapGrid';
import { BUILTIN_LEVELS } from '../levels/builtinLevels';
import type { CellType, Point } from '../../config';

function makeGrid(cells: string[]): { grid: MapGrid; start: Point; end: Point } {
  const parsed: CellType[][] = cells.map((row) =>
    row.split('').map((ch) => {
      if (ch === '#') return 'blocked' as CellType;
      if (ch === 'S' || ch === 'E') return 'path' as CellType;
      if (ch === '.') return 'grass' as CellType;
      return 'grass' as CellType;
    })
  );
  const start: Point = { x: 0, y: 0 };
  const end: Point = { x: cells[0]!.length - 1, y: cells.length - 1 };
  return { grid: new MapGrid(parsed, start, end, cells[0]!.length, cells.length), start, end };
}

describe('PathFinder', () => {
  it('直走: 3x3 无障碍', () => {
    const { grid, start, end } = makeGrid(['S..', '...', '..E']);
    const path = PathFinder.findPath(grid, start, end);
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual(start);
    expect(path[path.length - 1]).toEqual(end);
  });

  it('绕墙: 障碍强制绕行', () => {
    const { grid, start, end } = makeGrid(['S..', '.#.', '..E']);
    const path = PathFinder.findPath(grid, start, end);
    expect(path.length).toBeGreaterThan(0);
    // 路径不应穿过墙
    for (const p of path) {
      expect(p.y === 0 || p.y === 2 || p.x === 0 || p.x === 2).toBe(true);
    }
  });

  it('不可达: 终点被墙完全包围', () => {
    const { grid } = makeGrid(['S##', '##E', '###']);
    const path = PathFinder.findPath(grid, { x: 0, y: 0 }, { x: 2, y: 1 });
    expect(path).toEqual([]);
  });

  it('起点=终点: 返回单点', () => {
    const { grid } = makeGrid(['S..', '...', '...']);
    const path = PathFinder.findPath(grid, { x: 1, y: 1 }, { x: 1, y: 1 });
    expect(path).toEqual([{ x: 1, y: 1 }]);
  });

  it('起点不可通过: 返回空', () => {
    const { grid } = makeGrid(['###', '###', '###']);
    const path = PathFinder.findPath(grid, { x: 0, y: 0 }, { x: 2, y: 2 });
    expect(path).toEqual([]);
  });

  it('终点不可通过: 返回空', () => {
    // 起点 (0,0)，终点 (2,2)。中间 (1,0)(0,1)(1,1) 全堵死 → 不可达
    const { grid } = makeGrid(['S#.', '##.', '..E']);
    const path = PathFinder.findPath(grid, { x: 0, y: 0 }, { x: 2, y: 2 });
    expect(path).toEqual([]);
  });

  it('对角移动: 8 方向搜索', () => {
    const { grid, start, end } = makeGrid(['S..', '...', '..E']);
    const path = PathFinder.findPath(grid, start, end);
    // 4 步内可达（用对角）
    expect(path.length).toBeLessThanOrEqual(4);
  });

  it('对角不能穿墙角', () => {
    // S 在 (0,0)，目标 (2,2)，但 (1,0) 是墙，对角 (0,0)→(1,1) 需检查 (0,1) 和 (1,0) 不可同时为墙
    // 这里 (0,1) 可通过、(1,0) 不可通过 → 对角线被禁止
    const cells: CellType[][] = [
      ['path', 'blocked', 'path'],
      ['path', 'path', 'path'],
      ['path', 'path', 'path'],
    ];
    const grid = new MapGrid(cells, { x: 0, y: 0 }, { x: 2, y: 2 });
    const path = PathFinder.findPath(grid, { x: 0, y: 0 }, { x: 2, y: 2 });
    expect(path.length).toBeGreaterThan(0);
    // 必须绕开 (1,0)
    for (const p of path) {
      expect(!(p.x === 1 && p.y === 0)).toBe(true);
    }
  });

  it('性能: 16x12 网格 < 10ms', () => {
    const cells: CellType[][] = [];
    for (let y = 0; y < 12; y++) {
      const row: CellType[] = [];
      for (let x = 0; x < 16; x++) {
        row.push((x === 4 || x === 11) && y > 2 && y < 9 ? 'blocked' : 'path');
      }
      cells.push(row);
    }
    const grid = new MapGrid(cells, { x: 0, y: 0 }, { x: 15, y: 11 });
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      PathFinder.findPath(grid, { x: 0, y: 0 }, { x: 15, y: 11 });
    }
    const elapsed = performance.now() - start;
    expect(elapsed / 100).toBeLessThan(10);
  });

  it('5 关地图预计算: 全部能找到路径', () => {
    for (const level of BUILTIN_LEVELS) {
      const grid = new MapGrid(level.cells, level.startCell, level.endCell);
      const path = PathFinder.findPath(grid, level.startCell, level.endCell);
      expect(path.length, `Level ${level.id} path should be non-empty`).toBeGreaterThan(0);
    }
  });
});
