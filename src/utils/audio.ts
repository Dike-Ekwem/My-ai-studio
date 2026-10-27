// Comprehensive Web Audio API Sound & Spatial Ambience Engine for UNDERGRAD
// Features: High-output master audio, multi-channel volume controls, procedural African exploration synth themes,
// sports matchday audio, environmental spatial ambience loops, and persistent settings.

export interface AudioSettings {
  masterVolume: number; // 0.0 - 1.0
  musicVolume: number;  // 0.0 - 1.0
  sfxVolume: number;    // 0.0 - 1.0
  ambienceVolume: number; // 0.0 - 1.0
  dialogueVolume: number; // 0.0 - 1.0
  isMuted: boolean;
}

const STORAGE_KEY = 'undergrad_audio_settings';

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  // Independent Channel Volumes (Substantially louder by default)
  public masterVolume: number = 0.95;
  public musicVolume: number = 0.85;
  public sfxVolume: number = 0.90;
  public ambienceVolume: number = 0.75;
  public dialogueVolume: number = 0.90;

  // Procedural Music State
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGainNodes: GainNode[] = [];
  private bgmInterval: number | null = null;
  public currentTheme: 'none' | 'menu' | 'campus' | 'sports' | 'night' = 'none';

  // Ambient Environment Audio Loop
  private ambienceSource: OscillatorNode | null = null;
  private ambienceGain: GainNode | null = null;
  private ambienceInterval: number | null = null;
  public currentAmbience: 'none' | 'day' | 'night' | 'market' = 'none';

  constructor() {
    this.loadSavedSettings();
  }

  private loadSavedSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AudioSettings>;
        if (parsed.masterVolume !== undefined) this.masterVolume = parsed.masterVolume;
        if (parsed.musicVolume !== undefined) this.musicVolume = parsed.musicVolume;
        if (parsed.sfxVolume !== undefined) this.sfxVolume = parsed.sfxVolume;
        if (parsed.ambienceVolume !== undefined) this.ambienceVolume = parsed.ambienceVolume;
        if (parsed.dialogueVolume !== undefined) this.dialogueVolume = parsed.dialogueVolume;
        if (parsed.isMuted !== undefined) this.isMuted = parsed.isMuted;
      }
    } catch {}
  }

  public saveSettings() {
    try {
      const data: AudioSettings = {
        masterVolume: this.masterVolume,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        ambienceVolume: this.ambienceVolume,
        dialogueVolume: this.dialogueVolume,
        isMuted: this.isMuted
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  public initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Calculate effective channel volume
  private getEffectiveVol(channel: 'sfx' | 'music' | 'ambience' | 'dialogue'): number {
    if (this.isMuted) return 0;
    const base = this.masterVolume;
    switch (channel) {
      case 'sfx': return base * this.sfxVolume;
      case 'music': return base * this.musicVolume;
      case 'ambience': return base * this.ambienceVolume;
      case 'dialogue': return base * this.dialogueVolume;
    }
  }

  // ============================================================
  // PROCEDURAL INSTRUMENTAL BGM ENGINE (AFROBEAT & UNIVERSITY THEMES)
  // ============================================================
  public startProceduralTheme(theme: 'menu' | 'campus' | 'sports' | 'night') {
    if (this.currentTheme === theme) return;
    this.stopProceduralTheme();
    this.initCtx();
    if (!this.ctx) return;

    this.currentTheme = theme;
    const ctx = this.ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.getEffectiveVol('music') * 0.45, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.bgmGainNodes.push(masterGain);

    // Pentatonic scale frequencies in Hz (A African Pentatonic: A, C, D, E, G)
    const scale = [220, 261.63, 293.66, 329.63, 392.00, 440, 523.25, 587.33, 659.25, 783.99];
    let step = 0;

    // Rhythmic sequencer interval
    const tempoMs = theme === 'sports' ? 240 : theme === 'night' ? 620 : 360;

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || this.masterVolume <= 0 || this.musicVolume <= 0) return;
      const now = this.ctx.currentTime;

      // Bass note pulse on beat 1 & 3
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        const bassRoot = theme === 'night' ? 110 : theme === 'sports' ? 146.83 : 130.81;
        bassOsc.frequency.setValueAtTime(bassRoot, now);
        bassGain.gain.setValueAtTime(0.35 * this.getEffectiveVol('music'), now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(masterGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.38);
      }

      // Kalimba / Marimba melodic note
      const noteIdx = Math.floor(Math.sin(step * 0.7) * 4 + 4) % scale.length;
      const noteFreq = scale[noteIdx];
      const melodyOsc = this.ctx.createOscillator();
      const melodyGain = this.ctx.createGain();
      melodyOsc.type = 'sine';
      melodyOsc.frequency.setValueAtTime(noteFreq, now);

      melodyGain.gain.setValueAtTime(0.25 * this.getEffectiveVol('music'), now);
      melodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      melodyOsc.connect(melodyGain);
      melodyGain.connect(masterGain);
      melodyOsc.start(now);
      melodyOsc.stop(now + 0.3);

      step++;
    }, tempoMs);
  }

  public stopProceduralTheme() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.bgmOscillators.forEach((o) => {
      try { o.stop(); } catch {}
    });
    this.bgmOscillators = [];
    this.bgmGainNodes = [];
    this.currentTheme = 'none';
  }

  // ============================================================
  // SPATIAL ENVIRONMENTAL AMBIENCE
  // ============================================================
  public startAmbience(type: 'day' | 'night' | 'market') {
    if (this.currentAmbience === type) return;
    this.stopAmbience();
    this.initCtx();
    if (!this.ctx) return;

    this.currentAmbience = type;
    const ctx = this.ctx;

    // Periodic gentle environmental sounds (birds by day, crickets by night, market murmurs)
    this.ambienceInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || this.ambienceVolume <= 0) return;
      const now = this.ctx.currentTime;

      if (type === 'day') {
        // High soft bird chirp
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(2600, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(1900, now + 0.16);

        gain.gain.setValueAtTime(0.12 * this.getEffectiveVol('ambience'), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'night') {
        // Subtle nocturnal cricket chirp
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(4200, now);
        osc.frequency.setValueAtTime(4600, now + 0.04);

        gain.gain.setValueAtTime(0.08 * this.getEffectiveVol('ambience'), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    }, type === 'night' ? 1400 : 3200);
  }

  public stopAmbience() {
    if (this.ambienceInterval) {
      clearInterval(this.ambienceInterval);
      this.ambienceInterval = null;
    }
    this.currentAmbience = 'none';
  }

  // ============================================================
  // SOUND EFFECTS (LOUDER OUTPUT GAINS)
  // ============================================================
  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.24 * this.getEffectiveVol('sfx'), this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  public playCashPing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.setValueAtTime(1318.51, now + 0.1); // E6

      osc2.frequency.setValueAtTime(1975.53, now); // B6
      osc2.frequency.setValueAtTime(2637.02, now + 0.1); // E7

      gain.gain.setValueAtTime(0.55 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch {}
  }

  public playNotification() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.12); // A5

      gain.gain.setValueAtTime(0.6 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  public playKekeHorn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.14].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now + offset);
        gain.gain.setValueAtTime(0.48 * this.getEffectiveVol('sfx'), now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.13);
      });
    } catch {}
  }

  public playDoorOpen() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

      gain.gain.setValueAtTime(0.42 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.35 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  public playKick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

      gain.gain.setValueAtTime(0.75 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  public playWhistle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.18].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200, now + offset);
        osc.frequency.exponentialRampToValueAtTime(2450, now + offset + 0.07);

        gain.gain.setValueAtTime(0.7 * this.getEffectiveVol('sfx'), now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.14);
      });
    } catch {}
  }

  public playGoalCelebration() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major triumph
      chords.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.35 * this.getEffectiveVol('sfx'), now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + 1.25);
      });
    } catch {}
  }

  public playCrossbarHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

      gain.gain.setValueAtTime(0.6 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  public playNetSwish() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

      gain.gain.setValueAtTime(0.55 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  public playDribble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.09);

      gain.gain.setValueAtTime(0.5 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {}
  }

  public playBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);

      gain.gain.setValueAtTime(0.6 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch {}
  }

  public playTackle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

      gain.gain.setValueAtTime(0.65 * this.getEffectiveVol('sfx'), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  public playCheer() {
    this.playGoalCelebration();
  }

  public playCampusBell() {
    this.playNotification();
  }
}

export const sounds = new SoundManager();
