/**
 * MapGrid 单元测试
 */

import { describe, it, expect } from 'vitest';
import { MapGrid } from '../MapGrid';
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
  const end: Point = { x: 4, y: 0 };
  return { grid: new MapGrid(parsed, start, end, 5, 1), start, end };
}

describe('MapGrid', () => {
  it('inBounds: 越界检查', () => {
    const { grid } = makeGrid(['S....']);
    expect(grid.inBounds({ x: 0, y: 0 })).toBe(true);
    expect(grid.inBounds({ x: 4, y: 0 })).toBe(true);
    expect(grid.inBounds({ x: -1, y: 0 })).toBe(false);
    expect(grid.inBounds({ x: 5, y: 0 })).toBe(false);
    expect(grid.inBounds({ x: 0, y: -1 })).toBe(false);
    expect(grid.inBounds({ x: 0, y: 1 })).toBe(false);
  });

  it('isPassable: 墙不可通过', () => {
    const { grid } = makeGrid(['S#..E']);
    expect(grid.isPassable({ x: 0, y: 0 })).toBe(true);
    expect(grid.isPassable({ x: 1, y: 0 })).toBe(false);
    expect(grid.isPassable({ x: 4, y: 0 })).toBe(true);
  });

  it('isBuildable: 仅 grass 可建', () => {
    const { grid } = makeGrid(['S#..E']);
    expect(grid.isBuildable({ x: 0, y: 0 })).toBe(false); // path
    expect(grid.isBuildable({ x: 1, y: 0 })).toBe(false); // blocked
    expect(grid.isBuildable({ x: 2, y: 0 })).toBe(true);  // grass
    expect(grid.isBuildable({ x: 4, y: 0 })).toBe(false); // path
  });

  it('cellToWorld / worldToCell: 坐标转换', () => {
    const { grid } = makeGrid(['S....']);
    const w = grid.cellToWorld({ x: 2, y: 0 });
    // CONFIG.GRID.CELL_SIZE = 40, 2 * 40 + 40/2 = 100
    expect(w.x).toBe(100);
    expect(w.y).toBe(20);
    const c = grid.worldToCell({ x: 100, y: 20 });
    expect(c.x).toBe(2); // floor(100/40) = 2
    expect(c.y).toBe(0);
  });

  it('getCell: 越界返回 null', () => {
    const { grid } = makeGrid(['S....']);
    expect(grid.getCell({ x: 0, y: 0 })).toBe('path');
    expect(grid.getCell({ x: 2, y: 0 })).toBe('grass');
    expect(grid.getCell({ x: -1, y: 0 })).toBe(null);
    expect(grid.getCell({ x: 0, y: 1 })).toBe(null);
  });
});
