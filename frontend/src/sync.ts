import { Coordinates } from "./location";
import { Note } from "./player";

export type Callback = (ping: ServerPing) => void;

export class SyncClient {
  socket: WebSocket;
  id: string;
  callbacks: Set<Callback>;
  coordinates: Coordinates;
  messages: ServerPing[];

  constructor(socket: WebSocket, id: string, coordinates: Coordinates) {
    this.socket = socket;
    this.id = id;
    this.socket.onmessage = (e) => this.message_recv(e);
    this.callbacks = new Set();
    this.coordinates = coordinates;
    this.messages = [];
  }

  static async connect(
    url: string,
    coordinates: Coordinates,
  ): Promise<SyncClient> {
    const socket = new WebSocket(url);
    const id = Math.random().toString(16).slice(2);
    const client = new SyncClient(socket, id, coordinates);
    await new Promise((resolve) => {
      socket.onopen = resolve;
    });
    socket.send(JSON.stringify({ coords: coordinates, id }));
    return client;
  }

  async play(note: Note): Promise<void> {
    this.socket.send(note);
  }

  subscribe(callback: Callback) {
    this.callbacks.add(callback);
    for (const message of this.messages) {
      callback(message);
    }
  }

  unsubscribe(callback: Callback) {
    this.callbacks.delete(callback);
  }

  private message_recv(e: MessageEvent) {
    const data: ServerPing = JSON.parse(e.data);
    for (const callback of this.callbacks) {
      callback(data);
    }
    this.messages.push(data);
  }
}

export interface ServerPing {
  id: string;
  coords: Coordinates;
  timestamp: number;
  note: Note;
}
