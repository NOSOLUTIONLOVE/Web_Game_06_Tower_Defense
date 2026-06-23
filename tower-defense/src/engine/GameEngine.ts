/**
 * GameEngine - 游戏引擎编排器
 *
 * 职责：
 * - 加载关卡（地图 + 路径 + 波次）
 * - 主循环（RAF 60Hz 固定步长）
 * - 状态机（menu / levelSelect / playing / paused / betweenWaves / over / win）
 * - 公开 API（placeTower / upgradeTower / sellTower / togglePause / startWave / nextLevel / ...）
 * - 事件回调 → UI
 */

import { type GamePhase, type Level, type Point, type TimeScale, type Tower, type TowerType } from '../config';
import type { RenderSnapshot, DamageNumber } from './RenderSnapshot';
import { BUILTIN_LEVELS } from './levels/builtinLevels';
import { MapGrid } from './MapGrid';
import { PathFinder } from './PathFinder';
import { createTower } from './entities/Tower';
import { updateEnemy } from './entities/Enemy';
import { EconomySystem } from './systems/EconomySystem';
import { WaveSystem } from './systems/WaveSystem';
import { CombatSystem } from './systems/CombatSystem';
import { ParticleSystem } from './systems/ParticleSystem';
import { AudioSystem } from '../lib/audio';
import { TOWERS } from '../config/towers';
import { loadProgress, saveProgress, unlockNextLevel } from './levels/levelProgress';

class ProgressManager {
  private progress: ReturnType<typeof loadProgress>;

  constructor() {
    this.progress = loadProgress();
  }

  isUnlocked(levelId: number): boolean {
    return this.progress.unlocked.includes(levelId);
  }

  unlock(levelId: number): void {
    this.progress = unlockNextLevel(this.progress, levelId - 1, BUILTIN_LEVELS.length);
    saveProgress(this.progress);
  }

  setCleared(levelId: number): void {
    this.progress.cleared[levelId] = true;
    saveProgress(this.progress);
  }

  setBestScore(levelId: number, score: number): boolean {
    const current = this.progress.bestScore[levelId] ?? 0;
    if (score > current) {
      this.progress.bestScore[levelId] = score;
      saveProgress(this.progress);
      return true;
    }
    return false;
  }

  getBestScore(levelId: number): number {
    return this.progress.bestScore[levelId] ?? 0;
  }

  isCleared(levelId: number): boolean {
    return !!this.progress.cleared[levelId];
  }
}

const progressManager = new ProgressManager();

export interface GameEngineCallbacks {
  onPhaseChange?: (phase: GamePhase) => void;
  onStatsChange?: (stats: { gold: number; lives: number; wave: number; totalWaves: number }) => void;
  onTimeScaleChange?: (scale: TimeScale) => void;
  onLevelStart?: (level: Level) => void;
  onLevelWin?: (score: number, isNewBest: boolean) => void;
  onLevelLose?: () => void;
  onWaveStart?: (waveIndex: number) => void;
  onWaveComplete?: (waveIndex: number, bonus: number) => void;
  onTowerBuilt?: (tower: Tower) => void;
  onTowerUpgraded?: (tower: Tower) => void;
  onTowerSold?: (refund: number) => void;
  onError?: (msg: string) => void;
}

export class GameEngine {
  phase: GamePhase = 'menu';
  currentLevelId: number = 0;
  totalLevels: number = BUILTIN_LEVELS.length;
  timeScale: TimeScale = 1;
  gameTime: number = 0;

  level: Level | null = null;
  grid: MapGrid | null = null;
  path: Point[] = [];

  towers: Tower[] = [];
  enemies: import('../config').Enemy[] = [];
  projectiles: import('../config').Projectile[] = [];

  economy: EconomySystem = new EconomySystem();
  waveSystem: WaveSystem | null = null;
  combat: CombatSystem = new CombatSystem();
  particles: ParticleSystem = new ParticleSystem();
  audio: AudioSystem = new AudioSystem();

  /** UI 选中状态 */
  selectedCell: Point | null = null;
  selectedTowerId: string | null = null;
  selectedTowerType: TowerType | null = null;
  hoveredCell: Point | null = null;

  /** 浮动伤害/金币文字 */
  damageNumbers: DamageNumber[] = [];

  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedStep: number = 1 / 60;
  private prevPhase: GamePhase = 'menu';
  private callbacks: GameEngineCallbacks = {};
  private fpsCounter: { frames: number; last: number; value: number } = { frames: 0, last: 0, value: 0 };

  setCallbacks(cb: GameEngineCallbacks): void {
    this.callbacks = cb;
  }

