/**
 * Enemy 实体单元测试
 */

import { describe, it, expect } from 'vitest';
import { createEnemy, moveEnemy, updateEnemy } from '../entities/Enemy';

const STRAIGHT_PATH = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 200, y: 0 },
];

describe('Enemy 实体', () => {
  describe('createEnemy', () => {
    it('创建正常敌人', () => {
      const e = createEnemy('normal', STRAIGHT_PATH);
      expect(e.type).toBe('normal');
      expect(e.hp).toBe(e.maxHp);
      expect(e.status).toBe('alive');
      expect(e.position).toEqual({ x: 0, y: 0 });
      expect(e.pathIndex).toBe(0);
      expect(e.slowFactor).toBe(1);
    });

    it('空路径抛错', () => {
      expect(() => createEnemy('normal', [])).toThrow();
    });

    it('不同敌人类型属性不同', () => {
      const normal = createEnemy('normal', STRAIGHT_PATH);
      const fast = createEnemy('fast', STRAIGHT_PATH);
      const heavy = createEnemy('heavy', STRAIGHT_PATH);
      const flying = createEnemy('flying', STRAIGHT_PATH);
      const boss = createEnemy('boss', STRAIGHT_PATH);

      // HP: heavy/boss 高
      expect(heavy.hp).toBeGreaterThan(normal.hp);
      expect(boss.hp).toBeGreaterThan(heavy.hp);
      // Speed: fast 高
      expect(fast.data.speed).toBeGreaterThan(normal.data.speed);
      // Flying
      expect(flying.isFlying).toBe(true);
      expect(normal.isFlying).toBe(false);
    });
  });

  describe('takeDamage', () => {
    it('扣血并触发闪白', () => {
      const e = createEnemy('normal', STRAIGHT_PATH);
      const initialHp = e.hp;
      e.takeDamage(10);
      expect(e.hp).toBe(initialHp - 10);
      expect(e.hitFlashTime).toBe(0.08);
    });

    it('HP 归零时死亡', () => {
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.takeDamage(99999);
      expect(e.hp).toBe(0);
      expect(e.status).toBe('dead');
    });
  });

  describe('applySlow', () => {
    it('减速生效', () => {
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.applySlow(0.5, 1000, 0);
      expect(e.slowFactor).toBe(0.5);
    });

    it('多次减速取最慢', () => {
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.applySlow(0.5, 1000, 0);
      e.applySlow(0.8, 1000, 0);
      expect(e.slowFactor).toBe(0.5);
    });
  });

  describe('moveEnemy / updateEnemy', () => {
    it('沿路径移动', () => {
      const e = createEnemy('normal', STRAIGHT_PATH);
      // normal.speed 大约 60
      moveEnemy(e, 1, STRAIGHT_PATH); // 1s
      expect(e.position.x).toBeGreaterThan(0);
    });

    it('到达终点后 escaped', () => {
      const e = createEnemy('normal', STRAIGHT_PATH);
      moveEnemy(e, 100, STRAIGHT_PATH); // 大量时间
      expect(e.status).toBe('escaped');
    });

    it('减速后移动更慢', () => {
      const e1 = createEnemy('normal', STRAIGHT_PATH);
      const e2 = createEnemy('normal', STRAIGHT_PATH);
      e2.applySlow(0.5, 5000, 0);
      moveEnemy(e1, 0.5, STRAIGHT_PATH);
      moveEnemy(e2, 0.5, STRAIGHT_PATH);
      expect(e2.position.x).toBeLessThan(e1.position.x);
    });

    it('减速到期后恢复', () => {
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.applySlow(0.5, 1000, 0);
      expect(e.slowFactor).toBe(0.5);
      updateEnemy(e, 0.016, 2, STRAIGHT_PATH); // currentTime=2s, slow end=1s
      expect(e.slowFactor).toBe(1);
    });

    it('闪白效果随时间衰减', () => {
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.takeDamage(5);
      expect(e.hitFlashTime).toBeGreaterThan(0);
      updateEnemy(e, 0.1, 0, STRAIGHT_PATH);
      expect(e.hitFlashTime).toBe(0);
    });
  });
});
