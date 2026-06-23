/**
 * ParticleSystem - 粒子系统
 *
 * 职责：
 * - 生成各种粒子的 emit 方法
 * - 每帧更新所有粒子
 * - 渲染所有粒子到 Canvas
 */

import type { Particle, Point } from '../../config';
import { createParticle } from '../entities/Particle';

export class ParticleSystem {
  private particles: Particle[] = [];

  /** 获取当前活跃粒子数 */
  get count(): number {
    return this.particles.length;
  }

  /** 通用 emit */
  emit(position: Point, type: Particle['type'], count: number, color: string, speed: number, size: number, lifetime: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const v = Math.random() * speed;
      this.particles.push(
        createParticle({
          position: { ...position },
          velocity: { x: Math.cos(angle) * v, y: Math.sin(angle) * v },
          color,
          size,
          lifetime,
          type,
        })
      );
    }
  }

  /** 击中粒子（黄色 5 个） */
  emitHit(position: Point): void {
    this.emit(position, 'hit', 5, '#fbbf24', 80, 3, 0.3);
  }

  /** 死亡粒子（红色爆炸 15 个） */
  emitKill(position: Point): void {
    this.emit(position, 'kill', 15, '#ef4444', 120, 4, 0.6);
  }

  /** 建造粒子（绿+紫 10 个） */
  emitPlace(position: Point): void {
    this.emit(position, 'place', 6, '#10b981', 100, 3, 0.4);
    this.emit(position, 'place', 4, '#a855f7', 100, 3, 0.4);
  }

  /** 升级粒子（金色大爆炸 20 个） */
  emitUpgrade(position: Point): void {
    this.emit(position, 'upgrade', 20, '#facc15', 150, 4, 0.8);
  }

  /** 出售粒子（灰色散开 8 个） */
  emitSell(position: Point): void {
    this.emit(position, 'sell', 8, '#9ca3af', 90, 3, 0.4);
  }

  /** 每帧更新 */
  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.velocity.x *= 0.9;
      p.velocity.y *= 0.9;
      p.lifetime = Math.max(0, p.lifetime - dt);
      p.alpha = p.lifetime / p.maxLifetime;
      if (p.lifetime <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /** 渲染到 Canvas */
  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** 清空 */
  clear(): void {
    this.particles = [];
  }
}
