/**
 * Tower 实体 - 玩家建造的防御塔
 *
 * 职责：
 * - 持有位置 / 等级 / 目标 / 冷却
 * - 找目标：射程内沿路径前进最远的敌人
 * - 攻击：达到 attackSpeed 频率时发射子弹
 * - 升级：提升属性 + 累计投入
 * - 出售：返回 70% 累计投入
 */

import { CONFIG, type Point, type Tower, type TowerData, type TowerType, type TowerLevel } from '../../config';
import { TOWERS, getNextTowerData, calcSellValue } from '../../config/towers';

let towerIdCounter = 0;
function nextTowerId(): string {
  return `tower_${++towerIdCounter}_${Date.now()}`;
}

function getTowerDataForLevel(type: TowerType, level: TowerLevel): TowerData {
  return TOWERS[type][level];
}

/**
 * 创建塔
 * @param type 塔类型
 * @param cell 格子坐标
 * @param level 初始等级（默认 1）
 */
export function createTower(type: TowerType, cell: Point, level: TowerLevel = 1): Tower {
  const baseData = getTowerDataForLevel(type, level);
  return {
    id: nextTowerId(),
    type,
    level,
    cellX: cell.x,
    cellY: cell.y,
    position: {
      x: cell.x * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
      y: cell.y * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
    },
    data: baseData,
    totalInvested: baseData.cost,
    cooldown: 0,
    target: null,
    flashTime: 0,
    upgrade(this: Tower): boolean {
      const next = getNextTowerData(this.type, this.level);
      if (!next) return false;
      // 累计投入 = 上一级投入 + 升级到本级的成本
      const upgradePaidCost = this.data.upgradeCost;
      this.level = (this.level + 1) as TowerLevel;
      this.data = next;
      this.totalInvested += upgradePaidCost;
      return true;
    },
    getUpgradeCost(this: Tower): number {
      return this.data.upgradeCost;
    },
    getSellValue(this: Tower): number {
      return calcSellValue(this.totalInvested);
    },
  };
}

/** 重置 Tower（用于对象池） */
export function resetTower(t: Tower): void {
  t.id = '';
  t.type = 'archer';
  t.level = 1;
  t.cellX = 0;
  t.cellY = 0;
  t.position = { x: 0, y: 0 };
  // @ts-ignore - data will be reassigned on next acquire
  t.data = null as any;
  t.totalInvested = 0;
  t.cooldown = 0;
  t.target = null;
  t.flashTime = 0;
}
