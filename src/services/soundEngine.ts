class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public ambientEnabled: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientNoiseSource: AudioNode | null = null;

  constructor() {
    this.enabled = localStorage.getItem('focusaur_sound_enabled') !== 'false';
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('focusaur_sound_enabled', this.enabled ? 'true' : 'false');
    if (this.enabled) {
      this.playGentleChime(520, 0.1);
    }
    return this.enabled;
  }

  public toggleAmbientSound(): boolean {
    this.ambientEnabled = !this.ambientEnabled;
    this.initCtx();
    if (!this.ctx) return false;

    if (this.ambientEnabled) {
      this.startAmbientSound();
    } else {
      this.stopAmbientSound();
    }
    return this.ambientEnabled;
  }

  private startAmbientSound() {
    if (!this.ctx) return;
    try {
      // Create soothing pink-filtered warm natural rain/stream texture
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Gentle lowpass filter for soothing warm earth tone
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      // Low frequency soothing drone
      const drone = this.ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(108, this.ctx.currentTime); // 108Hz soothing grounding drone

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.012, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.035, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);
      drone.connect(droneGain);
      droneGain.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      whiteNoise.start();
      drone.start();
      this.ambientNoiseSource = whiteNoise;
    } catch (e) {
      console.warn('Ambient sound startup:', e);
    }
  }

  private stopAmbientSound() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          this.ambientGain?.disconnect();
          this.ambientGain = null;
        }, 500);
      } catch (e) {}
    }
  }

  public playTone(freq = 440, duration = 0.1, type: OscillatorType = 'sine', gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  public playGentleChime(freq = 520, duration = 0.08) {
    this.playTone(freq, duration, 'sine', 0.08);
  }

  public playSuccess() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.16, 'sine', 0.1), idx * 70);
    });
  }

  public playError() {
    if (!this.enabled) return;
    this.playTone(190, 0.2, 'triangle', 0.12);
  }

  public playSimonTone(index: number) {
    if (!this.enabled) return;
    // Calming pentatonic scale notes: F4, G4, A4, C5
    const freqs = [349.23, 392.0, 440.0, 523.25];
    this.playTone(freqs[index % freqs.length] || 400, 0.28, 'sine', 0.14);
  }
}

export const soundEngine = new SoundEngine();
