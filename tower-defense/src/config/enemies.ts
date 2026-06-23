/**
 * 5 种敌人配置
 *
 * 数值参考 PRD §4.2 F-17 + §8.1
 */

import type { EnemyData, EnemyType } from './index';

export const ENEMIES: Record<EnemyType, EnemyData> = {
  normal: {
    type: 'normal',
    name: 'Normal',
    hp: 100,
    speed: 60,
    reward: 10,
    size: 10,
    color: '#ef4444', // red-500
    isFlying: false,
  },
  fast: {
    type: 'fast',
    name: 'Fast',
    hp: 60,
    speed: 100,
    reward: 15,
    size: 9,
    color: '#facc15', // yellow-400
    isFlying: false,
  },
  heavy: {
    type: 'heavy',
    name: 'Heavy',
    hp: 300,
    speed: 30,
    reward: 25,
    size: 13,
    color: '#7c3aed', // violet-600
    isFlying: false,
  },
  flying: {
    type: 'flying',
    name: 'Flying',
    hp: 80,
    speed: 80,
    reward: 20,
    size: 11,
    color: '#06b6d4', // cyan-500
    isFlying: true,
  },
  boss: {
    type: 'boss',
    name: 'Boss',
    hp: 1000,
    speed: 25,
    reward: 100,
    size: 18,
    color: '#dc2626', // red-600
    isFlying: false,
  },
};

/** 获取敌人数据 */
export function getEnemyData(type: EnemyType): EnemyData {
  return ENEMIES[type];
}
