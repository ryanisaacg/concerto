import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { Visualizer } from "./visualizer";
import { VisualizerController } from "./visualizer-controller";
import { Client } from "./client";

export function App() {
  const visualizer = useRef<VisualizerController | null>(null);

  const client = useMemo(() => {
    const ws = new WebSocket("ws://localhost:9003");
    return new Client(ws);
  }, []);

  const addNote = useCallback(
    (lat: number, long: number, timestamp: number, color: number | string) => {
      visualizer.current?.addNote(lat, long, timestamp, color);
    },
    [visualizer],
  );

  useEffect(() => {
    const cleanup = client.addListener((msg) => {
      addNote(msg.lat, msg.long, msg.timestamp, "red");
    });
    return cleanup;
  }, [client, addNote]);

  const playNote = (lat: number, long: number) => {
    const timestamp = Date.now();
    addNote(lat, long, timestamp, "black");
    client.send({ lat, long, timestamp });
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Visualizer controller={visualizer} />
      <div>
        <button onClick={() => playNote(40.69, -73.98)}>Brooklyn</button>
        <button onClick={() => playNote(48.86, 2.35)}>Paris</button>
        <button onClick={() => playNote(28.7, 77.1)}>New Delhi</button>
        <button onClick={() => playNote(-37.81, 144.96)}>Melbourne</button>
        <button onClick={() => playNote(0, 0)}>Null Island</button>
      </div>
    </div>
  );
}
