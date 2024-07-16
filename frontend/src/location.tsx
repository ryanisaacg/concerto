import { useEffect, useState } from "preact/hooks";

export interface Coordinates {
  lat: number;
  long: number;
}

interface LocationSelectorProps {
  setLocation: (loc: Coordinates) => void;
}

export type LocationSelectionState =
  | "waiting"
  | "retrieved"
  | "denied"
  | "failed";

export function LocationSelector({ setLocation }: LocationSelectorProps) {
  const [selectionState, setSelectionState] =
    useState<LocationSelectionState>("waiting");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (navObject) => {
          setLocation({
            lat: navObject.coords.latitude,
            long: navObject.coords.longitude,
          });
          setSelectionState("retrieved");
        },
        (errObject) => {
          if (errObject.code == GeolocationPositionError.PERMISSION_DENIED) {
            setSelectionState("denied");
          } else {
            setSelectionState("failed");
          }
        },
      );
    } else {
      setSelectionState("failed");
    }
  }, [setLocation]);

  if (selectionState === "waiting") {
    return (
      <p>
        {" "}
        Waiting for geolocation... (if you deny permission you can enter
        lat/long manually){" "}
      </p>
    );
  } else if (selectionState === "retrieved") {
    return <p> Lat/long retrieved! </p>;
  } else {
    return (
      <>
        <p>
          {" "}
          Location retrieval{" "}
          {selectionState === "denied" ? "permission denied" : "failed"}. Enter
          manually below{" "}
        </p>
        <LatLongSelector setLocation={setLocation} />
      </>
    );
  }
}

function LatLongSelector({ setLocation }: LocationSelectorProps) {
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);

  return (
    <>
      <input
        value={lat}
        onChange={(e) => setLat(Number((e.target as HTMLInputElement).value))}
      />
      <input
        value={long}
        onChange={(e) => setLong(Number((e.target as HTMLInputElement).value))}
      />
      <button onClick={() => setLocation({ lat, long })}> Submit </button>
    </>
  );
}