  private setPhase(phase: GamePhase): void {
    if (this.phase === phase) return;
    this.phase = phase;
    this.callbacks.onPhaseChange?.(phase);
  }

  goToMenu(): void {
    this.stop();
    this.setPhase('menu');
  }

  goToLevelSelect(): void {
    this.stop();
    this.setPhase('levelSelect');
  }

  startLevel(id: number): void {
    if (id < 0 || id >= BUILTIN_LEVELS.length) {
      this.callbacks.onError?.(`Level ${id} not found`);
      return;
    }
    if (!progressManager.isUnlocked(id)) {
      this.callbacks.onError?.(`Level ${id} is locked`);
      return;
    }
    this.stop();
    this.currentLevelId = id;
    this.level = BUILTIN_LEVELS[id]!;
    this.grid = new MapGrid(this.level.cells, this.level.startCell, this.level.endCell);
    const rawPath = PathFinder.findPath(this.grid, this.level.startCell, this.level.endCell);
    this.path = rawPath.map((p) => this.grid!.cellToWorld(p));
    this.economy = new EconomySystem(this.level.startGold, this.level.startLives);
    this.waveSystem = new WaveSystem(this.level.waves);
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles.clear();
    this.damageNumbers = [];
    this.selectedCell = null;
    this.selectedTowerId = null;
    this.selectedTowerType = null;
    this.hoveredCell = null;
    this.gameTime = 0;
    this.timeScale = 1;
    this.setPhase('playing');
    this.callbacks.onLevelStart?.(this.level);
    this.callbacks.onStatsChange?.({
      gold: this.economy.gold,
      lives: this.economy.lives,
      wave: 0,
      totalWaves: this.waveSystem.totalWaves,
    });
    this.callbacks.onTimeScaleChange?.(this.timeScale);
    this.start();
  }

