/**
 * EconomySystem 单元测试
 */

import { describe, it, expect } from 'vitest';
import { EconomySystem } from '../systems/EconomySystem';
import { CONFIG } from '../../config';

describe('EconomySystem', () => {
  describe('初始化', () => {
    it('使用默认配置初始化', () => {
      const eco = new EconomySystem();
      expect(eco.gold).toBe(CONFIG.ECONOMY.START_GOLD);
      expect(eco.lives).toBe(CONFIG.ECONOMY.START_LIVES);
      expect(eco.startingGold).toBe(CONFIG.ECONOMY.START_GOLD);
      expect(eco.startingLives).toBe(CONFIG.ECONOMY.START_LIVES);
    });

    it('使用自定义配置初始化', () => {
      const eco = new EconomySystem(500, 30);
      expect(eco.gold).toBe(500);
      expect(eco.lives).toBe(30);
      expect(eco.startingGold).toBe(500);
      expect(eco.startingLives).toBe(30);
    });
  });

  describe('金币', () => {
    it('addGold 增加金币', () => {
      const eco = new EconomySystem(100, 10);
      eco.addGold(50);
      expect(eco.gold).toBe(150);
      eco.addGold(0);
      expect(eco.gold).toBe(150);
    });

    it('spendGold 扣除金币', () => {
      const eco = new EconomySystem(100, 10);
      expect(eco.spendGold(40)).toBe(true);
      expect(eco.gold).toBe(60);
    });

    it('spendGold 金币不足返回 false', () => {
      const eco = new EconomySystem(50, 10);
      expect(eco.spendGold(100)).toBe(false);
      expect(eco.gold).toBe(50); // 不变
    });

    it('canAfford 检查是否负担得起', () => {
      const eco = new EconomySystem(100, 10);
      expect(eco.canAfford(50)).toBe(true);
      expect(eco.canAfford(100)).toBe(true);
      expect(eco.canAfford(101)).toBe(false);
    });
  });

  describe('生命', () => {
    it('loseLife 扣血', () => {
      const eco = new EconomySystem(100, 5);
      eco.loseLife();
      expect(eco.lives).toBe(4);
      eco.loseLife();
      expect(eco.lives).toBe(3);
    });

    it('loseLife 不会扣到负数', () => {
      const eco = new EconomySystem(100, 2);
      eco.loseLife();
      eco.loseLife();
      eco.loseLife(); // 第三次
      expect(eco.lives).toBe(0);
      eco.loseLife(); // 第四次
      expect(eco.lives).toBe(0);
    });

    it('isDefeated 生命归零为 true', () => {
      const eco = new EconomySystem(100, 1);
      expect(eco.isDefeated()).toBe(false);
      eco.loseLife();
      expect(eco.isDefeated()).toBe(true);
    });
  });

  describe('计分', () => {
    it('calcScore = 生命 * 100 + 金币', () => {
      const eco = new EconomySystem(150, 5);
      expect(eco.calcScore()).toBe(5 * 100 + 150);
    });

    it('calcScore 在金币为 0、生命为 0 时为 0', () => {
      const eco = new EconomySystem(0, 0);
      expect(eco.calcScore()).toBe(0);
    });
  });

  describe('重置', () => {
    it('reset 还原初始值', () => {
      const eco = new EconomySystem(100, 10);
      eco.addGold(500);
      eco.loseLife();
      eco.loseLife();
      eco.reset();
      expect(eco.gold).toBe(100);
      expect(eco.lives).toBe(10);
    });
  });
});
