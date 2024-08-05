import { useRef } from "preact/hooks";
import { Visualizer } from "./visualizer";
import { VisualizerController } from "./visualizer-controller";

export function App() {
  const visualizer = useRef<VisualizerController | null>(null);

  const addNote = (lat: number, long: number, color: number | string) => {
    visualizer.current?.addNote(lat, long, color);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Visualizer controller={visualizer} />
      <div>
        <button onClick={() => addNote(40.69, -73.98, 0x00ffaa)}>
          Brooklyn
        </button>
        <button onClick={() => addNote(48.86, 2.35, 0x00ffaa)}>Paris</button>
        <button onClick={() => addNote(28.7, 77.1, 0x00ffaa)}>New Delhi</button>
        <button onClick={() => addNote(-37.81, 144.96, 0x00ffaa)}>
          Melbourne
        </button>
        <button onClick={() => addNote(0, 0, "red")}>Null Island</button>
      </div>
    </div>
  );
}
