/**
 * Web Audio API manager supporting preloaded MP3s and procedural synthesized SFX fallbacks.
 */
export class SoundManager {
  constructor(soundBasePath = './assets/sounds') {
    this.soundBasePath = soundBasePath;
    this.isMuted = localStorage.getItem('suika_audio_muted') === 'true';
    this.audioContext = null;
    this.audioBuffers = new Map(); // level -> AudioBuffer
    this.audioElements = new Map(); // fallback Audio objects

    this.initAudioContext();
    this.preloadLevelSounds();
  }

  initAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.audioContext = new AudioContextClass();
    }
  }

  unlock() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  preloadLevelSounds() {
    for (let i = 0; i <= 13; i++) {
      const url = `${this.soundBasePath}/level_${i}.mp3`;
      // Pre-create Audio elements for instant playback
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.audioElements.set(i, audio);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('suika_audio_muted', this.isMuted ? 'true' : 'false');
    return !this.isMuted;
  }

  playLevelSound(level) {
    if (this.isMuted) return;
    this.unlock();

    const audio = this.audioElements.get(level);
    if (audio) {
      try {
        const clone = audio.cloneNode();
        clone.volume = Math.min(1.0, 0.45 + (level / 13) * 0.45);
        clone.play().catch(() => {
          // Autoplay policy or load fallback
          this.synthesizeMergeSound(level);
        });
        return;
      } catch (e) {
        // Fallback to Web Audio synthesis
      }
    }
    this.synthesizeMergeSound(level);
  }

  playDropSound() {
    if (this.isMuted) return;
    this.unlock();
    this.synthesizeDropSound();
  }

  playBounceSound(volume = 0.5) {
    if (this.isMuted) return;
    this.unlock();
    this.synthesizeBounceSound(volume);
  }

  // --- Procedural Web Audio Synthesizers ---

  synthesizeMergeSound(level) {
    if (!this.audioContext || this.audioContext.state === 'suspended') return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const baseFreq = 220 * Math.pow(1.09, level);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = level > 7 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  synthesizeDropSound() {
    if (!this.audioContext || this.audioContext.state === 'suspended') return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  synthesizeBounceSound(volume = 0.5) {
    if (!this.audioContext || this.audioContext.state === 'suspended') return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);

    gain.gain.setValueAtTime(0.12 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

