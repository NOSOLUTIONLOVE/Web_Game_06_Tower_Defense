/**
 * Particle 实体 - 视觉特效粒子
 */

import type { Particle, Point } from '../../config';

export function createParticle(opts: {
  position: Point;
  velocity: Point;
  color: string;
  size: number;
  lifetime: number; // 秒
  type: Particle['type'];
}): Particle {
  return {
    position: { ...opts.position },
    velocity: { ...opts.velocity },
    color: opts.color,
    size: opts.size,
    alpha: 1,
    lifetime: opts.lifetime,
    maxLifetime: opts.lifetime,
    type: opts.type,
  };
}

export class ParticleImpl implements Particle {
  position: Point;
  velocity: Point;
  color: string;
  size: number;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  type: 'hit' | 'kill' | 'place' | 'upgrade' | 'sell';

  constructor(p: Particle) {
    this.position = { ...p.position };
    this.velocity = { ...p.velocity };
    this.color = p.color;
    this.size = p.size;
    this.alpha = p.alpha;
    this.lifetime = p.lifetime;
    this.maxLifetime = p.maxLifetime;
    this.type = p.type;
  }

  /** 更新位置 + 衰减 alpha + lifetime */
  update(dt: number): void {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.velocity.x *= 0.9; // 阻力
    this.velocity.y *= 0.9;
    this.lifetime = Math.max(0, this.lifetime - dt);
    this.alpha = this.lifetime / this.maxLifetime;
  }

  /** 是否消亡 */
  isDead(): boolean {
    return this.lifetime <= 0;
  }
}

export function resetParticle(p: Particle): void {
  p.position = { x: 0, y: 0 };
  p.velocity = { x: 0, y: 0 };
  p.color = '#ffffff';
  p.size = 0;
  p.alpha = 1;
  p.lifetime = 0;
  p.maxLifetime = 0;
  p.type = 'hit';
}
