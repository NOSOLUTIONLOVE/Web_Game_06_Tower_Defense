/**
 * WaveSystem - 波次管理
 *
 * 职责：
 * - 追踪当前波次索引
 * - 按 spawn interval 依次生成敌人
 * - 波次间倒计时 (betweenWaves)
 * - 判定波次完成 / 关卡完成
 */

import { CONFIG, type EnemyType, type Wave } from '../../config';
import type { Enemy } from '../../config';
import { createEnemy } from '../entities/Enemy';
import type { Point } from '../../config';

export interface WaveSpawnEvent {
  type: EnemyType;
  count: number;
  interval: number; // ms
}

export class WaveSystem {
  waves: Wave[];
  currentIndex: number = 0;       // 当前波次索引（-1 表示未开始）
  spawnTimer: number = 0;          // 距离下次出怪的时间（ms）
  spawnsRemaining: { type: EnemyType; count: number; interval: number }[] = [];
  betweenWaves: boolean = false;  // 是否在波次间
  betweenTimer: number = 0;       // 波次间倒计时（ms）
  isActive: boolean = false;       // 波次系统是否激活
  started: boolean = false;        // 是否有任何一波启动过
  finished: boolean = false;       // 全部波次完成

  constructor(waves: Wave[]) {
    this.waves = waves;
  }

  /** 启动下一波（手动） */
  startNextWave(): void {
    if (this.finished) return;
    if (this.isActive) return; // 已经开始
    if (this.currentIndex >= this.waves.length) {
      this.finished = true;
      return;
    }
    const wave = this.waves[this.currentIndex]!;
    this.spawnsRemaining = wave.spawns.map((s) => ({ ...s }));
    this.spawnTimer = 0;
    this.betweenWaves = false;
    this.isActive = true;
    this.started = true;
  }

  /** 自动启动下一波（倒计时归零时） */
  private autoStart(): void {
    this.startNextWave();
  }

  /** 每帧更新；返回新生成的敌人列表 */
  update(dt: number, path: Point[]): Enemy[] {
    const newEnemies: Enemy[] = [];

    if (this.betweenWaves) {
      this.betweenTimer -= dt * 1000;
      if (this.betweenTimer <= 0) {
        this.autoStart();
      }
      return newEnemies;
    }

    if (!this.isActive) return newEnemies;

    // 出怪计时
    this.spawnTimer -= dt * 1000;
    if (this.spawnTimer <= 0 && this.spawnsRemaining.length > 0) {
      const spec = this.spawnsRemaining[0]!;
      // 生成一个敌人
      const enemy = createEnemy(spec.type, path);
      newEnemies.push(enemy);
      spec.count -= 1;
      if (spec.count <= 0) {
        this.spawnsRemaining.shift();
      }
      if (this.spawnsRemaining.length > 0) {
        this.spawnTimer = this.spawnsRemaining[0]!.interval;
      } else {
        this.spawnTimer = 0;
      }
    }

    return newEnemies;
  }

  /** 当前波次是否完成（已全部 spawn） */
  isWaveComplete(): boolean {
    return this.isActive && this.spawnsRemaining.length === 0;
  }

  /** 当前波次是否完全结束（已 spawn + 全部敌人已死/漏） */
  isWaveFullyComplete(activeEnemies: number): boolean {
    return this.isWaveComplete() && activeEnemies === 0;
  }

  /** 标记波次完成，进入 betweenWaves */
  completeCurrentWave(): void {
    this.isActive = false;
    this.currentIndex += 1;
    if (this.currentIndex >= this.waves.length) {
      this.finished = true;
    } else {
      this.betweenWaves = true;
      this.betweenTimer = CONFIG.WAVE.BETWEEN_WAVES;
    }
  }

  /** 关卡是否完成（全部波次通关） */
  isLevelComplete(): boolean {
    return this.finished;
  }

  /** 跳到下一关（关卡完成时返回 bonus） */
  getCurrentWaveBonus(): number {
    if (this.currentIndex === 0) return 0;
    return this.waves[this.currentIndex - 1]?.bonus ?? 0;
  }

  /** 当前波次 0-based 索引 */
  getDisplayWave(): number {
    return Math.min(this.currentIndex, this.waves.length);
  }

  /** 总波次 */
  get totalWaves(): number {
    return this.waves.length;
  }
}
