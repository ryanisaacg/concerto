import { useEffect, useRef, useState } from "preact/hooks";
import "./app.css";
import { Canvas, CanvasPoint } from "./canvas";
import { Coordinates, LocationSelector } from "./location";
import {
  metersBetweenCoords,
  projectToPixels,
  SPEED_OF_SOUND_M_PER_S,
} from "./distance";
import { ServerPing, SyncClient } from "./sync";
import { PianoRoll } from "./piano";
import { AudioPlayer, Note } from "./player";

export function App() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [syncClient, setSyncClient] = useState<SyncClient | null>(null);
  console.log("you are at ", location);

  useEffect(() => {
    if (location == null) {
      return;
    }
    SyncClient.connect("wss://three-carpets-build.loca.lt", location).then(
      setSyncClient,
    );
  }, [location]);

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
  const player = new AudioPlayer(); // TODO memo
  const onPianoPlay = (note: Note) => {
    player.play(note);
    client.play(note);
  };

  useEffect(() => {
    const points = pointsRef.current;

    points.set(client.id, {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      color: "black",
      pings: [],
    });

    const callback = (ping: ServerPing) => {
      let point = points.get(ping.id);

      if (point == null) {
        let { x, y } = projectToPixels(client.coordinates, ping.coords);
        x += WIDTH / 2;
        y += HEIGHT / 2;
        console.log(x, y);
        point = {
          x,
          y,
          color: ping.id === client.id ? "black" : randomColor(),
          pings: [],
        };
        points.set(ping.id, point);
      }

      point.pings.push({ startTime: ping.timestamp });

      if (ping.id != client.id) {
        const distanceM = metersBetweenCoords(client.coordinates, ping.coords);
        const timeToNoteS = distanceM / SPEED_OF_SOUND_M_PER_S;
        const playInMS = timeToNoteS * 1000 - (Date.now() - ping.timestamp);
        if (playInMS > 0) {
          console.log(`Playing ${ping.note} in ${playInMS}`);
          setTimeout(() => player.play(ping.note), playInMS);
        }
      }
    };
    client.subscribe(callback);
    return () => client.unsubscribe(callback);
  }, [client]);

  return (
    <>
      <Canvas
        points={pointsRef.current}
        width={WIDTH}
        height={HEIGHT}
        coords={client.coordinates}
      />
      <PianoRoll play={onPianoPlay} />
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
