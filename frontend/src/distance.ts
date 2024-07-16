import { Coordinates } from "./location";

// From https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
/**
 * Find the distance in meters between two points on the surface of a sphere
 *
 * @param coordA
 * @param coordB
 * @param radiusInMeters Defaults to the radius of the Earth
 * @returns
 */
export function metersBetweenCoords(
  coordA: Coordinates,
  coordB: Coordinates,
  radiusInMeters: number = 6_378_137,
): number {
  const dLat = toRadians(coordB.lat) - toRadians(coordA.lat);
  const dLon = toRadians(coordB.long) - toRadians(coordA.long);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(coordA.lat)) *
      Math.cos(toRadians(coordB.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusInMeters * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface Position {
  x: number;
  y: number;
}

export const METERS_PER_PIXEL = 8000;
export const SPEED_OF_SOUND_M_PER_S = 15_000;
export const SPEED_OF_SOUND_PIXEL_PER_MS =
  SPEED_OF_SOUND_M_PER_S / METERS_PER_PIXEL / 1000;

export function projectToPixels(
  startLocation: Coordinates,
  point: Coordinates,
): Position {
  let distance = metersBetweenCoords(startLocation, point);
  distance = Number.isNaN(distance) ? 0 : distance;
  const vector = normalize({
    x: startLocation.long - point.long,
    y: startLocation.lat - point.lat,
  });
  vector.x *= distance / METERS_PER_PIXEL;
  vector.y *= distance / METERS_PER_PIXEL;

  return vector;
}

export function normalize(val: Position): Position {
  const length = Math.sqrt(val.x ** 2 + val.y ** 2);
  return length === 0
    ? { x: 0, y: 0 }
    : {
        x: val.x / length,
        y: val.y / length,
      };
}
