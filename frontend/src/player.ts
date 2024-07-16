export class AudioPlayer {
  private ctx: AudioContext;

  constructor() {
    this.ctx = new AudioContext();
  }

  note() {
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(1, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.1, this.ctx.currentTime + 0.7);
    gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);

    const oscillator = new OscillatorNode(this.ctx, {
      type: "sine",
    });
    oscillator.connect(gainNode);
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + 0.8);

    gainNode.connect(this.ctx.destination);
  }
}
