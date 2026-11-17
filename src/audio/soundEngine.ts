/**
 * Procedural Web Audio Sound Synthesizer for IronVerse 3D
 * Generates realistic gym sounds, weight clanks, breathing, heartbeats, and music without external files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.8;
        this.sfxGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.25;
        this.musicGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.value = muted ? 0 : 0.8;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.value = muted ? 0 : 0.25;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Clank of heavy steel weight plates colliding or racking a barbell
   */
  public playMetalClank(heavy = true) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const frequencies = heavy ? [520, 840, 1310, 2480, 3950] : [780, 1220, 2100, 3600];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.75, t + (heavy ? 0.35 : 0.2));

      const initialVol = (0.25 / frequencies.length) * (heavy ? 1.2 : 0.8);
      gain.gain.setValueAtTime(initialVol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (heavy ? 0.45 : 0.25));

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + (heavy ? 0.5 : 0.3));
    });

    // Sub thump
    if (heavy) {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(95, t);
      subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.25);
      subGain.gain.setValueAtTime(0.4, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(t);
      subOsc.stop(t + 0.35);
    }
  }

  /**
   * Barbell heavy drop on deadlift rubber mat
   */
  public playBarbellDrop() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    // Heavy bass boom
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(140, t);
    boomOsc.frequency.exponentialRampToValueAtTime(25, t + 0.45);
    boomGain.gain.setValueAtTime(0.8, t);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    boomOsc.connect(boomGain);
    boomGain.connect(this.sfxGain);
    boomOsc.start(t);
    boomOsc.stop(t + 0.55);

    // Rubber slap
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);

    // Secondary plate rattle
    setTimeout(() => this.playMetalClank(false), 60);
  }

  /**
   * Rep completion chime
   */
  public playRepSuccess(isPR = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const notes = isPR ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0, t + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.45);
    });
  }

  /**
   * Heavy breathing audio cue (inhale / exhale)
   */
  public playBreathing(inhale = true) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    if (inhale) {
      filter.frequency.setValueAtTime(250, t);
      filter.frequency.exponentialRampToValueAtTime(750, t + 0.45);
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    } else {
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(280, t + 0.4);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  /**
   * Heartbeat pulse for high strain / max effort
   */
  public playHeartbeat() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    // Lub-dub double beat
    [0, 0.12].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 65 : 55, t + offset);
      osc.frequency.exponentialRampToValueAtTime(25, t + offset + 0.15);

      gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.25, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + offset);
      osc.stop(t + offset + 0.2);
    });
  }

  /**
   * Crowd cheering for Competition / PR
   */
  public playCheer() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const dur = 2.2;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  /**
   * UI Click
   */
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Toggle background gym workout music synthesizer (punchy synth bass & high-energy workout pulse)
   */
  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public isMusicOn(): boolean {
    return this.isMusicPlaying;
  }

  public startMusic() {
    const ctx = this.getContext();
    if (!ctx || this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // 126 BPM high energy electronic beat
    const bpm = 126;
    const stepTime = (60 / bpm) / 4; // 16th note
    let step = 0;

    const bassNotes = [110, 110, 110, 130.8, 98, 98, 110, 146.8]; // A2, C3, G2, D3

    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted || !this.musicGain) return;
      const t = ctx.currentTime;

      // Kick drum on 1, 5, 9, 13
      if (step % 4 === 0) {
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(130, t);
        kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.15);
        kickGain.gain.setValueAtTime(0.25, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.2);
      }

      // Hi-hat on offbeats
      if (step % 2 === 1) {
        const hhOsc = ctx.createOscillator();
        const hhGain = ctx.createGain();
        hhOsc.type = 'highpass' as unknown as OscillatorType;
        // noise approximation
        hhOsc.type = 'square';
        hhOsc.frequency.setValueAtTime(6000 + Math.random() * 2000, t);
        hhGain.gain.setValueAtTime(0.03, t);
        hhGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        hhOsc.connect(hhGain);
        hhGain.connect(this.musicGain);
        hhOsc.start(t);
        hhOsc.stop(t + 0.06);
      }

      // Bass synth line
      if (step % 2 === 0) {
        const noteIdx = Math.floor(step / 4) % bassNotes.length;
        const freq = bassNotes[noteIdx];
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(freq, t);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(200, t + 0.12);

        bassGain.gain.setValueAtTime(0.12, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(t);
        bassOsc.stop(t + 0.16);
      }

      step = (step + 1) % 32;
    }, stepTime * 1000);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundEngine();
