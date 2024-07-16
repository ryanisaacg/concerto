import { RefObject } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { METERS_PER_PIXEL, SPEED_OF_SOUND_PIXEL_PER_MS } from "./distance";
import { Coordinates } from "./location";

interface CanvasProps {
  points: Map<string, CanvasPoint>;
  width: number;
  height: number;
  coords: Coordinates;
}

export interface CanvasPoint {
  x: number;
  y: number;
  color: string;
  pings: Ping[];
}

export interface Ping {
  startTime: number;
}

export function Canvas({ points, width, height, coords }: CanvasProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const ctx = useMemo(() => canvas?.getContext("2d"), [canvas]);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const isCancelled = { current: false };
    if (ctx && img) {
      const imgX = ((coords.long / 180 + 1) / 2) * img.width;
      const imgY = ((coords.lat / 90 + 1) / 2) * img.height;
      const ratio = (width * METERS_PER_PIXEL) / 40_075_000;
      const mapWidth = img.width * ratio;
      const mapHeight = img.height * ratio;
      const bounds = {
        x: img.width / 2 - imgX,
        y: img.width / 2 - imgY,
        width: mapWidth,
        height: mapHeight,
      };
      console.log(bounds);
      requestAnimationFrame(() =>
        render(ctx, points, isCancelled, img, bounds),
      );
    }

    return () => (isCancelled.current = true);
  }, [ctx, img, points]);

  return (
    <>
      <img
        ref={setImg}
        src="physical-world-map-hd.jpg"
        style={{ display: "none" }}
      />
      <canvas ref={setCanvas} width={width} height={height}>
        {" "}
      </canvas>
    </>
  );
}

const RADIUS = 3;

function render(
  ctx: CanvasRenderingContext2D,
  points: Map<string, CanvasPoint>,
  isCancelled: RefObject<boolean>,
  img: HTMLImageElement,
  region: { x: number; y: number; width: number; height: number },
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  /*ctx.drawImage(
    img,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height,
    );*/

  for (const point of points.values()) {
    ctx.fillStyle = point.color;
    ctx.strokeStyle = point.color;

    ctx.beginPath();
    ctx.arc(point.x, point.y, RADIUS, 0, 2 * Math.PI);
    ctx.fill();

    for (const ping of point.pings) {
      const elapsed = Date.now() - ping.startTime;
      const radius = elapsed * SPEED_OF_SOUND_PIXEL_PER_MS;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  if (!isCancelled.current) {
    requestAnimationFrame(() => render(ctx, points, isCancelled, img, region));
  }
}
