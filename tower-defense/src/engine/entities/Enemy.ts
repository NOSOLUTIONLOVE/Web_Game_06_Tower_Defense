/**
 * Enemy 实体 - 沿路径前进的敌人
 *
 * 职责：
 * - 沿预计算的 path 移动
 * - 受伤 → 死亡 / 扣血
 * - 减速 → slowFactor 影响移动速度
 * - 到达终点 → 漏怪（扣生命）
 */

import type { Enemy, EnemyType, Point } from '../../config';
import { getEnemyData } from '../../config/enemies';

let enemyIdCounter = 0;
function nextEnemyId(): string {
  return `enemy_${++enemyIdCounter}_${Date.now()}`;
}

/**
 * 创建敌人
 * @param type 敌人类型
 * @param path 完整路径（含起点和终点）
 */
export function createEnemy(type: EnemyType, path: Point[]): Enemy {
  const data = getEnemyData(type);
  if (path.length === 0) {
    throw new Error('Path is empty, cannot create enemy');
  }

  // 创建一个可移动对象，添加 takeDamage / applySlow 方法
  const enemy: Enemy = {
    id: nextEnemyId(),
    type,
    data,
    hp: data.hp,
    maxHp: data.hp,
    position: { ...path[0]! },
    pathIndex: 0,
    subPathProgress: 0,
    reward: data.reward,
    status: 'alive',
    slowFactor: 1,
    slowEndTime: 0,
    hitFlashTime: 0,
    isFlying: data.isFlying,
    takeDamage(this: Enemy, amount: number) {
      this.hp -= amount;
      this.hitFlashTime = 0.08;
      if (this.hp <= 0) {
        this.hp = 0;
        this.status = 'dead';
      }
    },
    applySlow(this: Enemy, factor: number, duration: number, currentTime: number) {
      const endTime = currentTime + duration / 1000;
      if (endTime < this.slowEndTime) return;
      if (endTime - this.slowEndTime < 0.1 && factor >= this.slowFactor) return;
      this.slowFactor = Math.min(this.slowFactor, factor);
      this.slowEndTime = endTime;
    },
  };
  return enemy;
}

/**
 * 沿路径移动敌人（被 GameEngine 主循环调用）
 */
export function moveEnemy(e: Enemy, dt: number, path: Point[]): void {
  if (e.status !== 'alive') return;
  if (e.pathIndex >= path.length - 1) {
    e.status = 'escaped';
    return;
  }

  const speed = e.data.speed * e.slowFactor;
  let remaining = speed * dt;

  while (remaining > 0 && e.pathIndex < path.length - 1) {
    const target = path[e.pathIndex + 1]!;
    const dx = target.x - e.position.x;
    const dy = target.y - e.position.y;
    const dist = Math.hypot(dx, dy);

    if (e.subPathProgress + remaining >= dist) {
      remaining -= dist - e.subPathProgress;
      e.position.x = target.x;
      e.position.y = target.y;
      e.subPathProgress = 0;
      e.pathIndex += 1;
    } else {
      e.position.x = e.position.x + dx * (remaining / dist);
      e.position.y = e.position.y + dy * (remaining / dist);
      e.subPathProgress += remaining;
      remaining = 0;
    }
  }

  if (e.pathIndex >= path.length - 1) {
    e.status = 'escaped';
  }
}

/**
 * 每帧更新敌人状态：移动 + 减速衰减 + 闪白
 */
export function updateEnemy(e: Enemy, dt: number, currentTime: number, path: Point[]): void {
  if (e.status !== 'alive') return;
  // 减速到期恢复
  if (e.slowFactor < 1 && currentTime >= e.slowEndTime) {
    e.slowFactor = 1;
  }
  if (e.hitFlashTime > 0) e.hitFlashTime = Math.max(0, e.hitFlashTime - dt);
  // 沿路径移动
  moveEnemy(e, dt, path);
}

/** 重置 Enemy（用于对象池） */
export function resetEnemy(e: Enemy): void {
  e.id = '';
  e.type = 'normal';
  // @ts-ignore - data will be reassigned
  e.data = null as any;
  e.hp = 0;
  e.maxHp = 0;
  e.position = { x: 0, y: 0 };
  e.pathIndex = 0;
  e.subPathProgress = 0;
  e.reward = 0;
  e.status = 'alive';
  e.slowFactor = 1;
  e.slowEndTime = 0;
  e.hitFlashTime = 0;
  e.isFlying = false;
}
