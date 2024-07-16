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
  radiusInMeters: number = 6_378_137
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
