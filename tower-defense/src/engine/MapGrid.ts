/**
 * MapGrid - 16×12 网格（来自 Level.cells）
 *
 * 职责：
 * - 边界检查
 * - 坐标转换（cell ↔ world）
 * - 判断格子类型（path / grass / blocked）
 * - 判断能否建塔（仅 grass 可建）
 */

import { CONFIG, type CellType, type Point } from '../config';

export class MapGrid {
  readonly cols: number;
  readonly rows: number;
  readonly cells: CellType[][];
  readonly startCell: Point;
  readonly endCell: Point;

  constructor(
    cells: CellType[][],
    startCell: Point,
    endCell: Point,
    cols?: number,
    rows?: number
  ) {
    this.cells = cells;
    // 优先使用外部指定，否则从 cells 数组自动推断
    this.cols = cols ?? cells[0]?.length ?? CONFIG.GRID.COLS;
    this.rows = rows ?? cells.length ?? CONFIG.GRID.ROWS;
    this.startCell = startCell;
    this.endCell = endCell;
  }

  /** 格子坐标 → 像素中心坐标 */
  cellToWorld(cell: Point): Point {
    return {
      x: cell.x * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
      y: cell.y * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
    };
  }

  /** 像素坐标 → 格子坐标 */
  worldToCell(world: Point): Point {
    return {
      x: Math.floor(world.x / CONFIG.GRID.CELL_SIZE),
      y: Math.floor(world.y / CONFIG.GRID.CELL_SIZE),
    };
  }

  /** 越界检查 */
  inBounds(cell: Point): boolean {
    return cell.x >= 0 && cell.x < this.cols && cell.y >= 0 && cell.y < this.rows;
  }

  /** 越界 + 障碍检查（用于寻路） */
  isPassable(cell: Point): boolean {
    if (!this.inBounds(cell)) return false;
    return this.cells[cell.y]![cell.x] !== 'blocked';
  }

  /** 越界 + 路径/障碍检查（用于建塔） */
  isBuildable(cell: Point): boolean {
    if (!this.inBounds(cell)) return false;
    const c = this.cells[cell.y]![cell.x];
    return c === 'grass';
  }

  /** 获取格子类型（带越界保护） */
  getCell(cell: Point): CellType | null {
    if (!this.inBounds(cell)) return null;
    return this.cells[cell.y]![cell.x] ?? null;
  }
}
