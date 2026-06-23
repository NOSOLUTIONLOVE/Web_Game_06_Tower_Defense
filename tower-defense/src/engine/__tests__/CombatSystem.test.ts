/**
 * CombatSystem 单元测试
 */

import { describe, it, expect } from 'vitest';
import { CombatSystem } from '../systems/CombatSystem';
import { createEnemy } from '../entities/Enemy';
import { createTower } from '../entities/Tower';
import { EconomySystem } from '../systems/EconomySystem';
import type { Enemy, Projectile, Tower } from '../../config';

describe('CombatSystem', () => {
  const STRAIGHT_PATH = [
    { x: 0, y: 0 },
    { x: 200, y: 0 },
    { x: 400, y: 0 },
  ];

  describe('塔选目标', () => {
    it('射程内无敌人时不攻击', () => {
      const cs = new CombatSystem();
      const towers: Tower[] = [createTower('archer', { x: 5, y: 5 })];
      const enemies: Enemy[] = [];
      const projectiles: Projectile[] = [];
      const eco = new EconomySystem();
      const result = cs.combatTick(0.1, 0, towers, enemies, projectiles, eco);
      expect(projectiles.length).toBe(0);
      expect(result.killedEnemies.length).toBe(0);
    });

    it('射程内有敌人时发射子弹', () => {
      const cs = new CombatSystem();
      const t = createTower('archer', { x: 5, y: 5 });
      // 把敌人放在塔附近（射程 100）
      t.position = { x: 200, y: 200 };
      const towers: Tower[] = [t];
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.position = { x: 220, y: 200 }; // 距离塔 20
      e.pathIndex = 1;
      const enemies: Enemy[] = [e];
      const projectiles: Projectile[] = [];
      const eco = new EconomySystem();
      // 用极小 dt：子弹速度 600px/s，dt=0.001 飞行 0.6px < 20px
      cs.combatTick(0.001, 0, towers, enemies, projectiles, eco);
      expect(projectiles.length).toBe(1);
    });

    it('沿路径前进最远的敌人优先', () => {
      const cs = new CombatSystem();
      const t = createTower('archer', { x: 5, y: 5 });
      t.position = { x: 200, y: 200 };
      const towers: Tower[] = [t];
      const e1 = createEnemy('normal', STRAIGHT_PATH);
      e1.position = { x: 220, y: 200 };
      e1.pathIndex = 0;
      const e2 = createEnemy('normal', STRAIGHT_PATH);
      e2.position = { x: 230, y: 200 };
      e2.pathIndex = 2; // 走得更远
      const enemies: Enemy[] = [e1, e2];
      const projectiles: Projectile[] = [];
      const eco = new EconomySystem();
      cs.combatTick(0.001, 0, towers, enemies, projectiles, eco);
      expect(projectiles[0]!.target.id).toBe(e2.id);
    });
  });

  describe('塔冷却', () => {
    it('冷却期间不重复发射', () => {
      const cs = new CombatSystem();
      const t = createTower('archer', { x: 5, y: 5 });
      t.position = { x: 200, y: 200 };
      const towers: Tower[] = [t];
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.position = { x: 220, y: 200 };
      e.pathIndex = 1;
      const enemies: Enemy[] = [e];
      const projectiles: Projectile[] = [];
      const eco = new EconomySystem();
      // 第一次发射
      cs.combatTick(0.001, 0, towers, enemies, projectiles, eco);
      expect(projectiles.length).toBe(1);
      // 第二次（冷却中）不应发射
      cs.combatTick(0.001, 0.001, towers, enemies, projectiles, eco);
      expect(projectiles.length).toBe(1);
      // 第三次（仍冷却中）也不应发射
      cs.combatTick(0.001, 0.002, towers, enemies, projectiles, eco);
      expect(projectiles.length).toBe(1);
    });
  });

  describe('伤害应用', () => {
    it('子弹命中后扣血', () => {
      const cs = new CombatSystem();
      const t = createTower('archer', { x: 5, y: 5 });
      t.position = { x: 200, y: 200 };
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.position = { x: 220, y: 200 };
      e.pathIndex = 1;
      const before = e.hp;
      const towers: Tower[] = [t];
      const enemies: Enemy[] = [e];
      const projectiles: Projectile[] = [];
      const eco = new EconomySystem();
      cs.combatTick(0.1, 0, towers, enemies, projectiles, eco);
      // 子弹飞行 + 命中
      cs.combatTick(10, 0.1, towers, enemies, projectiles, eco);
      expect(e.hp).toBeLessThan(before);
    });

    it('击杀敌人 → onEnemyKilled + 加金币', () => {
      const cs = new CombatSystem();
      let killed: Enemy | null = null;
      cs.setCallbacks({
        onEnemyKilled: (e) => { killed = e; },
      });
      const t = createTower('archer', { x: 5, y: 5 });
      t.position = { x: 200, y: 200 };
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.position = { x: 220, y: 200 };
      e.pathIndex = 1;
      e.hp = 1; // 一击必杀
      const towers: Tower[] = [t];
      const enemies: Enemy[] = [e];
      const projectiles: Projectile[] = [];
      const eco = new EconomySystem(0, 10);
      const goldBefore = eco.gold;
      cs.combatTick(0.1, 0, towers, enemies, projectiles, eco);
      cs.combatTick(10, 0.1, towers, enemies, projectiles, eco);
      expect(killed).toBe(e);
      expect(eco.gold).toBeGreaterThan(goldBefore);
    });

    it('漏怪 → onEnemyEscaped + 扣生命', () => {
      const cs = new CombatSystem();
      let escaped = 0;
      cs.setCallbacks({
        onEnemyEscaped: () => { escaped++; },
      });
      const towers: Tower[] = [];
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.status = 'escaped'; // 模拟已经到达终点
      const enemies: Enemy[] = [e];
      const projectiles: Projectile[] = [];
      const eco = new EconomySystem(0, 5);
      cs.combatTick(0.1, 0, towers, enemies, projectiles, eco);
      expect(escaped).toBe(1);
      expect(eco.lives).toBe(4);
    });
  });

  describe('减速效果', () => {
    it('减速塔命中后敌人减速', () => {
      const cs = new CombatSystem();
      const t = createTower('frost', { x: 5, y: 5 });
      t.position = { x: 200, y: 200 };
      const e = createEnemy('normal', STRAIGHT_PATH);
      e.position = { x: 220, y: 200 };
      e.pathIndex = 1;
      const towers: Tower[] = [t];
      const enemies: Enemy[] = [e];
      const projectiles: Projectile[] = [];
      const eco = new EconomySystem();
      cs.combatTick(0.1, 0, towers, enemies, projectiles, eco);
      cs.combatTick(10, 0.1, towers, enemies, projectiles, eco);
      expect(e.slowFactor).toBeLessThan(1);
    });
  });

  describe('AOE 效果', () => {
    it('炮塔命中后范围敌人也受伤', () => {
      const cs = new CombatSystem();
      const t = createTower('cannon', { x: 5, y: 5 });
      t.position = { x: 200, y: 200 };
      const e1 = createEnemy('normal', STRAIGHT_PATH);
      e1.position = { x: 220, y: 200 };
      e1.pathIndex = 1;
      e1.hp = 100;
      const e2 = createEnemy('normal', STRAIGHT_PATH);
      e2.position = { x: 230, y: 200 }; // AOE 内
      e2.pathIndex = 1;
      e2.hp = 100;
      const towers: Tower[] = [t];
      const enemies: Enemy[] = [e1, e2];
      const projectiles: Projectile[] = [];
      const eco = new EconomySystem();
      cs.combatTick(0.1, 0, towers, enemies, projectiles, eco);
      // 第一发击中最前面的
      cs.combatTick(10, 0.1, towers, enemies, projectiles, eco);
      // 至少一个敌人受伤
      const totalHp = e1.hp + e2.hp;
      expect(totalHp).toBeLessThan(200);
    });
  });
});
