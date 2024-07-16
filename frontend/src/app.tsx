import { useState } from "preact/hooks";
import "./app.css";
import { Canvas } from "./canvas";
import { Coordinates, LocationSelector } from "./location";

const points = [
  { x: 100, y: 100, color: "red", pings: [{ startTime: Date.now() }] },
];

export function App() {
  const [location, setLocation] = useState<Coordinates | null>(null);

  return (
    <>
      {location == null ? <LocationSelector setLocation={setLocation} /> : null}
      {location != null ? <Canvas points={points} /> : null}
    </>
  );
}
