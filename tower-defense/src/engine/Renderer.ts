/**
 * Renderer - Canvas 2D 像素风渲染器（v2.0，框架无关）
 *
 * 设计要点：
 * - 像素风：每格 40px = 8x8 个 5px 像素块，用 fillRect 模拟像素颗粒
 * - 绘制顺序：背景 → 草地/装饰 → 路径 → 起点/终点 → 范围圈 → 建造预览 → 塔 → 敌人 → 子弹 → 粒子 → 浮动文字
 * - UI 覆盖层（菜单/暂停/结束/弹窗）由 React 渲染，不在 Canvas 内画
 * - DPR 适配：canvas 实际尺寸 = CSS 尺寸 * devicePixelRatio
 * - 离屏 sprite 缓存：塔和敌人预渲染为离屏 canvas，drawImage 提速
 *
 * 坐标系统：世界坐标（原点在 canvas 左上角）
 *   - 画布 640×480（16×12 格，每格 40px）
 */

import { CONFIG, type CellType, type Enemy, type Point, type Projectile, type TowerType } from '../config';
import { TOWERS } from '../config/towers';
import type { RenderSnapshot, DamageNumber } from './RenderSnapshot';

// 预渲染 sprite 缓存
interface SpriteCache {
  towers: Record<TowerType, Record<1 | 2 | 3, HTMLCanvasElement>>;
  enemies: Record<string, HTMLCanvasElement>;
  start: HTMLCanvasElement;
  end: HTMLCanvasElement;
  buildOk: HTMLCanvasElement;
  buildBad: HTMLCanvasElement;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private dpr: number;
  private sprites: SpriteCache;
  /** 路径缓存（避免重复创建） */
  private rangeDashOffset = 0;
  /** 帧计数（用于动画） */
  private frame = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;

