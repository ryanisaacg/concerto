export class AudioPlayer {
  private ctx: AudioContext;
  private keys: Map<Note, GainNode>;

  constructor() {
    this.ctx = new AudioContext();
    this.keys = new Map();
  }

  init() {
    const gainNode = this.ctx.createGain();
    const oscillator = new OscillatorNode(this.ctx, {
      type: "sine",
      frequency: FREQUENCIES["C"],
    });
    oscillator.connect(gainNode);
    oscillator.start();

    gainNode.gain.value = 0;
    gainNode.connect(this.ctx.destination);
  }

  playNote(note: Note) {
    let gainNode = this.keys.get(note);
    if (gainNode == null) {
      gainNode = this.ctx.createGain();

      const oscillator = new OscillatorNode(this.ctx, {
        type: "sine",
        frequency: FREQUENCIES[note],
      });
      oscillator.connect(gainNode);
      oscillator.start();

      gainNode.connect(this.ctx.destination);
      this.keys.set(note, gainNode);
      gainNode.gain.value = 0.3;
    }

    gainNode.gain.cancelScheduledValues(this.ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.05,
      this.ctx.currentTime + 0.7,
    );
    gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
  }

  synthesizeBell(note: Note) {
    const gainNode = this.ctx.createGain();

    const baseFreq = FREQUENCIES[note];
    for (let i = 0; i < AMPLITUDES.length; i += 1) {
      const oscillator = new OscillatorNode(this.ctx, {
        type: "sine",
        frequency: baseFreq * BELL_DETUNE[i],
      });
      const freqGain = this.ctx.createGain();
      freqGain.gain.value = AMPLITUDES[i];
      oscillator.connect(freqGain);
      freqGain.connect(gainNode);
      oscillator.start();
    }

    gainNode.connect(this.ctx.destination);
    this.keys.set(note, gainNode);

    // bell parameters
    const attack = 0.1;
    const decay = 0.25;
    const release = 1.4;

    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(
      0.05,
      this.ctx.currentTime + attack + decay,
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      this.ctx.currentTime + attack + decay + release,
    );
  }
}

const AMPLITUDES = [1, 0.6, 0.4, 0.25, 0.2, 0.15];
const BELL_DETUNE = [1, 2, 3, 4.2, 5.4, 6.8];

export type Note =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

const FREQUENCIES: Record<Note, number> = {
  C: 261.63,
  "C#": 277.18,
  D: 293.66,
  "D#": 311.13,
  E: 329.63,
  F: 349.23,
  "F#": 369.99,
  G: 392,
  "G#": 415.3,
  A: 440,
  "A#": 466.16,
  B: 493.88,
};
