/**
 * CombatSystem - 战斗系统
 *
 * 职责：
 * - 塔选目标 + 攻击（生成 Projectile）
 * - 子弹飞行 + 命中
 * - 应用伤害 / 减速 / AOE
 * - 敌人漏怪 → 扣血
 * - 敌人死亡 → 加金币
 */

import type { Enemy, Projectile, ProjectileEffect, Tower, Point } from '../../config';
import { createProjectile } from '../entities/Projectile';
import type { EconomySystem } from './EconomySystem';

export interface CombatCallbacks {
  onEnemyKilled?: (enemy: Enemy) => void;
  onEnemyEscaped?: (enemy: Enemy) => void;
  onEnemyHit?: (enemy: Enemy, damage: number, effect: ProjectileEffect) => void;
  onTowerAttack?: (tower: Tower, target: Enemy) => void;
  onProjectileHit?: (proj: Projectile, hitPos: Point) => void;
}

export class CombatSystem {
  private callbacks: CombatCallbacks = {};

  setCallbacks(cb: CombatCallbacks): void {
    this.callbacks = cb;
  }

  /**
   * 主战斗循环
   * @param dt 帧时间（秒）
   * @param currentTime 当前游戏时间（秒）
   */
  combatTick(
    dt: number,
    currentTime: number,
    towers: Tower[],
    enemies: Enemy[],
    projectiles: Projectile[],
    economy: EconomySystem
  ): { killedEnemies: Enemy[]; escapedEnemies: Enemy[]; hitProjectiles: Projectile[] } {
    const killedEnemies: Enemy[] = [];
    const escapedEnemies: Enemy[] = [];
    const hitProjectiles: Projectile[] = [];

    // 1. 塔选目标 + 攻击
    for (const tower of towers) {
      tower.cooldown = Math.max(0, tower.cooldown - dt);
      if (tower.flashTime > 0) tower.flashTime = Math.max(0, tower.flashTime - dt);

      if (tower.cooldown > 0) continue;
      const target = this.findTarget(tower, enemies);
      if (target) {
        const proj = createProjectile({
          tower,
          target,
          position: tower.position,
          damage: tower.data.damage,
          effect: tower.data.effect,
          splashRadius: tower.data.splashRadius,
          slowFactor: tower.data.slowFactor,
          slowDuration: tower.data.slowDuration,
        });
        projectiles.push(proj);
        tower.cooldown = 1 / tower.data.attackSpeed;
        tower.target = target;
        tower.flashTime = 0.1;
        this.callbacks.onTowerAttack?.(tower, target);
      }
    }

    // 2. 子弹飞行 + 命中
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const proj = projectiles[i]!;
      // 飞行
      const aim: Point = proj.target.status === 'alive' ? proj.target.position : proj.lastTargetPos;
      if (proj.target.status === 'alive') {
        proj.lastTargetPos = { ...proj.target.position };
      }
      const dx = aim.x - proj.position.x;
      const dy = aim.y - proj.position.y;
      const dist = Math.hypot(dx, dy);
      const moveDist = proj.speed * dt;
      if (moveDist >= dist) {
        proj.position.x = aim.x;
        proj.position.y = aim.y;
        proj.status = 'hit';
      } else {
        proj.position.x += (dx / dist) * moveDist;
        proj.position.y += (dy / dist) * moveDist;
      }

      if (proj.status === 'hit') {
        hitProjectiles.push(proj);
        this.applyHit(proj, enemies, currentTime);
        this.callbacks.onProjectileHit?.(proj, proj.position);
        projectiles.splice(i, 1);
      }
    }

    // 3. 敌人移动 + 状态更新
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i]!;
      // 减速到期恢复
      if (e.slowFactor < 1 && currentTime >= e.slowEndTime) {
        e.slowFactor = 1;
      }
      if (e.hitFlashTime > 0) e.hitFlashTime = Math.max(0, e.hitFlashTime - dt);

      // 移动在 EnemyImpl.update 中处理（这里仅检测状态）
      if (e.status === 'dead') {
        economy.addGold(e.reward);
        killedEnemies.push(e);
        this.callbacks.onEnemyKilled?.(e);
        enemies.splice(i, 1);
      } else if (e.status === 'escaped') {
        economy.loseLife();
        escapedEnemies.push(e);
        this.callbacks.onEnemyEscaped?.(e);
        enemies.splice(i, 1);
      }
    }

    return { killedEnemies, escapedEnemies, hitProjectiles };
  }

  /** 找目标：射程内沿路径前进最远的敌人 */
  private findTarget(tower: Tower, enemies: Enemy[]): Enemy | null {
    let best: Enemy | null = null;
    let bestDist = -1;
    const r2 = tower.data.range * tower.data.range;
    for (const e of enemies) {
      if (e.status !== 'alive') continue;
      const dx = e.position.x - tower.position.x;
      const dy = e.position.y - tower.position.y;
      if (dx * dx + dy * dy > r2) continue;
      const pathDist = e.pathIndex + e.subPathProgress;
      if (pathDist > bestDist) {
        bestDist = pathDist;
        best = e;
      }
    }
    return best;
  }

  /** 应用子弹命中效果 */
  private applyHit(proj: Projectile, enemies: Enemy[], currentTime: number): void {
    // 目标伤害
    if (proj.target.status === 'alive') {
      const hpBefore = proj.target.hp;
      proj.target.takeDamage(proj.damage);
      const actualDmg = hpBefore - proj.target.hp;
      if (actualDmg > 0) {
        this.callbacks.onEnemyHit?.(proj.target, actualDmg, proj.effect);
      }
      // 减速
      if (proj.effect === 'slow' && proj.slowFactor && proj.slowDuration) {
        proj.target.applySlow(proj.slowFactor, proj.slowDuration, currentTime);
      }
    }

    // AOE
    if (proj.effect === 'splash' && proj.splashRadius) {
      const r2 = proj.splashRadius * proj.splashRadius;
      for (const e of enemies) {
        if (e === proj.target) continue;
        if (e.status !== 'alive') continue;
        const dx = e.position.x - proj.position.x;
        const dy = e.position.y - proj.position.y;
        if (dx * dx + dy * dy <= r2) {
          const hpBefore = e.hp;
          e.takeDamage(proj.damage);
          const actualDmg = hpBefore - e.hp;
          if (actualDmg > 0) {
            this.callbacks.onEnemyHit?.(e, actualDmg, proj.effect);
          }
        }
      }
    }
  }
}