    this.resize();
    this.sprites = this.createSprites();
  }

  /** 设置 canvas 实际尺寸 */
  resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = CONFIG.CANVAS.WIDTH * this.dpr;
    this.canvas.height = CONFIG.CANVAS.HEIGHT * this.dpr;
    this.canvas.style.width = `${CONFIG.CANVAS.WIDTH}px`;
    this.canvas.style.height = `${CONFIG.CANVAS.HEIGHT}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /** 主渲染 */
  render(snapshot: RenderSnapshot): void {
    this.frame++;
    this.rangeDashOffset = (this.rangeDashOffset + 0.5) % 8;

    const ctx = this.ctx;
    // 清屏
    ctx.fillStyle = CONFIG.COLORS.BG;
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    if (!snapshot.grid) return;

    // 1. 地图格
    this.drawGrid(snapshot);

    // 2. 路径
    this.drawPath(snapshot);

    // 3. 起点/终点
    this.drawEndpoints(snapshot);

    // 4. 选中塔的范围圈
    this.drawSelectedRange(snapshot);

    // 5. 建造预览
    this.drawBuildPreview(snapshot);

    // 6. 塔
    this.drawTowers(snapshot);

    // 7. 敌人
    this.drawEnemies(snapshot);

    // 8. 子弹
    this.drawProjectiles(snapshot);

    // 9. 粒子
    this.particlesRender(snapshot);

    // 10. 浮动文字
    this.drawDamageNumbers(snapshot.damageNumbers);

    // 11. FPS
    if (snapshot.fps > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${snapshot.fps} fps`, CONFIG.CANVAS.WIDTH - 4, 12);
    }
  }

  // ============================================
  // 地图绘制
  // ============================================

  private drawGrid(snapshot: RenderSnapshot): void {
    const ctx = this.ctx;
    const { cols, rows, cells } = snapshot.grid!;
    const CS = CONFIG.GRID.CELL_SIZE;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell: CellType = cells[y]![x]!;
        const px = x * CS;
        const py = y * CS;
        if (cell === 'path') {
          // 路径格（在下层 drawPath 中绘制中心高光）
          ctx.fillStyle = CONFIG.COLORS.PATH;
          ctx.fillRect(px, py, CS, CS);
          // 上下边暗化（营造路沿）
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.fillRect(px, py, CS, 2);
          ctx.fillRect(px, py + CS - 2, CS, 2);
        } else if (cell === 'grass') {
          // 草地
          ctx.fillStyle = CONFIG.COLORS.GRASS;
          ctx.fillRect(px, py, CS, CS);
          // 像素颗粒装饰（确定性噪声）
          const seed = (x * 73856093) ^ (y * 19349663);
          if ((seed & 0b11) === 0) {
            ctx.fillStyle = CONFIG.COLORS.GRASS_DARK;
            ctx.fillRect(px + ((seed >> 3) & 0b111) * 5, py + ((seed >> 6) & 0b111) * 5, 5, 5);
          }
          if ((seed & 0b111) === 0) {
            ctx.fillStyle = '#7ba96a';
            ctx.fillRect(px + 10, py + 25, 3, 3);
          }
        } else if (cell === 'blocked') {
          // 障碍（树/石头）
          ctx.fillStyle = CONFIG.COLORS.GRASS;
          ctx.fillRect(px, py, CS, CS);
          // 石头
          ctx.fillStyle = '#6b7280';
          ctx.fillRect(px + 10, py + 18, 20, 14);
          ctx.fillStyle = '#9ca3af';
          ctx.fillRect(px + 12, py + 20, 6, 4);
          ctx.fillStyle = '#4b5563';
          ctx.fillRect(px + 22, py + 26, 6, 4);
        }
      }
    }
  }

  private drawPath(snapshot: RenderSnapshot): void {
    if (snapshot.path.length < 2) return;
    const ctx = this.ctx;
    ctx.strokeStyle = CONFIG.COLORS.PATH_LIGHT;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(snapshot.path[0]!.x, snapshot.path[0]!.y);
    for (let i = 1; i < snapshot.path.length; i++) {
      ctx.lineTo(snapshot.path[i]!.x, snapshot.path[i]!.y);
    }
    ctx.stroke();
  }

  private drawEndpoints(snapshot: RenderSnapshot): void {
    if (!snapshot.level) return;
    const CS = CONFIG.GRID.CELL_SIZE;
    const start = snapshot.level.startCell;
    const end = snapshot.level.endCell;
    const startPx = { x: start.x * CS + CS / 2, y: start.y * CS + CS / 2 };
    const endPx = { x: end.x * CS + CS / 2, y: end.y * CS + CS / 2 };

    // 起点：绿色三角 + "S"
    this.drawSprite(this.sprites.start, startPx.x - 12, startPx.y - 12);
    // 终点：红色三角 + "E"
    this.drawSprite(this.sprites.end, endPx.x - 12, endPx.y - 12);
  }

  // ============================================
  // 范围圈 / 建造预览
  // ============================================

  private drawSelectedRange(snapshot: RenderSnapshot): void {
    // 选中已存在塔 → 显示其范围
    if (snapshot.selectedTowerId) {
      const t = snapshot.towers.find((x) => x.id === snapshot.selectedTowerId);
      if (t) {
        this.drawRangeCircle(t.position, t.data.range, true);
      }
      return;
    }
    // 选中塔类型 + 悬浮格 → 预览范围
    if (snapshot.selectedTowerType && snapshot.hoveredCell) {
      const range = this.getTowerRange(snapshot.selectedTowerType, 1);
      const world = {
        x: snapshot.hoveredCell.x * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
        y: snapshot.hoveredCell.y * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
      };
      this.drawRangeCircle(world, range, false);
    }
  }

  private drawRangeCircle(center: Point, radius: number, dashed: boolean): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = CONFIG.COLORS.RANGE;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (dashed) {
      ctx.strokeStyle = CONFIG.COLORS.RANGE_STROKE;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -this.rangeDashOffset;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private getTowerRange(type: TowerType, level: 1 | 2 | 3): number {
    return TOWERS[type][level].range;
  }

  private drawBuildPreview(snapshot: RenderSnapshot): void {
    if (!snapshot.hoveredCell || !snapshot.grid) return;
    if (!snapshot.selectedTowerType) return;
    if (snapshot.phase !== 'playing' && snapshot.phase !== 'betweenWaves') return;

    const ctx = this.ctx;
    const { x, y } = snapshot.hoveredCell;
    const CS = CONFIG.GRID.CELL_SIZE;
    const px = x * CS;
    const py = y * CS;

    ctx.fillStyle = snapshot.hoverBuildable ? CONFIG.COLORS.BUILD_OK : CONFIG.COLORS.BUILD_BAD;
    ctx.fillRect(px, py, CS, CS);

    if (snapshot.hoverBuildable) {
      // 绘制半透明塔身
      ctx.globalAlpha = 0.6;
      this.drawTowerSprite(snapshot.selectedTowerType, 1, px + CS / 2, py + CS / 2, true);
      ctx.globalAlpha = 1;
    }
  }

  // ============================================
  // 塔绘制
  // ============================================

  private drawTowers(snapshot: RenderSnapshot): void {
    for (const t of snapshot.towers) {
      this.drawTowerSprite(t.type, t.level, t.position.x, t.position.y, false, t.flashTime);
    }
  }

  private drawTowerSprite(
    type: TowerType,
    level: 1 | 2 | 3,
    cx: number,
    cy: number,
    ghost: boolean,
    flashTime = 0
  ): void {
    const sprite = this.sprites.towers[type][level];
    this.drawSprite(sprite, cx - 16, cy - 16);
    if (flashTime > 0 && !ghost) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = flashTime * 6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ============================================
  // 敌人绘制
  // ============================================

  private drawEnemies(snapshot: RenderSnapshot): void {
    for (const e of snapshot.enemies) {
      this.drawEnemy(e);
    }
  }

  private drawEnemy(e: Enemy): void {
    const sprite = this.sprites.enemies[e.type];
    let dx = e.position.x - 12;
    let dy = e.position.y - 12;
    // 飞行敌人向上偏移 4px
    if (e.isFlying) dy -= 4;
    this.drawSprite(sprite, dx, dy);

    // 血条
    this.drawHpBar(e);
  }

  private drawHpBar(e: Enemy): void {
    const ctx = this.ctx;
    const w = 24;
    const h = 4;
    const x = e.position.x - w / 2;
    const y = e.position.y - 18;
    ctx.fillStyle = CONFIG.COLORS.HP_BG;
    ctx.fillRect(x, y, w, h);
    const ratio = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = ratio > 0.5 ? CONFIG.COLORS.HP_FG : ratio > 0.25 ? '#facc15' : '#ef4444';
    ctx.fillRect(x, y, w * ratio, h);
    // 减速指示
    if (e.slowFactor < 1) {
      ctx.fillStyle = CONFIG.COLORS.TEXT_SLOW;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('❄', e.position.x, y - 2);
    }
  }

  // ============================================
  // 子弹 / 粒子
  // ============================================

  private drawProjectiles(snapshot: RenderSnapshot): void {
    const ctx = this.ctx;
    for (const p of snapshot.projectiles) {
      const color = this.getProjectileColor(p);
      // 拖尾
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, 4, 0, Math.PI * 2);
      ctx.fill();
      // 主体
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, 3, 0, Math.PI * 2);
      ctx.fill();
      // AOE 范围指示
      if (p.effect === 'splash' && p.splashRadius) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(p.position.x, p.position.y, p.splashRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  private getProjectileColor(p: Projectile): string {
    if (p.effect === 'splash') return '#f97316';
    if (p.effect === 'slow') return '#38bdf8';
    return '#10b981';
  }

  private particlesRender(snapshot: RenderSnapshot): void {
    const ctx = this.ctx;
    for (const p of snapshot.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.position.x - p.size / 2, p.position.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  // ============================================
  // 浮动伤害文字
  // ============================================

  private drawDamageNumbers(numbers: DamageNumber[]): void {
    const ctx = this.ctx;
    for (const n of numbers) {
      ctx.save();
      ctx.globalAlpha = n.alpha;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      if (n.type === 'damage') {
        ctx.fillStyle = '#000';
        ctx.fillText(`-${n.value}`, n.pos.x + 1, n.pos.y + 1);
        ctx.fillStyle = CONFIG.COLORS.TEXT_DAMAGE;
        ctx.fillText(`-${n.value}`, n.pos.x, n.pos.y);
      } else if (n.type === 'gold') {
        ctx.fillStyle = '#000';
        ctx.fillText(`+${n.value}`, n.pos.x + 1, n.pos.y + 1);
        ctx.fillStyle = CONFIG.COLORS.TEXT_GOLD;
        ctx.fillText(`+${n.value}`, n.pos.x, n.pos.y);
      } else if (n.type === 'slow') {
        ctx.fillStyle = CONFIG.COLORS.TEXT_SLOW;
        ctx.fillText('❄', n.pos.x, n.pos.y);
      } else if (n.type === 'splash') {
        ctx.fillStyle = CONFIG.COLORS.TEXT_SPLASH;
        ctx.fillText('💥', n.pos.x, n.pos.y);
      }
      ctx.restore();
    }
  }

  // ============================================
  // Sprite 预渲染
  // ============================================

  private createSprites(): SpriteCache {
    const towers = this.createTowerSprites();
    const enemies = this.createEnemySprites();
    return {
      towers,
      enemies,
      start: this.createEndpointSprite('S', CONFIG.COLORS.START),
      end: this.createEndpointSprite('E', CONFIG.COLORS.END),
      buildOk: this.createBuildPreviewSprite(true),
      buildBad: this.createBuildPreviewSprite(false),
    };
  }

  private createTowerSprites(): SpriteCache['towers'] {
    const TYPES: TowerType[] = ['archer', 'frost', 'cannon'];
    const out = {} as SpriteCache['towers'];
    for (const t of TYPES) {
      out[t] = {} as Record<1 | 2 | 3, HTMLCanvasElement>;
      for (const lv of [1, 2, 3] as const) {
        out[t][lv] = this.makeTowerSprite(t, lv);
      }
    }
    return out;
  }

  private makeTowerSprite(type: TowerType, level: 1 | 2 | 3): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d')!;
    // 关闭抗锯齿
    ctx.imageSmoothingEnabled = false;

    const baseColor = this.getTowerColor(type, level);
    const dark = this.shade(baseColor, -30);
    const light = this.shade(baseColor, 20);

    // 基座（4x4 像素方块 = 4px 每方块 → 32/8=4）
    const px = 4; // pixel size
    const baseY = 20;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 8; x++) {
        if (x === 0 || x === 7 || y === 2) {
          ctx.fillStyle = dark;
        } else {
          ctx.fillStyle = baseColor;
        }
        ctx.fillRect(x * px, baseY + y * px, px, px);
      }
    }

    if (type === 'archer') {
      // 三角屋顶
      for (let y = 0; y < 4; y++) {
        for (let x = 2 - y; x < 6 + y; x++) {
          ctx.fillStyle = y === 3 ? dark : baseColor;
          ctx.fillRect(x * px, 8 + y * px, px, px);
        }
      }
      // 弓（小竖线）
      ctx.fillStyle = light;
      ctx.fillRect(26, 6, 2, 6);
    } else if (type === 'frost') {
      // 六边形塔身
      for (let y = 0; y < 3; y++) {
        for (let x = 1; x < 7; x++) {
          const inHex = (y === 0 && (x === 2 || x === 5)) || (y === 1) || (y === 2 && x >= 2 && x <= 5);
          if (inHex) {
            ctx.fillStyle = y === 0 || y === 2 ? dark : baseColor;
            ctx.fillRect(x * px, 8 + y * px, px, px);
          }
        }
      }
      // 雪花标志
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(13, 11, 2, 2);
      ctx.fillRect(17, 11, 2, 2);
      ctx.fillRect(15, 9, 2, 2);
      ctx.fillRect(15, 13, 2, 2);
    } else {
      // cannon: 圆形 + 炮管
      ctx.beginPath();
      ctx.arc(16, 14, 10, 0, Math.PI * 2);
      ctx.fillStyle = baseColor;
      ctx.fill();
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1;
      ctx.stroke();
      // 炮管（指向右）
      ctx.fillStyle = dark;
      ctx.fillRect(22, 12, 8, 4);
      ctx.fillStyle = light;
      ctx.fillRect(28, 12, 2, 4);
    }

    // 等级徽章（右上角 8x8）
    const badgeColors = ['#6b7280', '#3b82f6', '#facc15'];
    const bc = badgeColors[level - 1]!;
    ctx.fillStyle = '#000';
    ctx.fillRect(22, 0, 10, 10);
    ctx.fillStyle = bc;
    ctx.fillRect(23, 1, 8, 8);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(level), 27, 8);

    return c;
  }

  private getTowerColor(type: TowerType, level: 1 | 2 | 3): string {
    const map: Record<TowerType, [string, string, string]> = {
      archer: ['#10b981', '#059669', '#047857'],
      frost: ['#38bdf8', '#0ea5e9', '#0284c7'],
      cannon: ['#f97316', '#ea580c', '#c2410c'],
    };
    return map[type][level - 1]!;
  }

  private createEnemySprites(): Record<string, HTMLCanvasElement> {
    const types: Array<{ key: string; color: string; size: number; withWings?: boolean; withStripes?: boolean; withHorns?: boolean }> = [
      { key: 'normal', color: '#ef4444', size: 16 },
      { key: 'fast', color: '#facc15', size: 14 },
      { key: 'heavy', color: '#7c3aed', size: 20, withStripes: true },
      { key: 'flying', color: '#06b6d4', size: 14, withWings: true },
      { key: 'boss', color: '#dc2626', size: 24, withHorns: true },
    ];
    const out: Record<string, HTMLCanvasElement> = {};
    for (const t of types) {
      const c = document.createElement('canvas');
      c.width = 24;
      c.height = 24;
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      // 身体圆
      const r = t.size / 2;
      ctx.beginPath();
      ctx.arc(12, 12, r, 0, Math.PI * 2);
      ctx.fillStyle = t.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // 高光
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(10, 9, 2, 0, Math.PI * 2);
      ctx.fill();
      // 眼睛
      ctx.fillStyle = '#fff';
      ctx.fillRect(8, 10, 3, 3);
      ctx.fillRect(13, 10, 3, 3);
      ctx.fillStyle = '#000';
      ctx.fillRect(9, 11, 2, 2);
      ctx.fillRect(14, 11, 2, 2);
      // 重甲条纹
      if (t.withStripes) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(6, 14, 12, 2);
        ctx.fillRect(6, 17, 12, 1);
      }
      // 双翼
      if (t.withWings) {
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(2, 10, 4, 4);
        ctx.fillRect(18, 10, 4, 4);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(0, 8, 2, 2);
        ctx.fillRect(22, 8, 2, 2);
      }
      // Boss 角
      if (t.withHorns) {
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(6, 2, 2, 4);
        ctx.fillRect(16, 2, 2, 4);
      }
      out[t.key] = c;
    }
    return out;
  }

  private createEndpointSprite(letter: string, color: string): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 24;
    c.height = 24;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    // 圆角矩形背景
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(12, 12, 10, 0, Math.PI * 2);
    ctx.fill();
    // 字母
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 12, 13);
    return c;
  }

  private createBuildPreviewSprite(_ok: boolean): HTMLCanvasElement {
    // unused；保留接口
    return document.createElement('canvas');
  }

  private drawSprite(sprite: HTMLCanvasElement, x: number, y: number): void {
    if (!sprite.width) return;
    this.ctx.drawImage(sprite, x, y);
  }

  private shade(hex: string, amount: number): string {
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0xff) + amount;
    let b = (num & 0xff) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }
}
