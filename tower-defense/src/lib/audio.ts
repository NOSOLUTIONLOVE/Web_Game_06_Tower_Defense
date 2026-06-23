/**
 * AudioSystem - Web Audio API 音效合成
 *
 * - 首次播放时懒加载 AudioContext
 * - 提供 enable / disable 开关
 * - 全部为正弦波 / 三角波 / 锯齿波合成，无外部资源
 *
 * 塔防专属音效（9 种）：
 * - playPlace: 建塔（清脆放塔声）
 * - playUpgrade: 升级（上行三音阶）
 * - playSell: 出售（下行音）
 * - playShoot: 射击（archer / frost / cannon 三种）
 * - playHit: 击中（短促叮）
 * - playKill: 击杀（爆炸 thud）
 * - playWaveStart: 波次开始（警示音）
 * - playWin: 胜利（上行和弦）
 * - playLose: 失败（下行音）
 * - playClick: 通用点击
 */

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private masterGain: GainNode | null = null;

  private ensureCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      // 兼容性写法（Safari 旧版）
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return null;
      this.ctx = new AudioCtor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15;
      this.masterGain.connect(this.ctx.destination);
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setEnabled(b: boolean): void {
    this.enabled = b;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /** 切换音效开关，返回切换后的状态 */
  public toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * 唤醒 AudioContext（iOS Safari 需要用户交互后才能播放）
   */
  public resume(): void {
    const ctx = this.ensureCtx();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  }

  /** 建塔 - 清脆放塔声（800Hz，80ms，triangle） */
  public playPlace(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.04);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  /** 升级 - 上行三音 C5-E5-G5 */
  public playUpgrade(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.4, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  /** 出售 - 下行音（400→200Hz，150ms） */
  public playSell(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  /** 射击 - 按塔类型不同 */
  public playShoot(type: 'archer' | 'frost' | 'cannon'): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    if (type === 'archer') {
      // 短促嗖（1200→400Hz，60ms，sawtooth）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'frost') {
      // 冰晶（高频短促 2000→1000Hz，80ms，triangle）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else {
      // cannon: 低沉炮（200→80Hz，100ms，sawtooth）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  }

  /** 击中 - 短促叮（1500Hz，30ms，square） */
  public playHit(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1500;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }

  /** 击杀 - 爆炸 thud（80Hz → 200Hz，200ms，sawtooth） */
  public playKill(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  /** 波次开始 - 警示音 A-C-E（300ms，triangle） */
  public playWaveStart(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    const master = this.masterGain;

    const notes = [440, 523.25, 659.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.35, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  /** 胜利 - C-E-G-C 高八度（800ms，sine） */
  public playWin(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    const master = this.masterGain;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.4, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  }

  /** 失败 - 下行音 C-G-E-C 低八度（800ms，sawtooth） */
  public playLose(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130.81, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  }

  /** 通用点击（短 600Hz sine） */
  public playClick(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }
}
