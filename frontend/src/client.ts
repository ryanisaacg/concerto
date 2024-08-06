import { Note } from "./player";

export class Client {
  private ws: WebSocket;
  private buffer: Array<PlayedNote> | null;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.buffer = [];
    this.ws.onopen = () => {
      for (const msg of this.buffer!) {
        this.ws.send(encode(msg));
      }
      this.buffer = null;
    };
  }

  send(message: PlayedNote): void {
    if (this.buffer == null) {
      this.ws.send(encode(message));
    } else {
      this.buffer.push(message);
    }
  }

  addListener(callback: Listener): CleanupHandle {
    const listener = (e: MessageEvent) => {
      callback(decode(e.data));
    };
    this.ws.addEventListener("message", listener);
    return () => this.ws.removeEventListener("message", listener);
  }
}

function encode(message: PlayedNote): string {
  return JSON.stringify(message);
}

function decode(val: string): PlayedNote {
  return JSON.parse(val);
}

export type PlayedNote = {
  lat: number;
  long: number;
  timestamp: number;
  note: Note;
};

type Listener = (message: PlayedNote) => void;
export type CleanupHandle = () => void;
