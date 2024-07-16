import { useEffect, useRef, useState } from "preact/hooks";
import "./app.css";
import { Canvas, CanvasPoint } from "./canvas";
import { Coordinates, LocationSelector } from "./location";
import { metersBetweenCoords, projectToXY } from "./distance";
import { ServerPing, SyncClient } from "./sync";

export function App() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [syncClient, setSyncClient] = useState<SyncClient | null>(null);

  useEffect(() => {
    if (location == null) {
      return;
    }
    SyncClient.connect("ws://localhost:9003", location).then(setSyncClient);
  }, [location]);

  const brooklyn = { lat: 40.6782, long: -73.949997 };
  if (location != null) {
    console.log(location);
    console.log(metersBetweenCoords(location, brooklyn));
  }

  return (
    <>
      {syncClient == null ? (
        <LocationSelector setLocation={setLocation} />
      ) : null}
      {syncClient != null ? <SyncReady client={syncClient} /> : null}
    </>
  );
}

const WIDTH = 800;
const HEIGHT = 600;

function SyncReady({ client }: { client: SyncClient }) {
  const pointsRef = useRef<Map<string, CanvasPoint>>(new Map());

  useEffect(() => {
    const points = pointsRef.current;
    const callback = (ping: ServerPing) => {
      console.log(Date.now(), ping.timestamp);

      let point = points.get(ping.id);

      if (point == null) {
        const { x, y } = projectToXY(
          client.coordinates,
          ping.coords,
          WIDTH,
          HEIGHT,
        );
        point = {
          x,
          y,
          color: randomColor(),
          pings: [],
        };
        points.set(ping.id, point);
      }

      point.pings.push({ startTime: ping.timestamp });
    };
    client.subscribe(callback);
    return () => client.unsubscribe(callback);
  }, [client]);

  return (
    <>
      <button onClick={() => client.ping()}>Ping</button>
      <Canvas points={pointsRef.current} width={WIDTH} height={HEIGHT} />
    </>
  );
}

function randomColor(): string {
  const randomBetween = (min: number, max: number) =>
    min + Math.floor(Math.random() * (max - min + 1));
  const r = randomBetween(0, 255);
  const g = randomBetween(0, 255);
  const b = randomBetween(0, 255);
  return `rgb(${r},${g},${b})`;
}
