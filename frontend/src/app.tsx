import { useState } from "preact/hooks";
import "./app.css";
import { Canvas } from "./canvas";
import { Coordinates, LocationSelector } from "./location";
import { metersBetweenCoords } from "./distance";

const points = [
  { x: 100, y: 100, color: "red", pings: [{ startTime: Date.now() }] },
];

export function App() {
  const [location, setLocation] = useState<Coordinates | null>(null);

  const brooklyn = { lat: 40.6782, long: -73.949997 };
  if (location != null) {
    console.log(location);
    console.log(metersBetweenCoords(location, brooklyn));
  }

  return (
    <>
      {location == null ? <LocationSelector setLocation={setLocation} /> : null}
      {location != null ? <Canvas points={points} /> : null}
    </>
  );
}
