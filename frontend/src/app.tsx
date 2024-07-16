import { useEffect, useRef, useState } from "preact/hooks";
import "./app.css";
import { Canvas } from "./canvas";
import { Coordinates, LocationSelector } from "./location";
import { metersBetweenCoords } from "./distance";
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

function SyncReady({ client }: { client: SyncClient }) {
  const points = useRef([]);

  useEffect(() => {
    const callback = (ping: ServerPing) => {
      console.log(ping);
    };
    client.subscribe(callback);
    return () => client.unsubscribe(callback);
  }, [client]);

  return (
    <>
      <button onClick={() => client.ping()}>Ping</button>
      <Canvas points={points.current} />
    </>
  );
}
