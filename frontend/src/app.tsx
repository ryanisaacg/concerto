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
      <h1> Concerto </h1>
      <p>
        Play bells in a shared world. Watch other people's notes, and hear them
        when they reach your location.
        <br />
        Use your location, input coordinates, or pick a city to play.
        <br />
        Mobile not well supported. Best experienced on desktop.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <LocationSelector setLocation={setCoords} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ textAlign: "center" }}> Pick an arbitrary city </h3>
          <button onClick={() => setCoords({ lat: 33.89, long: 35.5 })}>
            Beruit
          </button>
          <button onClick={() => setCoords({ lat: 40.69, long: -73.98 })}>
            Brooklyn
          </button>
          <button onClick={() => setCoords({ lat: 6.52, long: 3.37 })}>
            Lagos
          </button>
          <button onClick={() => setCoords({ lat: -37.81, long: 144.96 })}>
            Melbourne
          </button>
          <button onClick={() => setCoords({ lat: 19.43, long: -99.13 })}>
            Mexico City
          </button>
          <button onClick={() => setCoords({ lat: -1.2, long: 36.82 })}>
            Nairobi
          </button>
          <button onClick={() => setCoords({ lat: 28.7, long: 77.1 })}>
            New Delhi
          </button>
          <button onClick={() => setCoords({ lat: 48.86, long: 2.35 })}>
            Paris
          </button>
          <button onClick={() => setCoords({ lat: -23.55, long: -46.63 })}>
            São Paulo
          </button>
          <button onClick={() => setCoords({ lat: -33.44, long: -70.66 })}>
            Santiago
          </button>
          <button onClick={() => setCoords({ lat: 35.67, long: 139.65 })}>
            Tokyo
          </button>
          <button onClick={() => setCoords({ lat: 49.28, long: -123.12 })}>
            Vancouver
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
    const ws = new WebSocket("wss://concerto.ryanapisaacg.com");
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
      addNote(msg.lat, msg.long, msg.timestamp, NOTE_TO_COLOR[msg.note]);
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
    addNote(lat, long, timestamp, NOTE_TO_COLOR[note]);
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

const COLORS = [
  "red",
  "darkred",
  "orange",
  "saddlebrown",
  "hotpink",
  "yellow",
  "olive",
  "purple",
  "darkslateblue",
  "cadetblue",
  "darkslategrey",
  "turqoise",
];

const NOTE_TO_COLOR = Object.fromEntries(
  COLORS.map((color, i) => [NOTES[i], color]),
);
