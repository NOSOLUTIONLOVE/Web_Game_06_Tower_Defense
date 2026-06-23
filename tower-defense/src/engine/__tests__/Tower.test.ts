/**
 * Tower 实体单元测试
 */

import { describe, it, expect } from 'vitest';
import { createTower } from '../entities/Tower';
import { CONFIG } from '../../config';

describe('Tower 实体', () => {
  describe('createTower', () => {
    it('创建基础塔', () => {
      const t = createTower('archer', { x: 3, y: 5 });
      expect(t.type).toBe('archer');
      expect(t.level).toBe(1);
      expect(t.cellX).toBe(3);
      expect(t.cellY).toBe(5);
      // 像素中心
      expect(t.position.x).toBe(3 * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2);
      expect(t.position.y).toBe(5 * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2);
      expect(t.data).toBeDefined();
      expect(t.totalInvested).toBe(t.data.cost);
      expect(t.cooldown).toBe(0);
    });

    it('不同类型不同初始 cost', () => {
      const archer = createTower('archer', { x: 0, y: 0 });
      const frost = createTower('frost', { x: 0, y: 0 });
      const cannon = createTower('cannon', { x: 0, y: 0 });
      expect(frost.data.cost).toBeGreaterThan(archer.data.cost);
      expect(cannon.data.cost).toBeGreaterThan(frost.data.cost);
    });
  });

  describe('upgrade', () => {
    it('升级 level 1→2', () => {
      const t = createTower('archer', { x: 0, y: 0 });
      const before = t.data;
      const cost = t.getUpgradeCost();
      const ok = t.upgrade();
      expect(ok).toBe(true);
      expect(t.level).toBe(2);
      expect(t.data).not.toBe(before);
      expect(t.data.damage).toBeGreaterThan(before.damage);
      expect(t.totalInvested).toBe(before.cost + cost);
    });

    it('满级后升级返回 false', () => {
      const t = createTower('archer', { x: 0, y: 0 });
      t.upgrade(); // 1→2
      t.upgrade(); // 2→3
      const ok = t.upgrade(); // 3→3 满级
      expect(ok).toBe(false);
      expect(t.level).toBe(3);
    });

    it('getUpgradeCost 满级返回 0', () => {
      const t = createTower('archer', { x: 0, y: 0 });
      t.upgrade();
      t.upgrade();
      expect(t.getUpgradeCost()).toBe(0);
    });
  });

  describe('getSellValue', () => {
    it('出售返还 70% 累计投入', () => {
      const t = createTower('archer', { x: 0, y: 0 });
      const invested = t.totalInvested;
      const sell = t.getSellValue();
      // CONFIG.ECONOMY.SELL_REFUND 默认 0.7
      expect(sell).toBe(Math.floor(invested * CONFIG.ECONOMY.SELL_REFUND));
    });

    it('升级后出售返还更多', () => {
      const t = createTower('archer', { x: 0, y: 0 });
      const before = t.getSellValue();
      t.upgrade();
      const after = t.getSellValue();
      expect(after).toBeGreaterThan(before);
    });
  });
});
