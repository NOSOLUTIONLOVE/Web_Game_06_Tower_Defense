/**
 * 泛型对象池 - 避免频繁创建/销毁
 *
 * 用法：
 *   const pool = new Pool(() => new Enemy(), 50);
 *   const e = pool.acquire();
 *   pool.release(e);
 */

export class Pool<T> {
  private factory: () => T;
  private reset: (item: T) => void;
  private items: T[] = [];
  private inUse: Set<T> = new Set();
  private maxSize: number;

  constructor(factory: () => T, reset: (item: T) => void, initialSize: number = 0, maxSize: number = 200) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    for (let i = 0; i < initialSize; i++) {
      this.items.push(factory());
    }
  }

  /** 获取一个对象 */
  acquire(): T {
    let item: T;
    if (this.items.length > 0) {
      item = this.items.pop()!;
    } else {
      item = this.factory();
    }
    this.inUse.add(item);
    return item;
  }

  /** 归还一个对象 */
  release(item: T): void {
    if (!this.inUse.has(item)) return;
    this.inUse.delete(item);
    this.reset(item);
    // 池满时丢弃最旧的空闲对象
    if (this.items.length < this.maxSize) {
      this.items.push(item);
    }
  }

  /** 获取当前使用中的对象数量 */
  get activeCount(): number {
    return this.inUse.size;
  }

  /** 获取池中空闲对象数量 */
  get freeCount(): number {
    return this.items.length;
  }
}
