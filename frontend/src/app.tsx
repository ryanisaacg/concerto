import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { Visualizer } from "./visualizer";
import { VisualizerController } from "./visualizer-controller";
import { Client } from "./client";
import { arcDistanceBetweenCoords, NOTE_SPEED, RADIUS } from "./physics";
import { AudioPlayer, Note } from "./player";
import { LocationSelector } from "./location";

export function App() {
  const [coords, setCoords] = useState<{ lat: number; long: number } | null>(
    null,
  );

  return coords ? (
    <RealApp coords={coords} />
  ) : (
    <SetCoords setCoords={setCoords} />
  );
}

function SetCoords({
  setCoords,
}: {
  setCoords: (coords: { lat: number; long: number }) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3> Your Location </h3>
          <LocationSelector setLocation={setCoords} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3> Pick an arbitrary city </h3>
          <button onClick={() => setCoords({ lat: 40.69, long: -73.98 })}>
            Brooklyn
          </button>
          <button onClick={() => setCoords({ lat: 40.7, long: -74.04 })}>
            Jersey City
          </button>
          <button onClick={() => setCoords({ lat: 48.86, long: 2.35 })}>
            Paris
          </button>
          <button onClick={() => setCoords({ lat: 28.7, long: 77.1 })}>
            New Delhi
          </button>
          <button onClick={() => setCoords({ lat: -37.81, long: 144.96 })}>
            Melbourne
          </button>
          <button onClick={() => setCoords({ lat: 0, long: 0 })}>
            Null Island
          </button>
        </div>
      </div>
    </div>
  );
}

function RealApp({ coords }: { coords: { lat: number; long: number } }) {
  const visualizer = useRef<VisualizerController | null>(null);
  const player = useMemo(() => new AudioPlayer(), []);

  const client = useMemo(() => {
    const ws = new WebSocket("ws://35.209.117.175/");
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
      console.log(msg);
      addNote(msg.lat, msg.long, msg.timestamp, "red");
      const noteDistance = arcDistanceBetweenCoords(coords, msg, RADIUS);
      const time = (noteDistance / NOTE_SPEED) * 2;
      const skew = Date.now() - msg.timestamp;
      const timeout = time - skew;
      if (timeout > 0) {
        setTimeout(() => player.synthesizeBell(msg.note), timeout);
      }
    });
    return cleanup;
  }, [client, coords, addNote]);

  const playNote = (note: Note) => {
    const timestamp = Date.now();
    const { lat, long } = coords;
    addNote(lat, long, timestamp, "black");
    client.send({ lat, long, timestamp, note });
    player.synthesizeBell(note);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        width: "100vw",
        gap: 32,
      }}
      onMouseDown={() => player.init()}
    >
      <Visualizer controller={visualizer} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        ({coords.lat}, {coords.long})
        {NOTES.map((note) => (
          <button onClick={() => playNote(note)}> Play {note} </button>
        ))}
      </div>
    </div>
  );
}

const NOTES: Note[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