  start(): void {
    if (this.rafId !== null) return;
    this.lastFrameTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop = (now: number): void => {
    if (this.rafId === null) return;
    const elapsed = Math.min(0.1, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (this.phase === 'playing' || this.phase === 'betweenWaves') {
      this.accumulator += elapsed * this.timeScale;
      while (this.accumulator >= this.fixedStep) {
        this.tick(this.fixedStep);
        this.accumulator -= this.fixedStep;
      }
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  private tick(dt: number): void {
    if (!this.waveSystem || !this.level) return;
    this.gameTime += dt;
    const currentTime = this.gameTime;

    // 设置战斗回调
    this.combat.setCallbacks({
      onEnemyKilled: (enemy) => {
        this.particles.emitKill(enemy.position);
        this.audio.playKill();
        this.spawnDamageNumber(enemy.position, enemy.reward, 'gold');
      },
      onEnemyEscaped: () => {
        this.audio.playHit();
      },
      onEnemyHit: (enemy, damage, effect) => {
        this.particles.emitHit(enemy.position);
        this.spawnDamageNumber(enemy.position, damage, 'damage');
        if (effect === 'slow') this.spawnDamageNumber(enemy.position, 0, 'slow');
        if (effect === 'splash') this.spawnDamageNumber(enemy.position, 0, 'splash');
      },
      onTowerAttack: (tower) => {
        this.audio.playShoot(tower.type);
      },
      onProjectileHit: (proj) => {
        this.particles.emitHit(proj.position);
        if (proj.effect === 'splash') {
          this.particles.emitKill(proj.position);
        }
      },
    });

    // 1. 波次更新（生成敌人）
    if (this.phase === 'playing') {
      const newEnemies = this.waveSystem.update(dt, this.path);
      if (newEnemies.length > 0) {
        this.enemies.push(...newEnemies);
        if (this.waveSystem.started) {
          this.callbacks.onWaveStart?.(this.waveSystem.currentIndex + 1);
        }
      }
    }

    // 2. 敌人移动
    for (const e of this.enemies) {
      updateEnemy(e, dt, currentTime, this.path);
    }

    // 3. 战斗 tick
    this.combat.combatTick(dt, currentTime, this.towers, this.enemies, this.projectiles, this.economy);

    // 4. 粒子
    this.particles.update(dt);

    // 5. 浮动文字更新
    this.updateDamageNumbers(dt);

    // 5. 状态机推进
    if (this.phase === 'playing' && this.waveSystem.isWaveComplete() && this.enemies.length === 0) {
      const completedIdx = this.waveSystem.currentIndex;
      const bonus = this.waveSystem.getCurrentWaveBonus();
      this.waveSystem.completeCurrentWave();
      this.economy.addGold(bonus);
      this.callbacks.onWaveComplete?.(completedIdx + 1, bonus);
      this.callbacks.onStatsChange?.({
        gold: this.economy.gold,
        lives: this.economy.lives,
        wave: this.waveSystem.getDisplayWave(),
        totalWaves: this.waveSystem.totalWaves,
      });
      this.audio.playWaveStart();

      if (this.waveSystem.isLevelComplete()) {
        const score = this.economy.calcScore();
        const isNewBest = progressManager.setBestScore(this.currentLevelId, score);
        progressManager.setCleared(this.currentLevelId);
        if (this.currentLevelId + 1 < this.totalLevels) {
          progressManager.unlock(this.currentLevelId + 1);
        }
        this.setPhase('win');
        this.callbacks.onLevelWin?.(score, isNewBest);
        this.audio.playWin();
        this.stop();
      } else {
        this.setPhase('betweenWaves');
      }
    } else if (this.phase === 'betweenWaves' && !this.waveSystem.betweenWaves) {
      this.setPhase('playing');
    } else if (this.economy.isDefeated()) {
      this.setPhase('over');
      this.callbacks.onLevelLose?.();
      this.audio.playLose();
      this.stop();
    }
  }

  // ============================================
  // 公开 API
  // ============================================

  togglePause(): void {
    if (this.phase === 'playing' || this.phase === 'betweenWaves') {
      this.prevPhase = this.phase;
      this.setPhase('paused');
    } else if (this.phase === 'paused') {
      this.setPhase(this.prevPhase);
    }
  }

  toggleSpeed(): void {
    this.timeScale = this.timeScale === 1 ? 2 : 1;
    this.callbacks.onTimeScaleChange?.(this.timeScale);
  }

  startNextWave(): void {
    if (this.phase === 'playing' || this.phase === 'betweenWaves') {
      if (this.waveSystem) {
        if (this.waveSystem.betweenWaves) {
          this.waveSystem.betweenWaves = false;
          this.waveSystem.betweenTimer = 0;
        }
        this.waveSystem.startNextWave();
        this.setPhase('playing');
      }
    }
  }

  resetLevel(): void {
    this.startLevel(this.currentLevelId);
  }

  nextLevel(): void {
    if (this.currentLevelId + 1 < this.totalLevels) {
      this.startLevel(this.currentLevelId + 1);
    } else {
      this.goToLevelSelect();
    }
  }

  prevLevel(): void {
    if (this.currentLevelId > 0) {
      this.startLevel(this.currentLevelId - 1);
    }
  }

  placeTower(type: TowerType, cell: Point): Tower | null {
    if (this.phase !== 'playing' && this.phase !== 'betweenWaves') return null;
    if (!this.grid) return null;
    if (!this.grid.isBuildable(cell)) {
      this.callbacks.onError?.('Cannot build here');
      return null;
    }
    if (this.towers.some((t) => t.cellX === cell.x && t.cellY === cell.y)) {
      this.callbacks.onError?.('Tower already exists');
      return null;
    }
    const cost = TOWERS[type][1].cost;
    if (!this.economy.canAfford(cost)) {
      this.callbacks.onError?.('Not enough gold');
      return null;
    }
    this.economy.spendGold(cost);
    const tower = createTower(type, cell, 1);
    this.towers.push(tower);
    this.particles.emitPlace(tower.position);
    this.audio.playPlace();
    this.callbacks.onTowerBuilt?.(tower);
    this.callbacks.onStatsChange?.({
      gold: this.economy.gold,
      lives: this.economy.lives,
      wave: this.waveSystem?.getDisplayWave() ?? 0,
      totalWaves: this.waveSystem?.totalWaves ?? 0,
    });
    return tower;
  }

  upgradeTower(towerId: string): boolean {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) return false;
    if (tower.level >= 3) return false;
    const cost = tower.getUpgradeCost();
    if (cost === 0) return false;
    if (!this.economy.canAfford(cost)) {
      this.callbacks.onError?.('Not enough gold');
      return false;
    }
    this.economy.spendGold(cost);
    tower.upgrade();
    this.particles.emitUpgrade(tower.position);
    this.audio.playUpgrade();
    this.callbacks.onTowerUpgraded?.(tower);
    this.callbacks.onStatsChange?.({
      gold: this.economy.gold,
      lives: this.economy.lives,
      wave: this.waveSystem?.getDisplayWave() ?? 0,
      totalWaves: this.waveSystem?.totalWaves ?? 0,
    });
    return true;
  }

  sellTower(towerId: string): number {
    const idx = this.towers.findIndex((t) => t.id === towerId);
    if (idx === -1) return 0;
    const tower = this.towers[idx]!;
    const refund = tower.getSellValue();
    this.economy.addGold(refund);
    this.particles.emitSell(tower.position);
    this.towers.splice(idx, 1);
    this.audio.playSell();
    this.callbacks.onTowerSold?.(refund);
    this.callbacks.onStatsChange?.({
      gold: this.economy.gold,
      lives: this.economy.lives,
      wave: this.waveSystem?.getDisplayWave() ?? 0,
      totalWaves: this.waveSystem?.totalWaves ?? 0,
    });
    return refund;
  }

  // ============================================
  // 选择 / 鼠标交互 API
  // ============================================

  /** 选择塔类型（用于建造） */
  selectTowerType(type: TowerType | null): void {
    this.selectedTowerType = type;
    if (type) {
      this.selectedTowerId = null;
      this.selectedCell = null;
    }
  }

  /** 选中已建造的塔（用于升级/出售） */
  selectTower(towerId: string | null): void {
    this.selectedTowerId = towerId;
    if (towerId) {
      this.selectedTowerType = null;
      const t = this.towers.find((x) => x.id === towerId);
      this.selectedCell = t ? { x: t.cellX, y: t.cellY } : null;
    } else {
      this.selectedCell = null;
    }
  }

  /** 设置鼠标悬浮的格（来自 input） */
  setHoveredCell(cell: Point | null): void {
    this.hoveredCell = cell;
  }

  /**
   * 取消所有选择
   */
  clearSelection(): void {
    this.selectedCell = null;
    this.selectedTowerId = null;
    this.selectedTowerType = null;
  }

  /**
   * 处理 Canvas 点击（来自 input）
   * - 命中已有塔 → 选中该塔
   * - 命中空格 + 已选塔类型 → 建造
   * - 命中空格 + 无选中 → 清除选中
   */
  handleCellClick(cell: Point): void {
    if (this.phase !== 'playing' && this.phase !== 'betweenWaves') return;

    const towerHere = this.towers.find((t) => t.cellX === cell.x && t.cellY === cell.y);
    if (towerHere) {
      this.selectTower(towerHere.id);
      return;
    }

    if (this.selectedTowerType) {
      this.placeTower(this.selectedTowerType, cell);
      // 建造后保留塔类型，便于连续建造
      return;
    }

    this.clearSelection();
  }

  /** 当前悬浮格是否可建塔（renderer 用） */
  getHoverBuildable(): boolean {
    if (!this.hoveredCell || !this.grid) return false;
    if (this.phase !== 'playing' && this.phase !== 'betweenWaves') return false;
    if (this.selectedTowerType === null) return false;
    return this.grid.isBuildable(this.hoveredCell)
      && !this.towers.some((t) => t.cellX === this.hoveredCell!.x && t.cellY === this.hoveredCell!.y);
  }

  // ============================================
  // 浮动文字
  // ============================================

  private damageIdCounter = 0;
  private spawnDamageNumber(pos: Point, value: number, type: DamageNumber['type']): void {
    this.damageIdCounter += 1;
    this.damageNumbers.push({
      id: `dmg_${this.damageIdCounter}`,
      pos: { x: pos.x, y: pos.y - 8 },
      value,
      type,
      alpha: 1,
      age: 0,
      vy: -30,
    });
  }

  private updateDamageNumbers(dt: number): void {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const n = this.damageNumbers[i]!;
      n.age += dt;
      n.pos.y += n.vy * dt;
      n.alpha = Math.max(0, 1 - n.age / 1.0);
      if (n.alpha <= 0 || n.age > 1.0) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  // ============================================
  // 渲染快照
  // ============================================

  getRenderSnapshot(): RenderSnapshot {
    // FPS 计算
    const now = performance.now();
    this.fpsCounter.frames += 1;
    if (this.fpsCounter.last === 0) this.fpsCounter.last = now;
    if (now - this.fpsCounter.last >= 500) {
      this.fpsCounter.value = Math.round((this.fpsCounter.frames * 1000) / (now - this.fpsCounter.last));
      this.fpsCounter.frames = 0;
      this.fpsCounter.last = now;
    }

    return {
      phase: this.phase,
      timeScale: this.timeScale,
      level: this.level,
      grid: this.grid
        ? { cols: this.grid.cols, rows: this.grid.rows, cells: this.grid.cells }
        : null,
      path: this.path,
      towers: this.towers,
      enemies: this.enemies,
      projectiles: this.projectiles,
      particles: this.particles['particles'] as import('../config').Particle[],
      damageNumbers: this.damageNumbers,
      selectedCell: this.selectedCell,
      hoveredCell: this.hoveredCell,
      selectedTowerId: this.selectedTowerId,
      selectedTowerType: this.selectedTowerType,
      hoverBuildable: this.getHoverBuildable(),
      fps: this.fpsCounter.value,
    };
  }
}

export const gameEngine = new GameEngine();
