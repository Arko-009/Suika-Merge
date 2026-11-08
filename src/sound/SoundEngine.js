/**
 * VALKYRIE // AUDIO SYNTHESIZER ENGINE
 * Pure Web Audio API synthesis - zero external asset dependencies.
 * Provides ambient gaming soundscape, mechanical ticks, swooshes, 
 * warp frequencies, and celebration fanfare.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // start muted per browser autoplay policy
    this.hasInteracted = false;
    this.ambientGain = null;
    this.sfxGain = null;
    this.analyser = null;
    this.oscillators = [];
    this.filter = null;
    this.dataArray = new Uint8Array(32);
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master FX gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);

      // Ambient gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // Analyser for UI visualizers
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.sfxGain.connect(this.analyser);
      this.ambientGain.connect(this.analyser);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.isMuted) {
      this.sfxGain.gain.setTargetAtTime(0, now, 0.08);
      this.ambientGain.gain.setTargetAtTime(0, now, 0.1);
    } else {
      this.sfxGain.gain.setTargetAtTime(0.35, now, 0.08);
      this.ambientGain.gain.setTargetAtTime(0.12, now, 0.3);
      this.startAmbient();
      this.playChime();
    }
  }

  toggle() {
    this.setMuted(!this.isMuted);
    return !this.isMuted;
  }

  startAmbient() {
    if (!this.ctx || this.oscillators.length > 0) return;

    // Dark ethereal gaming chord: D2, A2, D3, F3 (Dark medieval D minor)
    const freqs = [73.42, 110.0, 146.83, 174.61];
    
    // Low pass filter with subtle modulation
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.filter.connect(this.ambientGain);

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtly detune for atmospheric chorus
      osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.18 / freqs.length, this.ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.filter);
      osc.start();
      this.oscillators.push(osc);
    });
  }

  // Soft mechanical tick for wheel / timer / dial
  playTick() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  // Low subtle whoosh for card scroll / 3D totem transition
  playWhoosh() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.09);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.18);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // Crisp haptic UI click
  playClick() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Harmonic chime on card/button hover
  playHover() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // E6

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.095);
  }

  // Majestic golden chime when activating sound or accepting quest
  playChime() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const notes = [587.33, 880.0, 1174.66, 1760.0]; // D5, A5, D6, A6 (Golden 5th)
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.001, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.95);
    });
  }

  // Deep warp pulse for accepting quest / ink dispersion
  playWarp() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.9);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.0);
  }

  // Triumphant RPG fanfare for waitlist join / level up
  playFanfare() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Medieval heroic fanfare: D4 -> F#4 -> A4 -> D5 -> F#5 -> A5
    const notes = [
      { f: 293.66, t: 0.00, d: 0.16 },
      { f: 369.99, t: 0.14, d: 0.16 },
      { f: 440.00, t: 0.28, d: 0.20 },
      { f: 587.33, t: 0.44, d: 0.65 },
      { f: 880.00, t: 0.46, d: 0.70 }
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.linearRampToValueAtTime(0.18, now + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  // Get live visualizer frequency byte data
  getByteFrequencyData() {
    if (!this.analyser || this.isMuted) {
      this.dataArray.fill(0);
      return this.dataArray;
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}

export const sound = new SoundEngine();

