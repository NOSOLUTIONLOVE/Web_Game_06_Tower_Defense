/**
 * RenderSnapshot - 渲染快照
 *
 * 引擎每帧对外暴露的"只读数据视图"，避免 renderer 直接穿透访问 engine 私有字段
 * - 所有数组在内部都已是独立引用，renderer 可直接读取
 * - phase / 选中状态从 engine 公开属性读取
 */

import type {
  CellType,
  Enemy,
  GamePhase,
  Level,
  Particle,
  Point,
  Projectile,
  TimeScale,
  Tower,
  TowerType,
} from '../config';

export interface DamageNumber {
  id: string;
  pos: Point;
  value: number;
  type: 'damage' | 'gold' | 'slow' | 'splash';
  alpha: number;
  age: number; // 秒
  vy: number; // 向上漂移速度
}

export interface RenderSnapshot {
  phase: GamePhase;
  timeScale: TimeScale;

  level: Level | null;
  /** 简化版 grid 快照（renderer 只需 cells + cols/rows） */
  grid: { cols: number; rows: number; cells: CellType[][] } | null;
  path: Point[];

  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  damageNumbers: DamageNumber[];

  /** UI 选中状态（来自 engine） */
  selectedCell: Point | null;
  hoveredCell: Point | null;
  selectedTowerId: string | null;
  selectedTowerType: TowerType | null;
  /** 鼠标当前格可否建造（引擎预计算） */
  hoverBuildable: boolean;

  /** FPS（用于调试） */
  fps: number;
}
