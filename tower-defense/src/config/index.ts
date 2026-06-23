/**
 * Tower Defense Web - 全局配置（v2.0）
 *
 * 所有可调参数集中在此处，单一数据源原则
 * 含 Zod schema 用于运行时校验
 */

import { z } from 'zod';

/**
 * Zod schema - 用于校验配置
 */
export const gameConfigSchema = z.object({
  grid: z.object({
    cols: z.number().int().positive(),
    rows: z.number().int().positive(),
    cellSize: z.number().int().positive(),
  }),
  canvas: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  economy: z.object({
    startGold: z.number().int().nonnegative(),
    startLives: z.number().int().positive(),
    sellRefund: z.number().min(0).max(1),
    waveBonus: z.number().int().nonnegative(),
    bossWaveBonus: z.number().int().nonnegative(),
  }),
  wave: z.object({
    interval: z.number().int().positive(),
    betweenWaves: z.number().int().positive(),
  }),
  audio: z.object({
    enabled: z.boolean(),
  }),
});

export type GameConfig = z.infer<typeof gameConfigSchema>;

/**
 * 坐标点
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 游戏阶段
 *
 * - menu:       主菜单
 * - levelSelect: 关卡选择
 * - playing:    游戏中
 * - paused:     暂停
 * - betweenWaves: 波次间隔
 * - over:       失败
 * - win:        胜利
 */
export type GamePhase =
  | 'menu'
  | 'levelSelect'
  | 'playing'
  | 'paused'
  | 'betweenWaves'
  | 'over'
  | 'win';

/**
 * 塔类型
 */
export type TowerType = 'archer' | 'frost' | 'cannon';

/**
 * 敌人类型
 */
export type EnemyType = 'normal' | 'fast' | 'heavy' | 'flying' | 'boss';

/**
 * 子弹效果
 */
export type ProjectileEffect = 'none' | 'slow' | 'splash';

/**
 * 塔等级
 */
export type TowerLevel = 1 | 2 | 3;

/**
 * 塔配置（每个塔类型 × 等级）
 */
export interface TowerData {
  type: TowerType;
  level: TowerLevel;
  name: string;
  cost: number;       // 建造成本
  upgradeCost: number; // 升级到下一级成本（0 表示已满级）
  damage: number;
  range: number;      // 像素
  attackSpeed: number; // 次/秒
  effect: ProjectileEffect;
  splashRadius?: number; // 仅 cannon
  slowFactor?: number;   // 仅 frost (0-1)
  slowDuration?: number; // 仅 frost (ms)
  color: string;
  description: string;
}

/**
 * 塔实例（运行时）
 */
export interface Tower {
  id: string;
  type: TowerType;
  level: TowerLevel;
  cellX: number;
  cellY: number;
  position: Point; // 像素坐标
  data: TowerData; // 当前等级的属性
  totalInvested: number; // 累计投入（建 + 升级）
  cooldown: number;       // 距离下次可攻击的剩余时间（秒）
  target: Enemy | null;
  flashTime: number;       // 攻击闪烁动画时间
  /** 升级到下一级 */
  upgrade(): boolean;
  /** 升级需要的金币（0 = 已满级） */
  getUpgradeCost(): number;
  /** 出售返还金币（总投入 × 70%） */
  getSellValue(): number;
}

/**
 * 敌人配置
 */
export interface EnemyData {
  type: EnemyType;
  name: string;
  hp: number;
  speed: number;        // 像素/秒
  reward: number;       // 击杀金币
  size: number;         // 半径（像素）
  color: string;
  isFlying: boolean;
}

/**
 * 敌人实例（运行时）
 */
export interface Enemy {
  id: string;
  type: EnemyType;
  data: EnemyData;
  hp: number;
  maxHp: number;
  position: Point;
  pathIndex: number;        // 当前所在路径段终点索引
  subPathProgress: number;  // 在当前段内的进度（像素）
  reward: number;
  status: 'alive' | 'dead' | 'escaped';
  slowFactor: number;       // 1 = 正常，0.5 = 减速 50%
  slowEndTime: number;      // 减速结束时间
  hitFlashTime: number;     // 受击闪白时间
  isFlying: boolean;
  /** 受伤 */
  takeDamage(amount: number): void;
  /** 施加减速 */
  applySlow(factor: number, duration: number, currentTime: number): void;
}

/**
 * 子弹实例
 */
export interface Projectile {
  id: string;
  towerType: TowerType;
  position: Point;
  target: Enemy;
  lastTargetPos: Point; // 目标最后位置（目标死亡时使用）
  speed: number;
  damage: number;
  effect: ProjectileEffect;
  splashRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  status: 'flying' | 'hit' | 'expired';
}

