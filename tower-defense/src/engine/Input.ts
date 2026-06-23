/**
 * Input - 鼠标 / 键盘输入
 *
 * 鼠标：
 * - click canvas → onCellClick(格子)
 * - mousemove canvas → onCellHover(格子)
 * - contextmenu → onRightClick(格子)
 *
 * 键盘：
 * - 1/2/3 → 选择 archer/frost/cannon
 * - Space → pause/resume
 * - N → start next wave
 * - U → upgrade selected tower
 * - S → sell selected tower
 * - F → 2x speed
 * - Esc → clear selection
 *
 * 触屏：与鼠标事件统一
 */

import { CONFIG, type Point } from '../config';

export interface InputCallbacks {
  onCellClick?: (cell: Point) => void;
  onCellHover?: (cell: Point | null) => void;
  onRightClick?: (cell: Point) => void;

  // 键盘动作（GameEngine 自行处理时也通过这些）
  onSelectTowerType?: (type: 'archer' | 'frost' | 'cannon' | null) => void;
  onPause?: () => void;
  onStartNextWave?: () => void;
  onUpgradeSelected?: () => void;
  onSellSelected?: () => void;
  onToggleSpeed?: () => void;
  onClearSelection?: () => void;
}

export class Input {
  private canvas: HTMLCanvasElement | null = null;
  private callbacks: InputCallbacks = {};
  private bound = false;

  // 事件处理函数引用（用于 unbind）
  private handleClick = (e: MouseEvent): void => this.onClick(e);
  private handleMove = (e: MouseEvent): void => this.onMove(e);
  private handleLeave = (): void => this.onLeave();
  private handleContextMenu = (e: MouseEvent): void => this.onContextMenu(e);
  private handleKeyDown = (e: KeyboardEvent): void => this.onKeyDown(e);
  private handleTouchStart = (e: TouchEvent): void => this.onTouchStart(e);

  /** 绑定到 canvas + window */
  bind(callbacks: InputCallbacks, canvas: HTMLCanvasElement): void {
    if (this.bound) return;
    this.canvas = canvas;
    this.callbacks = callbacks;

    canvas.addEventListener('click', this.handleClick);
    canvas.addEventListener('mousemove', this.handleMove);
    canvas.addEventListener('mouseleave', this.handleLeave);
    canvas.addEventListener('contextmenu', this.handleContextMenu);
    canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    window.addEventListener('keydown', this.handleKeyDown);
    this.bound = true;
  }

  /** 解绑 */
  unbind(): void {
    if (!this.bound) return;
    if (this.canvas) {
      this.canvas.removeEventListener('click', this.handleClick);
      this.canvas.removeEventListener('mousemove', this.handleMove);
      this.canvas.removeEventListener('mouseleave', this.handleLeave);
      this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    this.bound = false;
    this.canvas = null;
    this.callbacks = {};
  }

  // ============================================
  // 鼠标 / 触屏 → 格子
  // ============================================

  private eventToCell(e: MouseEvent | Touch): Point {
    if (!this.canvas) return { x: 0, y: 0 };
    const rect = this.canvas.getBoundingClientRect();
    // 注意：renderer 的逻辑坐标 = canvas.width / dpr = CONFIG.CANVAS.WIDTH
    // 鼠标 clientX - rect.left = CSS 坐标，再 * (CONFIG.WIDTH / rect.width) = 逻辑坐标
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    const worldX = (cssX * CONFIG.CANVAS.WIDTH) / rect.width;
    const worldY = (cssY * CONFIG.CANVAS.HEIGHT) / rect.height;
    return {
      x: Math.floor(worldX / CONFIG.GRID.CELL_SIZE),
      y: Math.floor(worldY / CONFIG.GRID.CELL_SIZE),
    };
  }

  private onClick(e: MouseEvent): void {
    const cell = this.eventToCell(e);
    if (this.inBounds(cell)) {
      this.callbacks.onCellClick?.(cell);
    }
  }

  private onMove(e: MouseEvent): void {
    const cell = this.eventToCell(e);
    if (this.inBounds(cell)) {
      this.callbacks.onCellHover?.(cell);
    } else {
      this.callbacks.onCellHover?.(null);
    }
  }

  private onLeave(): void {
    this.callbacks.onCellHover?.(null);
  }

  private onContextMenu(e: MouseEvent): void {
    e.preventDefault();
    const cell = this.eventToCell(e);
    if (this.inBounds(cell)) {
      this.callbacks.onRightClick?.(cell);
    }
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0]!;
    const cell = this.eventToCell(touch);
    if (this.inBounds(cell)) {
      this.callbacks.onCellClick?.(cell);
      this.callbacks.onCellHover?.(cell);
    }
  }

  private inBounds(cell: Point): boolean {
    return (
      cell.x >= 0 &&
      cell.x < CONFIG.GRID.COLS &&
      cell.y >= 0 &&
      cell.y < CONFIG.GRID.ROWS
    );
  }

  // ============================================
  // 键盘
  // ============================================

  private onKeyDown(e: KeyboardEvent): void {
    // 在 input / textarea 中不拦截
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    switch (e.code) {
      case 'Digit1':
      case 'Numpad1':
        this.callbacks.onSelectTowerType?.('archer');
        e.preventDefault();
        break;
      case 'Digit2':
      case 'Numpad2':
        this.callbacks.onSelectTowerType?.('frost');
        e.preventDefault();
        break;
      case 'Digit3':
      case 'Numpad3':
        this.callbacks.onSelectTowerType?.('cannon');
        e.preventDefault();
        break;
      case 'Space':
        this.callbacks.onPause?.();
        e.preventDefault();
        break;
      case 'KeyN':
        this.callbacks.onStartNextWave?.();
        e.preventDefault();
        break;
      case 'KeyU':
        this.callbacks.onUpgradeSelected?.();
        e.preventDefault();
        break;
      case 'KeyS':
        this.callbacks.onSellSelected?.();
        e.preventDefault();
        break;
      case 'KeyF':
        this.callbacks.onToggleSpeed?.();
        e.preventDefault();
        break;
      case 'Escape':
        this.callbacks.onClearSelection?.();
        e.preventDefault();
        break;
    }
  }
}
