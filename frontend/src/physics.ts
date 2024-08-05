export const RADIUS = 3;
/**
 * Measured in sim units / ms
 */
export const NOTE_SPEED = 0.00027;
export const EARTH_ROTATION = 0.000001;
export const EARTH_TILT = (23.5 * Math.PI) / 180;

export interface Coordinates {
  lat: number;
  long: number;
}

export function arcDistanceBetweenCoords(
  coordA: Coordinates,
  coordB: Coordinates,
  radius: number,
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
  return radius * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
