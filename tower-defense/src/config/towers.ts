/**
 * 3 种塔 × 3 等级 = 9 个配置
 *
 * 升级规则：
 * - 1→2: +50% 伤害 / +20% 射程
 * - 2→3: +100% 伤害（相对基础）/ +40% 射程
 * - 升级成本：建造 + 100💰（2级）/ + 200💰（3级）
 */

import type { TowerData, TowerLevel, TowerType } from './index';

const UPGRADE_COST_1 = 100;
const UPGRADE_COST_2 = 200;

export const TOWERS: Record<TowerType, Record<TowerLevel, TowerData>> = {
  archer: {
    1: {
      type: 'archer',
      level: 1,
      name: 'Archer',
      cost: 50,
      upgradeCost: UPGRADE_COST_1,
      damage: 20,
      range: 100,
      attackSpeed: 1.0,
      effect: 'none',
      color: '#10b981', // emerald-500
      description: '基础弓手塔，单体伤害，平衡型',
    },
    2: {
      type: 'archer',
      level: 2,
      name: 'Archer II',
      cost: 50,
      upgradeCost: UPGRADE_COST_2,
      damage: 30, // +50%
      range: 120, // +20%
      attackSpeed: 1.2,
      effect: 'none',
      color: '#059669', // emerald-600
      description: '弓手塔 2 级，伤害 +50%，射程 +20%',
    },
    3: {
      type: 'archer',
      level: 3,
      name: 'Archer III',
      cost: 50,
      upgradeCost: 0,
      damage: 40, // +100%
      range: 140, // +40%
      attackSpeed: 1.5,
      effect: 'none',
      color: '#047857', // emerald-700
      description: '弓手塔 3 级，伤害 +100%，射程 +40%',
    },
  },
  frost: {
    1: {
      type: 'frost',
      level: 1,
      name: 'Frost',
      cost: 75,
      upgradeCost: UPGRADE_COST_1,
      damage: 10,
      range: 90,
      attackSpeed: 1.0,
      effect: 'slow',
      slowFactor: 0.5, // 减速 50%
      slowDuration: 1000, // 持续 1 秒
      color: '#38bdf8', // sky-400
      description: '减速塔，命中后使敌人减速 50% × 1s',
    },
    2: {
      type: 'frost',
      level: 2,
      name: 'Frost II',
      cost: 75,
      upgradeCost: UPGRADE_COST_2,
      damage: 15,
      range: 108,
      attackSpeed: 1.2,
      effect: 'slow',
      slowFactor: 0.4, // 减速 60%
      slowDuration: 1500,
      color: '#0ea5e9', // sky-500
      description: '减速塔 2 级，减速 60% × 1.5s',
    },
    3: {
      type: 'frost',
      level: 3,
      name: 'Frost III',
      cost: 75,
      upgradeCost: 0,
      damage: 20,
      range: 126,
      attackSpeed: 1.5,
      effect: 'slow',
      slowFactor: 0.3, // 减速 70%
      slowDuration: 2000,
      color: '#0284c7', // sky-600
      description: '减速塔 3 级，减速 70% × 2s',
    },
  },
  cannon: {
    1: {
      type: 'cannon',
      level: 1,
      name: 'Cannon',
      cost: 100,
      upgradeCost: UPGRADE_COST_1,
      damage: 30,
      range: 80,
      attackSpeed: 0.5,
      effect: 'splash',
      splashRadius: 50,
      color: '#f97316', // orange-500
      description: '范围炮塔，半径 50 内所有敌人受同等伤害',
    },
    2: {
      type: 'cannon',
      level: 2,
      name: 'Cannon II',
      cost: 100,
      upgradeCost: UPGRADE_COST_2,
      damage: 45,
      range: 96,
      attackSpeed: 0.6,
      effect: 'splash',
      splashRadius: 60,
      color: '#ea580c', // orange-600
      description: '范围炮塔 2 级，半径 60，伤害 +50%',
    },
    3: {
      type: 'cannon',
      level: 3,
      name: 'Cannon III',
      cost: 100,
      upgradeCost: 0,
      damage: 60,
      range: 112,
      attackSpeed: 0.75,
      effect: 'splash',
      splashRadius: 70,
      color: '#c2410c', // orange-700
      description: '范围炮塔 3 级，半径 70，伤害 +100%',
    },
  },
};

/** 获取塔数据 */
export function getTowerData(type: TowerType, level: TowerLevel): TowerData {
  return TOWERS[type][level];
}

/** 获取塔的下一级数据（满级返回 null） */
export function getNextTowerData(type: TowerType, level: TowerLevel): TowerData | null {
  if (level >= 3) return null;
  return TOWERS[type][(level + 1) as TowerLevel];
}

/** 出售价格（总投入 × 70%） */
export function calcSellValue(totalInvested: number): number {
  return Math.floor(totalInvested * 0.7);
}
