/**
 * Projectile 实体 - 塔发射的子弹
 *
 * 职责：
 * - 从 tower 位置飞向 target
 * - target 死亡时继续飞向 lastTargetPos
 * - 距离 < HIT_DISTANCE 时命中（status = 'hit'）
 */

import { CONFIG, type Enemy, type Point, type Projectile, type ProjectileEffect, type Tower } from '../../config';

let projIdCounter = 0;
function nextProjId(): string {
  return `proj_${++projIdCounter}_${Date.now()}`;
}

export interface CreateProjectileOptions {
  tower: Tower;
  target: Enemy;
  position: Point;
  damage: number;
  effect: ProjectileEffect;
  splashRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
}

export function createProjectile(opts: CreateProjectileOptions): Projectile {
  return {
    id: nextProjId(),
    towerType: opts.tower.type,
    position: { ...opts.position },
    target: opts.target,
    lastTargetPos: { ...opts.target.position },
    speed: CONFIG.COMBAT.PROJECTILE_SPEED,
    damage: opts.damage,
    effect: opts.effect,
    splashRadius: opts.splashRadius,
    slowFactor: opts.slowFactor,
    slowDuration: opts.slowDuration,
    status: 'flying',
  };
}

export class ProjectileImpl implements Projectile {
  id: string;
  towerType: import('../../config').TowerType;
  position: Point;
  target: Enemy;
  lastTargetPos: Point;
  speed: number;
  damage: number;
  effect: ProjectileEffect;
  splashRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  status: 'flying' | 'hit' | 'expired';

  constructor(p: Projectile) {
    this.id = p.id;
    this.towerType = p.towerType;
    this.position = { ...p.position };
    this.target = p.target;
    this.lastTargetPos = { ...p.lastTargetPos };
    this.speed = p.speed;
    this.damage = p.damage;
    this.effect = p.effect;
    this.splashRadius = p.splashRadius;
    this.slowFactor = p.slowFactor;
    this.slowDuration = p.slowDuration;
    this.status = p.status;
  }

  /** 每帧更新：飞向目标；命中则 status = 'hit' */
  update(dt: number): void {
    if (this.status !== 'flying') return;

    // 目标有效：跟踪；目标死亡：用 lastTargetPos
    let aim: Point;
    if (this.target.status === 'alive') {
      aim = this.target.position;
      this.lastTargetPos = { ...this.target.position };
    } else {
      aim = this.lastTargetPos;
    }

    const dx = aim.x - this.position.x;
    const dy = aim.y - this.position.y;
    const dist = Math.hypot(dx, dy);

    const moveDist = this.speed * dt;
    if (moveDist >= dist) {
      this.position.x = aim.x;
      this.position.y = aim.y;
      this.status = 'hit';
    } else {
      this.position.x += (dx / dist) * moveDist;
      this.position.y += (dy / dist) * moveDist;
    }
  }

  /** 是否命中 */
  hasHit(): boolean {
    return this.status === 'hit';
  }
}

/** 重置 Projectile（用于对象池） */
export function resetProjectile(p: Projectile): void {
  p.id = '';
  p.towerType = 'archer';
  p.position = { x: 0, y: 0 };
  // @ts-ignore - target will be reassigned
  p.target = null as any;
  p.lastTargetPos = { x: 0, y: 0 };
  p.speed = 0;
  p.damage = 0;
  p.effect = 'none';
  p.splashRadius = undefined;
  p.slowFactor = undefined;
  p.slowDuration = undefined;
  p.status = 'flying';
}