/**
 * 粒子实例
 */
export interface Particle {
  position: Point;
  velocity: Point;
  color: string;
  size: number;
  alpha: number;
  lifetime: number;     // 剩余时间（秒）
  maxLifetime: number;
  type: 'hit' | 'kill' | 'place' | 'upgrade' | 'sell';
}

/**
 * 单个波次中敌人组
 */
export interface WaveSpawn {
  type: EnemyType;
  count: number;
  interval: number; // ms 出怪间隔
}

/**
 * 一个波次
 */
export interface Wave {
  index: number;
  spawns: WaveSpawn[];
  bonus: number; // 通关该波奖励金币
}

/**
 * 地图格子类型
 */
export type CellType = 'grass' | 'path' | 'blocked';

/**
 * 关卡
 */
export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyRank: number; // 1-5
  cols: number;
  rows: number;
  cells: CellType[][];  // 二维网格（rows × cols）
  startCell: Point;     // 起点
  endCell: Point;       // 终点
  startGold: number;    // 该关起始金币（默认 150）
  startLives: number;   // 该关起始生命（默认 20）
  waves: Wave[];
  optimalScore: number; // 理论最高分
}

/**
 * 时间倍率
 */
export type TimeScale = 1 | 2;

/**
 * 状态机输入事件
 */
export type GameAction =
  | 'start'
  | 'pause'
  | 'resume'
  | 'reset'
  | 'speed'
  | 'nextWave'
  | 'backToMenu'
  | 'selectLevel'
  | 'placeTower'
  | 'upgradeTower'
  | 'sellTower'
  | 'selectCell'
  | 'selectTowerType'
  | 'deselect';

/**
 * 配置常量
 *
 * 网格：16 × 12，每格 40×40 px（共 640 × 480 px）
 */
export const CONFIG = {
  GRID: {
    COLS: 16,
    ROWS: 12,
    CELL_SIZE: 40,
  },

  CANVAS: {
    WIDTH: 16 * 40, // 640
    HEIGHT: 12 * 40, // 480
  },

  ECONOMY: {
    START_GOLD: 150,
    START_LIVES: 20,
    SELL_REFUND: 0.7, // 返还 70%
    WAVE_BONUS: 25,
    BOSS_WAVE_BONUS: 100,
  },

  WAVE: {
    INTERVAL: 1000,        // 同波次内出怪间隔
    BETWEEN_WAVES: 5000,   // 波次间等待时间（ms）
  },

  COMBAT: {
    PROJECTILE_SPEED: 600,  // 像素/秒
    HIT_DISTANCE: 5,        // 子弹命中距离（像素）
  },

  /** 时间倍率 */
  TIME_SCALES: [1, 2] as TimeScale[],

  COLORS: {
    BG: '#09090b',          // zinc-950
    GRASS: '#5a8c4a',       // 草地
    GRASS_DARK: '#3a6b35',  // 装饰
    PATH: '#8b7355',        // 土路
    PATH_LIGHT: '#a08b6c',  // 路径高光
    RANGE: 'rgba(251, 191, 36, 0.18)',  // 范围圈
    RANGE_STROKE: 'rgba(251, 191, 36, 0.5)',
    BUILD_OK: 'rgba(16, 185, 129, 0.4)',
    BUILD_BAD: 'rgba(239, 68, 68, 0.4)',
    START: '#22c55e',       // 起点
    END: '#dc2626',         // 终点
    TEXT_DAMAGE: '#fca5a5', // 伤害数字（红）
    TEXT_GOLD: '#fde047',   // 金币数字（金）
    TEXT_SLOW: '#7dd3fc',   // 减速文字（蓝）
    TEXT_SPLASH: '#fdba74', // AOE 文字（橙）
    HP_BG: '#1f2937',       // 血条背景
    HP_FG: '#22c55e',       // 血条前景
    SHADOW: 'rgba(0,0,0,0.35)', // 阴影
  },

  /** 渲染相关常量 */
  RENDER: {
    /** 像素块尺寸（每格 40px = 8x8 个 5px 像素块） */
    PIXEL_SIZE: 5,
    /** 每格像素块数 */
    PIXELS_PER_CELL: 8,
    /** 阴影偏移 */
    SHADOW_OFFSET: 2,
  },

  STORAGE_KEYS: {
    STORE: 'tower-defense:store',
    PROGRESS: 'tower-defense:progress',
  },
} as const;
