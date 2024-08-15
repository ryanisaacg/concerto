import { useEffect, useState } from "preact/hooks";

export interface Coordinates {
  lat: number;
  long: number;
}

interface LocationSelectorProps {
  setLocation: (loc: Coordinates) => void;
}

export type LocationSelectionState = "waiting" | "denied" | "failed";

export function LocationSelector({ setLocation }: LocationSelectorProps) {
  const [selectionState, setSelectionState] =
    useState<LocationSelectionState | null>(null);

  const tryGeolocation = () => {
    setSelectionState("waiting");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (navObject) => {
          setLocation({
            lat: navObject.coords.latitude,
            long: navObject.coords.longitude,
          });
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
  };

  return (
    <>
      <h3 style={{ textAlign: "center" }}> Use Your Location </h3>
      {selectionState === null ? (
        <>
          <button onClick={tryGeolocation}> Use my location </button>
          Your location will be transmitted anonymously alongside any notes you
          send. It will not be stored or saved anywhere.
        </>
      ) : selectionState === "waiting" ? (
        <p> Waiting for geolocation... </p>
      ) : (
        <p>
          Geolocation{" "}
          {selectionState === "denied" ? "permission denied" : "failed"}. Enter
          manually below{" "}
        </p>
      )}
      <LatLongSelector setLocation={setLocation} />
    </>
  );
}

function LatLongSelector({ setLocation }: LocationSelectorProps) {
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);

  return (
    <>
      <h3 style={{ textAlign: "center" }}> Enter Coordinates </h3>
      <label for="lat"> Latitude </label>
      <input
        value={lat}
        onChange={(e) => setLat(Number((e.target as HTMLInputElement).value))}
        placeholder="Latitude"
        label="lat"
      />
      <label for="long"> Longitude </label>
      <input
        value={long}
        onChange={(e) => setLong(Number((e.target as HTMLInputElement).value))}
        placeholder="Longitude"
        label="long"
      />
      <button onClick={() => setLocation({ lat, long })}> Submit </button>
    </>
  );
}
