/**
 * WaveSystem 单元测试
 */

import { describe, it, expect } from 'vitest';
import { WaveSystem } from '../systems/WaveSystem';
import type { Wave } from '../../config';

function makeWave(spawns: { type: 'normal' | 'fast' | 'heavy' | 'flying' | 'boss'; count: number; interval: number }[], index = 0, bonus = 10): Wave {
  return {
    index,
    spawns,
    bonus,
  };
}

describe('WaveSystem', () => {
  describe('初始化', () => {
    it('创建时不激活', () => {
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 1, interval: 100 }])]);
      expect(ws.isActive).toBe(false);
      expect(ws.started).toBe(false);
      expect(ws.finished).toBe(false);
      expect(ws.betweenWaves).toBe(false);
    });

    it('totalWaves 返回波次数', () => {
      const ws = new WaveSystem([
        makeWave([{ type: 'normal', count: 1, interval: 100 }]),
        makeWave([{ type: 'normal', count: 1, interval: 100 }]),
      ]);
      expect(ws.totalWaves).toBe(2);
    });
  });

  describe('startNextWave', () => {
    it('启动一波后 isActive=true', () => {
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 1, interval: 100 }])]);
      ws.startNextWave();
      expect(ws.isActive).toBe(true);
      expect(ws.started).toBe(true);
    });

    it('已经激活时再次启动不生效', () => {
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 1, interval: 100 }])]);
      ws.startNextWave();
      ws.startNextWave();
      expect(ws.isActive).toBe(true);
    });

    it('全部波次完成后 finished=true', () => {
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 1, interval: 100 }])]);
      ws.startNextWave();
      ws.completeCurrentWave();
      expect(ws.finished).toBe(true);
      ws.startNextWave(); // 不再生效
    });
  });

  describe('update / 出怪', () => {
    it('第一次 update 立即出怪（spawnTimer=0）', () => {
      const path = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 3, interval: 200 }])]);
      ws.startNextWave();
      const enemies = ws.update(0.001, path);
      expect(enemies.length).toBe(1);
    });

    it('按 interval 持续出怪', () => {
      const path = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 3, interval: 200 }])]);
      ws.startNextWave();
      // 第一次立即出怪
      const e1 = ws.update(0.001, path);
      expect(e1.length).toBe(1);
      // 100ms 后还不到下一个 interval (200ms)
      const e2 = ws.update(0.1, path);
      expect(e2.length).toBe(0);
      // 再过 200ms 应该出怪
      const e3 = ws.update(0.2, path);
      expect(e3.length).toBe(1);
    });

    it('波次内全部出完', () => {
      const path = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 2, interval: 50 }])]);
      ws.startNextWave();
      const e1 = ws.update(0.001, path);
      expect(e1.length).toBe(1);
      const e2 = ws.update(0.1, path);
      expect(e2.length).toBe(1);
      // 已经出完
      expect(ws.isWaveComplete()).toBe(true);
    });
  });

  describe('completeCurrentWave', () => {
    it('完成当前波后 currentIndex+1', () => {
      const ws = new WaveSystem([
        makeWave([{ type: 'normal', count: 1, interval: 100 }]),
        makeWave([{ type: 'normal', count: 1, interval: 100 }]),
      ]);
      ws.startNextWave();
      ws.completeCurrentWave();
      expect(ws.currentIndex).toBe(1);
      expect(ws.isActive).toBe(false);
      expect(ws.betweenWaves).toBe(true);
    });

    it('最后一波完成后 finished=true', () => {
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 1, interval: 100 }])]);
      ws.startNextWave();
      ws.completeCurrentWave();
      expect(ws.finished).toBe(true);
    });
  });

  describe('isWaveComplete / isLevelComplete', () => {
    it('未出完时 isWaveComplete=false', () => {
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 3, interval: 100 }])]);
      ws.startNextWave();
      expect(ws.isWaveComplete()).toBe(false);
    });

    it('全部 spawn 后 isWaveComplete=true', () => {
      const path = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 1, interval: 100 }])]);
      ws.startNextWave();
      ws.update(0.001, path);
      expect(ws.isWaveComplete()).toBe(true);
    });

    it('全部波次完成后 isLevelComplete=true', () => {
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 1, interval: 100 }])]);
      ws.startNextWave();
      ws.completeCurrentWave();
      expect(ws.isLevelComplete()).toBe(true);
    });
  });

  describe('getCurrentWaveBonus', () => {
    it('未开始时返回 0', () => {
      const ws = new WaveSystem([makeWave([{ type: 'normal', count: 1, interval: 100 }])]);
      expect(ws.getCurrentWaveBonus()).toBe(0);
    });

    it('完成一波后返回该波的 bonus', () => {
      const ws = new WaveSystem([
        { index: 0, spawns: [{ type: 'normal', count: 1, interval: 100 }], bonus: 50 },
        { index: 1, spawns: [{ type: 'normal', count: 1, interval: 100 }], bonus: 100 },
      ]);
      ws.startNextWave();
      ws.completeCurrentWave(); // 完成第 0 波
      expect(ws.getCurrentWaveBonus()).toBe(50);
    });
  });
});
