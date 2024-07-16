export class AudioPlayer {
  private ctx: AudioContext;
  private keys: Map<Note, GainNode>;

  constructor() {
    this.ctx = new AudioContext();
    this.keys = new Map();
  }

  play(note: Note) {
    let gainNode = this.keys.get(note);
    if (gainNode == null) {
      gainNode = this.ctx.createGain();

      const oscillator = new OscillatorNode(this.ctx, {
        type: "sine",
        frequency: frequencies[note],
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
}

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

const frequencies: Record<Note, number> = {
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
