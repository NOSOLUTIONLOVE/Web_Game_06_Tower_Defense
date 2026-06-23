/**
 * EconomySystem - 金币 + 生命
 *
 * 职责：
 * - 追踪金币和生命
 * - 增减金币 / 扣血
 * - 判断能否负担得起某个价格
 */

import { CONFIG } from '../../config';

export class EconomySystem {
  gold: number;
  lives: number;
  startingGold: number;
  startingLives: number;

  constructor(startGold: number = CONFIG.ECONOMY.START_GOLD, startLives: number = CONFIG.ECONOMY.START_LIVES) {
    this.startingGold = startGold;
    this.startingLives = startLives;
    this.gold = startGold;
    this.lives = startLives;
  }

  /** 加金币 */
  addGold(amount: number): void {
    this.gold += amount;
  }

  /** 扣金币；金币不足时返回 false */
  spendGold(amount: number): boolean {
    if (this.gold < amount) return false;
    this.gold -= amount;
    return true;
  }

  /** 扣生命 */
  loseLife(): void {
    this.lives = Math.max(0, this.lives - 1);
  }

  /** 生命是否归零 */
  isDefeated(): boolean {
    return this.lives <= 0;
  }

  /** 能否负担得起 */
  canAfford(cost: number): boolean {
    return this.gold >= cost;
  }

  /** 通关得分 */
  calcScore(): number {
    return this.lives * 100 + this.gold;
  }

  /** 重置（重新开始一关） */
  reset(): void {
    this.gold = this.startingGold;
    this.lives = this.startingLives;
  }
}
