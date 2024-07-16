import "./app.css";
import { Canvas } from "./canvas";

const points = [
  { x: 100, y: 100, color: "red", pings: [{ startTime: Date.now() }] },
];

export function App() {
  return (
    <>
      <Canvas points={points} />
    </>
  );
}
