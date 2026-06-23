/**
 * PathFinder - A* 寻路算法
 *
 * 性能目标：16×12 网格 < 1ms
 * 8 方向移动（4 正 + 4 对角），对角穿过墙角时禁止
 * 启发式：欧几里得距离
 * 输出：路径点列表（不包含起点，包含终点）
 */

import type { Point } from '../config';
import type { MapGrid } from './MapGrid';

interface Node {
  pos: Point;
  g: number;     // 已花费
  f: number;     // g + 启发式
  parent: Node | null;
}

const NEIGHBORS: Point[] = [
  { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, // 上下左右
  { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: -1, y: -1 }, // 对角
];

function key(p: Point): string {
  return `${p.x},${p.y}`;
}

function heuristic(a: Point, b: Point): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  // 对角距离 = max + (sqrt(2) - 1) * min
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}

export class PathFinder {
  /**
   * 寻找从 start 到 goal 的路径
   * @returns 路径点列表（不含 start，含 goal），不可达时返回空数组
   */
  static findPath(grid: MapGrid, start: Point, goal: Point): Point[] {
    if (!grid.isPassable(start) || !grid.isPassable(goal)) {
      return [];
    }
    if (start.x === goal.x && start.y === goal.y) {
      return [start];
    }

    const open: Node[] = [];
    const cameFrom = new Map<string, Node>();
    const gScore = new Map<string, number>();
    const closed = new Set<string>();

    const startNode: Node = { pos: start, g: 0, f: heuristic(start, goal), parent: null };
    open.push(startNode);
    gScore.set(key(start), 0);

    while (open.length > 0) {
      // 找 f 最小的（线性扫描，对小网格足够快）
      let bestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i]!.f < open[bestIdx]!.f) bestIdx = i;
      }
      const current = open.splice(bestIdx, 1)[0]!;

      if (current.pos.x === goal.x && current.pos.y === goal.y) {
        return this.reconstruct(cameFrom, current);
      }

      closed.add(key(current.pos));

      for (const offset of NEIGHBORS) {
        const neighborPos: Point = {
          x: current.pos.x + offset.x,
          y: current.pos.y + offset.y,
        };

        if (!grid.isPassable(neighborPos)) continue;
        if (closed.has(key(neighborPos))) continue;

        // 对角移动时，检查两侧是否被墙堵（防止穿墙）
        if (offset.x !== 0 && offset.y !== 0) {
          const side1: Point = { x: current.pos.x + offset.x, y: current.pos.y };
          const side2: Point = { x: current.pos.x, y: current.pos.y + offset.y };
          if (!grid.isPassable(side1) || !grid.isPassable(side2)) continue;
        }

        const moveCost = offset.x !== 0 && offset.y !== 0 ? Math.SQRT2 : 1;
        const tentativeG = current.g + moveCost;

        const existingG = gScore.get(key(neighborPos));
        if (existingG !== undefined && tentativeG >= existingG) continue;

        cameFrom.set(key(neighborPos), current);
        gScore.set(key(neighborPos), tentativeG);

        // 如果已在 open 中，更新
        const existingNode = open.find((n) => n.pos.x === neighborPos.x && n.pos.y === neighborPos.y);
        if (existingNode) {
          existingNode.g = tentativeG;
          existingNode.f = tentativeG + heuristic(neighborPos, goal);
          existingNode.parent = current;
        } else {
          open.push({
            pos: neighborPos,
            g: tentativeG,
            f: tentativeG + heuristic(neighborPos, goal),
            parent: current,
          });
        }
      }
    }

    return []; // 不可达
  }

  private static reconstruct(_cameFrom: Map<string, Node>, end: Node): Point[] {
    const path: Point[] = [];
    let cur: Node | null = end;
    while (cur) {
      path.unshift(cur.pos);
      cur = cur.parent;
    }
    return path;
  }
}
