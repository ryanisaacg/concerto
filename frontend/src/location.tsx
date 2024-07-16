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
    return <p> TODO: lat/long selector </p>;
  }
}
